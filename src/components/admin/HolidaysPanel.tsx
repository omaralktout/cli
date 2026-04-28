'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, CalendarX, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Holiday, ApiResponse } from '@/types';
import { DAY_NAMES_AR } from '@/types';

export default function HolidaysPanel() {
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDate, setDeleteDate] = useState<string | null>(null);

  // New holiday form
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/holidays');
      const data: ApiResponse<Holiday[]> = await res.json();
      if (data.success && data.data) {
        setHolidays(data.data);
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في تحميل العطل', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDate) {
      toast({ title: 'خطأ', description: 'يرجى اختيار التاريخ', variant: 'destructive' });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, reason: newReason || null }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'تم الإضافة', description: 'تم إضافة العطلة بنجاح' });
        setNewDate('');
        setNewReason('');
        setDialogOpen(false);
        fetchHolidays();
      } else {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في إضافة العطلة', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDate) return;
    try {
      const res = await fetch(`/api/holidays?date=${deleteDate}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'تم الحذف', description: 'تم حذف العطلة بنجاح' });
        fetchHolidays();
      } else {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في حذف العطلة', variant: 'destructive' });
    } finally {
      setDeleteId(null);
      setDeleteDate(null);
    }
  };

  const upcomingHolidays = holidays.filter(
    (h) => new Date(h.date + 'T00:00:00') >= new Date(new Date().toISOString().split('T')[0] + 'T00:00:00')
  );

  const holidayDates = holidays.map((h) => new Date(h.date + 'T00:00:00'));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">إدارة العطل</h2>
          <p className="text-sm text-gray-500 mt-1">إضافة وحذف أيام العطل الرسمية</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer">
              <Plus className="w-4 h-4 ml-2" />
              إضافة عطلة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة يوم عطلة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>التاريخ</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1.5"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>السبب (اختياري)</Label>
                <Input
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="mt-1.5 text-right"
                  placeholder="مثال: عطلة رسمية"
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={adding || !newDate}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {adding ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar with holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              التقويم
            </h3>
            <div className="flex justify-center">
              <CalendarUI
                mode="multiple"
                selected={holidayDates}
                modifiers={{
                  holiday: holidayDates,
                }}
                modifiersClassNames={{
                  holiday: 'bg-red-100 text-red-600 rounded-full',
                }}
                className="rounded-xl border"
                locale={ar}
              />
            </div>
            <div className="flex items-center gap-2 mt-3 justify-center">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
              <span className="text-xs text-gray-500">أيام العطل</span>
            </div>
          </CardContent>
        </Card>

        {/* Holiday List */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarX className="w-5 h-5 text-red-500" />
              العطل القادمة ({upcomingHolidays.length})
            </h3>
            {upcomingHolidays.length === 0 ? (
              <div className="text-center py-8">
                <CalendarX className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">لا توجد عطل قادمة</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {upcomingHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-800" dir="ltr">
                          {format(new Date(holiday.date + 'T00:00:00'), 'dd/MM/yyyy')}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({DAY_NAMES_AR[new Date(holiday.date + 'T00:00:00').getDay()]})
                        </span>
                      </div>
                      {holiday.reason && (
                        <p className="text-xs text-red-600 mt-0.5">{holiday.reason}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-600 hover:bg-red-100 h-8 cursor-pointer"
                      onClick={() => {
                        setDeleteId(holiday.id);
                        setDeleteDate(holiday.date);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => { setDeleteId(null); setDeleteDate(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العطلة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه العطلة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
