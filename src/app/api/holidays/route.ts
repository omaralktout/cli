import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Holiday } from '@/types';

export async function GET() {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse<Holiday[]>>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS')) {
        return NextResponse.json<ApiResponse<Holiday[]>>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse<Holiday[]>>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<Holiday[]>>({
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
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { date, reason } = await request.json();

    if (!date) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'التاريخ مطلوب',
      }, { status: 400 });
    }

    // Check if holiday already exists
    const { data: existing } = await supabase
      .from('holidays')
      .select('id')
      .eq('date', date)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'هذا التاريخ مسجل بالفعل كعطلة',
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('holidays')
      .insert({ date, reason: reason || null })
      .select()
      .limit(1)
      .maybeSingle();

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS') || msg.includes('row-level')) {
        return NextResponse.json<ApiResponse<Holiday>>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse<Holiday>>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<Holiday>>({
      success: true,
      data,
      message: 'تم إضافة العطلة بنجاح',
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

    const date = request.nextUrl.searchParams.get('date');

    if (!date) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'التاريخ مطلوب',
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('holidays')
      .delete()
      .eq('date', date);

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
      message: 'تم حذف العطلة بنجاح',
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}
