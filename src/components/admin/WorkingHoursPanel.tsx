'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { WorkingHour, ApiResponse } from '@/types';
import { DAY_NAMES_AR } from '@/types';

interface DayConfig {
  id: string;
  day_of_week: number;
  is_working: boolean;
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
  is_active: boolean;
}

export default function WorkingHoursPanel() {
  const { toast } = useToast();
  const [days, setDays] = useState<DayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/working-hours');
      const data: ApiResponse<WorkingHour[]> = await res.json();
      if (data.success && data.data) {
        setDays(
          data.data.map((d) => ({
            ...d,
            break_start: d.break_start || '',
            break_end: d.break_end || '',
          }))
        );
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في تحميل أوقات العمل', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (index: number, field: keyof DayConfig, value: string | boolean) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Auto-enable when setting times
      if (field === 'start_time' || field === 'end_time') {
        if (value && !updated[index].is_working) {
          updated[index].is_working = true;
        }
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = days.map((d) => ({
        ...d,
        break_start: d.break_start || null,
        break_end: d.break_end || null,
      }));
      const res = await fetch('/api/working-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'تم الحفظ', description: 'تم تحديث أوقات العمل بنجاح' });
      } else {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في حفظ أوقات العمل', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">مواعيد العمل الأسبوعية</h2>
          <p className="text-sm text-gray-500 mt-1">حدد أوقات العمل لكل يوم</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {days.map((day, index) => (
          <Card key={day.id} className={`border-0 shadow-sm ${!day.is_working ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Day name & toggle */}
                <div className="flex items-center gap-3 sm:w-40 shrink-0">
                  <Switch
                    checked={day.is_working}
                    onCheckedChange={(checked) => updateDay(index, 'is_working', checked)}
                  />
                  <span className="font-semibold text-gray-800">{DAY_NAMES_AR[day.day_of_week]}</span>
                </div>

                {/* Time inputs */}
                {day.is_working && (
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">من</Label>
                      <Input
                        type="time"
                        value={day.start_time}
                        onChange={(e) => updateDay(index, 'start_time', e.target.value)}
                        className="w-32 text-sm"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">إلى</Label>
                      <Input
                        type="time"
                        value={day.end_time}
                        onChange={(e) => updateDay(index, 'end_time', e.target.value)}
                        className="w-32 text-sm"
                        dir="ltr"
                      />
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">استراحة من</Label>
                      <Input
                        type="time"
                        value={day.break_start}
                        onChange={(e) => updateDay(index, 'break_start', e.target.value)}
                        className="w-28 text-sm"
                        dir="ltr"
                        placeholder="--:--"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">إلى</Label>
                      <Input
                        type="time"
                        value={day.break_end}
                        onChange={(e) => updateDay(index, 'break_end', e.target.value)}
                        className="w-28 text-sm"
                        dir="ltr"
                        placeholder="--:--"
                      />
                    </div>
                    {(day.break_start || day.break_end) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={() => {
                          setDays((prev) => {
                            const updated = [...prev];
                            updated[index] = { ...updated[index], break_start: '', break_end: '' };
                            return updated;
                          });
                        }}
                      >
                        <X className="w-3.5 h-3.5 ml-1" />
                        مسح الاستراحة
                      </Button>
                    )}
                  </div>
                )}

                {!day.is_working && (
                  <span className="text-sm text-red-400">مغلق</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
