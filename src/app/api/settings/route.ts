import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, ClinicSettings } from '@/types';

export async function GET() {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse<ClinicSettings>>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json<ApiResponse<ClinicSettings>>({
        success: false,
        error: error?.message || 'لم يتم العثور على الإعدادات',
      }, { status: 404 });
    }

    // Exclude admin_password from response
    const { admin_password, ...settingsWithoutPassword } = data;

    return NextResponse.json<ApiResponse<typeof settingsWithoutPassword>>({
      success: true,
      data: settingsWithoutPassword,
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

    // Verify password
    const body = await request.json();
    const { admin_password, ...updateData } = body;

    if (!admin_password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'كلمة المرور مطلوبة',
      }, { status: 400 });
    }

    // Check password
    const { data: setting, error: fetchError } = await supabase
      .from('clinic_settings')
      .select('admin_password, id')
      .limit(1)
      .maybeSingle();

    if (fetchError || !setting) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'لم يتم العثور على الإعدادات',
      }, { status: 404 });
    }

    if (setting.admin_password !== admin_password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'كلمة المرور غير صحيحة',
      }, { status: 401 });
    }

    // Handle password change
    const updates: Record<string, unknown> = { ...updateData, updated_at: new Date().toISOString() };
    
    // If new_password is provided, update it
    if (body.new_password) {
      updates.admin_password = body.new_password;
    }

    const { data, error } = await supabase
      .from('clinic_settings')
      .update(updates)
      .eq('id', setting.id)
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
        error: 'فشل في تحديث الإعدادات - تحقق من صلاحيات قاعدة البيانات',
        needSetup: true,
      }, { status: 403 });
    }

    // Exclude password from response
    const { admin_password: _, ...result } = data;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: 'تم تحديث الإعدادات بنجاح',
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}
