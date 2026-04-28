import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Appointment } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse<Appointment[]>>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: true });

    if (date) {
      query = query.eq('appointment_date', date);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`patient_name.ilike.%${search}%,patient_phone.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS')) {
        return NextResponse.json<ApiResponse<Appointment[]>>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse<Appointment[]>>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<Appointment[]>>({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse<Appointment>>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { patient_name, patient_phone, appointment_date, appointment_time, notes } = await request.json();

    // Validation
    if (!patient_name || !patient_phone || !appointment_date || !appointment_time) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'جميع الحقول مطلوبة',
      }, { status: 400 });
    }

    // Check for existing appointment at the same date/time
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .neq('status', 'cancelled')
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'هذا الموعد محجوز بالفعل، يرجى اختيار موعد آخر',
      }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_name,
        patient_phone,
        appointment_date,
        appointment_time,
        status: 'confirmed',
        notes: notes || null,
      })
      .select()
      .limit(1)
      .maybeSingle();

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS') || msg.includes('row-level')) {
        return NextResponse.json<ApiResponse<Appointment>>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح من صفحة الإعداد',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse<Appointment>>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<Appointment>>({
      success: true,
      data,
      message: 'تم حجز الموعد بنجاح',
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'معرف الموعد والحالة مطلوبان',
      }, { status: 400 });
    }

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'حالة غير صالحة',
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .limit(1)
      .maybeSingle();

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS') || msg.includes('row-level')) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'لم يتم العثور على الموعد',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<Appointment>>({
      success: true,
      data,
      message: status === 'cancelled' ? 'تم إلغاء الموعد بنجاح - السلوت أصبح متاح' : 'تم تحديث الموعد بنجاح',
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'معرف الموعد مطلوب',
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS') || msg.includes('row-level')) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'تم حذف الموعد بنجاح - السلوت أصبح متاح',
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}
