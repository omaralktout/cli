import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'كلمة المرور مطلوبة',
      }, { status: 400 });
    }

    const { data: settings, error } = await supabase
      .from('clinic_settings')
      .select('admin_password')
      .limit(1)
      .maybeSingle();

    if (error || !settings) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'لم يتم العثور على الإعدادات',
      }, { status: 404 });
    }

    if (settings.admin_password !== password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'كلمة المرور غير صحيحة',
      }, { status: 401 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}
