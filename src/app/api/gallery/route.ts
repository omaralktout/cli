import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, GalleryImage } from '@/types';

export async function GET() {
  try {
    const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json<ApiResponse<GalleryImage[]>>({
        success: false,
        error: 'Supabase is not configured',
      }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS')) {
        return NextResponse.json<ApiResponse<GalleryImage[]>>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse<GalleryImage[]>>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<GalleryImage[]>>({
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

    const { image_url, caption, display_order } = await request.json();

    if (!image_url) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'رابط الصورة مطلوب',
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        image_url,
        caption: caption || null,
        display_order: display_order || 0,
        is_active: true,
      })
      .select()
      .limit(1)
      .maybeSingle();

    if (error) {
      const msg = error.message || '';
      if (msg.includes('policy') || msg.includes('RLS') || msg.includes('row-level')) {
        return NextResponse.json<ApiResponse<GalleryImage>>({
          success: false,
          error: 'خطأ في صلاحيات قاعدة البيانات - يرجى تشغيل SQL الإصلاح',
          needSetup: true,
        }, { status: 403 });
      }
      return NextResponse.json<ApiResponse<GalleryImage>>({
        success: false,
        error: msg,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<GalleryImage>>({
      success: true,
      data,
      message: 'تم إضافة الصورة بنجاح',
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

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'معرف الصورة مطلوب',
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('gallery_images')
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
      message: 'تم حذف الصورة بنجاح',
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'خطأ في الخادم',
    }, { status: 500 });
  }
}
