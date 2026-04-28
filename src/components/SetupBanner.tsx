'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Copy, Check, ExternalLink, RefreshCw, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SetupData {
  success: boolean;
  supabaseUrl: string;
  sql: string;
}

export default function SetupBanner() {
  const [visible, setVisible] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'ok' | 'error'>('pending');

  useEffect(() => {
    // Check if setup was already dismissed
    const wasDismissed = sessionStorage.getItem('setup-dismissed');
    if (wasDismissed) return;

    // Test if setup is needed by trying a write operation
    async function checkSetup() {
      try {
        const res = await fetch('/api/setup');
        const data = await res.json();
        setSetupData(data);
        if (data.success) {
          setVisible(true);
        }
      } catch {
        // Setup endpoint not available, hide banner
      }
    }
    checkSetup();
  }, []);

  const copySQL = async () => {
    if (!setupData?.sql) return;
    await navigator.clipboard.writeText(setupData.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const openSupabase = () => {
    if (setupData?.supabaseUrl) {
      const projectId = setupData.supabaseUrl.replace('https://', '').split('.')[0];
      window.open(`https://supabase.com/dashboard/project/${projectId}/sql`, '_blank');
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult('pending');
    try {
      // Try to delete a non-existent appointment to test DELETE policy
      const res = await fetch('/api/appointments?id=00000000-0000-0000-0000-000000000000', {
        method: 'DELETE',
      });
      const data = await res.json();
      // If it's a "not found" or success, policies are working
      if (res.ok || data.message) {
        setTestResult('ok');
      } else if (data.error?.includes('policy') || data.error?.includes('RLS')) {
        setTestResult('error');
      } else {
        // Other errors (like not found) mean the policy worked
        setTestResult('ok');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem('setup-dismissed', 'true');
  };

  if (dismissed || !visible || !setupData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-amber-50 border-b border-amber-200 shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mt-0.5 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-amber-800 text-sm">تحتاج تشغيل SQL إصلاح الصلاحيات</h3>
            <p className="text-amber-700 text-xs mt-0.5">
              بعض العمليات (حذف، تعديل، إضافة) لا تعمل بسبب سياسات الأمان في قاعدة البيانات. اتبع الخطوات التالية:
            </p>

            {/* Steps */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={openSupabase}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                1. افتح Supabase SQL Editor
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={copySQL}
                className="text-xs h-7 gap-1 border-amber-300 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'تم النسخ!' : '2. انسخ SQL الإصلاح'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={testConnection}
                disabled={testing}
                className="text-xs h-7 gap-1 border-amber-300 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
                {testResult === 'ok' ? 'مشتغل!' : testResult === 'error' ? 'لا يزال يحتاج إصلاح' : '3. تحقق'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-7 text-amber-500 cursor-pointer"
              >
                إخفاء
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
