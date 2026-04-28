import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, SlotsResponse, WorkingHour, Appointment } from '@/types';
import { DAY_NAMES_AR } from '@/types';
import { generateTimeSlots } from '@/lib/slot-generator';

export async function GET(request: NextRequest) {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse<SlotsResponse>>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const date = request.nextUrl.searchParams.get('date');
    if (!date) {
      return NextResponse.json<ApiResponse<SlotsResponse>>({
        success: false,
        error: 'التاريخ مطلوب',
      }, { status: 400 });
    }

    // Get slot duration from settings
    const { data: settings, error: settingsError } = await supabase
      .from('clinic_settings')
      .select('slot_duration_minutes')
      .limit(1)
      .maybeSingle();

    if (settingsError || !settings) {
      return NextResponse.json<ApiResponse<SlotsResponse>>({
        success: false,
        error: 'لم يتم العثور على إعدادات العيادة',
      }, { status: 404 });
    }

    const slotDuration = settings.slot_duration_minutes || 30;

    // Get day of week
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // Get working hours for this day
    const { data: workingHours, error: whError } = await supabase
      .from('working_hours')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (whError) {
      return NextResponse.json<ApiResponse<SlotsResponse>>({
        success: false,
        error: whError.message,
      }, { status: 400 });
    }

    // Check if holiday
    const { data: holiday, error: holidayError } = await supabase
      .from('holidays')
      .select('reason')
      .eq('date', date)
      .limit(1)
      .maybeSingle();

    if (holidayError) {
      return NextResponse.json<ApiResponse<SlotsResponse>>({
        success: false,
        error: holidayError.message,
      }, { status: 400 });
    }

    // Get existing appointments for this date
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', date)
      .neq('status', 'cancelled');

    const result = await generateTimeSlots(
      workingHours as WorkingHour,
      slotDuration,
      date,
      (appointments || []) as Appointment[],
      DAY_NAMES_AR,
      holiday?.reason || undefined
    );

    return NextResponse.json<ApiResponse<SlotsResponse>>({
      success: true,
      data: result,
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}
