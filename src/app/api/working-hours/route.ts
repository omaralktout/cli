import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, WorkingHour } from '@/types';

export async function GET() {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse<WorkingHour[]>>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .order('day_of_week', { ascending: true });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS')) {
        return NextResponse.json<ApiResponse<WorkingHour[]>>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse<WorkingHour[]>>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<WorkingHour[]>>({
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

export async function PUT(request: NextRequest) {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const hours: WorkingHour[] = await request.json();

    if (!Array.isArray(hours)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'البيانات غير صالحة',
      }, { status: 400 });
    }

    // Update each day's working hours
    const results = await Promise.all(
      hours.map(async (hour) => {
        const { data, error } = await supabase
          .from('working_hours')
          .update({
            is_working: hour.is_working,
            start_time: hour.start_time,
            end_time: hour.end_time,
            break_start: hour.break_start || null,
            break_end: hour.break_end || null,
            is_active: hour.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', hour.id)
          .select()
          .limit(1)
          .maybeSingle();

        return { data, error };
      })
    );

    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      const msg = errors.map((e) => e.error?.message).join(', ');
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

    return NextResponse.json<ApiResponse<WorkingHour[]>>({
      success: true,
      data: results.map((r) => r.data).filter(Boolean) as WorkingHour[],
      message: 'تم تحديث أوقات العمل بنجاح',
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}
