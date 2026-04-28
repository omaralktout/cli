'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import type { ClinicSettings, ApiResponse } from '@/types';
import HeroSection from '@/components/patient/HeroSection';
import ClinicInfo from '@/components/patient/ClinicInfo';
import BookingSection from '@/components/patient/BookingSection';
import Footer from '@/components/patient/Footer';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SetupBanner from '@/components/SetupBanner';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AlertTriangle, Database, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function SupabaseNotConfigured() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="border-0 shadow-2xl max-w-lg w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">لم يتم إعداد قاعدة البيانات</h1>
          <p className="text-gray-500 mb-6 leading-relaxed">
            يرجى إعداد Supabase عن طريق إضافة المتغيرات التالية في ملف <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.env.local</code>:
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-left text-sm font-mono space-y-2 mb-6" dir="ltr">
            <p className="text-green-400">NEXT_PUBLIC_SUPABASE_URL=your-project-url</p>
            <p className="text-green-400">NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
          </div>
          <div className="flex items-center gap-2 text-amber-600 text-sm justify-center">
            <Database className="w-4 h-4" />
            <span>تأكد أيضاً من إنشاء الجداول المطلوبة في Supabase</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientView({ settings, loading }: { settings: ClinicSettings | null; loading: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection settings={settings} loading={loading} />
      <ClinicInfo settings={settings} loading={loading} />
      <BookingSection />
      <Footer settings={settings} />
    </div>
  );
}

export default function Home() {
  const {
    currentView,
    setCurrentView,
    isAdminLoggedIn,
  } = useAppStore();

  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [supabaseOk, setSupabaseOk] = useState(true);

  // Hash-based routing
  const handleHashChange = useCallback(() => {
    const hash = window.location.hash;
    if (hash === '#/admin') {
      if (isAdminLoggedIn) {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('admin-login');
      }
    } else {
      setCurrentView('patient');
    }
  }, [isAdminLoggedIn, setCurrentView]);

  useEffect(() => {
    // Check supabase
    if (!isSupabaseConfigured()) {
      setSupabaseOk(false);
      setLoadingSettings(false);
      return;
    }

    // Fetch settings
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data: ApiResponse<ClinicSettings> = await res.json();
        if (data.success && data.data) {
          setSettings(data.data as unknown as ClinicSettings);
        }
      } catch {
        // Settings not found - show defaults
      } finally {
        setLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  // Show setup message if Supabase not configured
  if (!supabaseOk) {
    return <SupabaseNotConfigured />;
  }

  // Render based on current view
  switch (currentView) {
    case 'admin-login':
      return <><SetupBanner /><AdminLogin /></>;
    case 'admin-dashboard':
      return <><SetupBanner /><AdminDashboard /></>;
    case 'patient':
    default:
      return <><SetupBanner /><PatientView settings={settings} loading={loadingSettings} /></>;
  }
}
