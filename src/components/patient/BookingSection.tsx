'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import type { TimeSlot, SlotsResponse, ApiResponse } from '@/types';
import { DAY_NAMES_AR } from '@/types';
import { formatTime12Hour } from '@/lib/slot-generator';

// ============================================================
// التقويم المخصص
// ============================================================

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// رؤوس الأيام من اليمين لليسار
const DAY_HEADERS = ['جمعة', 'خميس', 'أربعاء', 'ثلاثاء', 'اثنين', 'أحد', 'سبت'];

// خريطة: رقم اليوم (0=أحد..6=سبت) → عمود في الـ grid (0=جمعة على اليمين)
const DAY_TO_COL: Record<number, number> = {
  5: 0, // جمعة
  4: 1, // خميس
  3: 2, // أربعاء
  2: 3, // ثلاثاء
  1: 4, // اثنين
  0: 5, // أحد
  6: 6, // سبت
};

// بناء الـ grid: كل يوم يروح في عموده الصحيح، وإذا العمود مشغول نبدأ صف جديد
function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[][] = [];
  let currentRow: (number | null)[] = Array(7).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const col = DAY_TO_COL[new Date(year, month, d).getDay()];
    if (currentRow[col] !== null) {
      grid.push(currentRow);
      currentRow = Array(7).fill(null);
    }
    currentRow[col] = d;
  }
  grid.push(currentRow);
  return grid;
}

interface CustomCalendarProps {
  selectedDate: string;
  onSelect: (dateStr: string) => void;
  holidays: string[];
}

function CustomCalendar({ selectedDate, onSelect, holidays }: CustomCalendarProps) {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const grid = buildCalendarGrid(viewYear, viewMonth);
  const todayStr = format(today, 'yyyy-MM-dd');

  return (
    <div className="w-full select-none">

      {/* Header: الشهر والسنة + أسهم التنقل */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={goToNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800 text-sm">
          {MONTH_NAMES_AR[viewMonth]} {viewYear}
        </span>
        <button
          onClick={goToPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">

        {/* رؤوس الأيام */}
        {DAY_HEADERS.map((name) => (
          <div key={name} className="text-center text-xs font-medium text-gray-400 py-1.5">
            {name}
          </div>
        ))}

        {/* خلايا الأيام */}
        {grid.map((row, rowIdx) =>
          row.map((day, colIdx) => {

            // خلية فاضية
            if (day === null) {
              return <div key={`empty-${rowIdx}-${colIdx}`} className="aspect-square" />;
            }

            const dateStr = format(new Date(viewYear, viewMonth, day), 'yyyy-MM-dd');
            const isToday    = dateStr === todayStr;
            const isPast     = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const isHoliday  = holidays.includes(dateStr);

            // أيام الماضي — تختفي
            if (isPast) {
              return <div key={dateStr} className="aspect-square" />;
            }

            return (
              <button
                key={dateStr}
                onClick={() => onSelect(dateStr)}
                className={`
                  aspect-square rounded-lg text-sm font-medium
                  flex items-center justify-center cursor-pointer
                  transition-all duration-150
                  ${isSelected
                    ? 'bg-rose-600 text-white shadow-md scale-105'
                    : isToday
                    ? 'bg-teal-100 text-teal-700 font-bold ring-2 ring-teal-300 hover:bg-teal-200'
                    : isHoliday
                    ? 'bg-red-50 text-red-400 hover:bg-red-100'
                    : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                  }
                `}
              >
                {day}
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-teal-100 ring-1 ring-teal-300" />
          <span>اليوم</span>
        </div>
        {holidays.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
            <span>عطلة</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-600" />
          <span>المختار</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// المكوّن الرئيسي
// ============================================================

export default function BookingSection() {
  const { toast } = useToast();
  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    bookingSuccess,
    setBookingSuccess,
  } = useAppStore();

  const [slotsResponse, setSlotsResponse]   = useState<SlotsResponse | null>(null);
  const [loadingSlots, setLoadingSlots]     = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [patientName, setPatientName]       = useState('');
  const [patientPhone, setPatientPhone]     = useState('');
  const [holidays, setHolidays]             = useState<string[]>([]);

  // جلب العطل
  useEffect(() => {
    async function fetchHolidays() {
      try {
        const res = await fetch('/api/holidays');
        if (res.ok) {
          const data: ApiResponse<{ date: string }[]> = await res.json();
          if (data.success && data.data) {
            setHolidays(data.data.map((h) => h.date));
          }
        }
      } catch {}
    }
    fetchHolidays();
  }, []);

  // جلب المواعيد عند تغيير التاريخ
  const fetchSlots = useCallback(async (date: string) => {
    if (!date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/slots?date=${date}`);
      const data: ApiResponse<SlotsResponse> = await res.json();
      if (data.success && data.data) setSlotsResponse(data.data);
      else setSlotsResponse(null);
    } catch {
      setSlotsResponse(null);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
    else setSlotsResponse(null);
  }, [selectedDate, fetchSlots]);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedTime(slot.time);
  };

  const handleSubmit = async () => {
    if (!patientName.trim() || !patientPhone.trim()) {
      toast({ title: 'بيانات ناقصة', description: 'يرجى إدخال الاسم ورقم الهاتف', variant: 'destructive' });
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast({ title: 'يرجى اختيار الموعد', description: 'اختر التاريخ والوقت المناسب', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName.trim(),
          patient_phone: patientPhone.trim(),
          appointment_date: selectedDate,
          appointment_time: selectedTime,
        }),
      });
      const data: ApiResponse = await res.json();

      if (data.success) {
        setBookingSuccess(true);
        toast({
          title: 'تم الحجز بنجاح! ✨',
          description: `موعدك في ${formatTime12Hour(selectedTime)} يوم ${DAY_NAMES_AR[new Date(selectedDate + 'T00:00:00').getDay()]}`,
        });
        setTimeout(() => {
          setBookingSuccess(false);
          setPatientName('');
          setPatientPhone('');
          setSelectedTime('');
        }, 4000);
        fetchSlots(selectedDate);
      } else {
        toast({ title: 'فشل الحجز', description: data.error || 'حدث خطأ أثناء الحجز', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ في الاتصال', description: 'يرجى المحاولة مرة أخرى', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking-section" className="py-16 px-4 bg-gradient-to-b from-gray-50/80 to-white">
      <div className="max-w-4xl mx-auto">

        {/* عنوان القسم */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-rose-100 text-rose-700 border-rose-200 mb-4 px-4 py-1.5">
            <Calendar className="w-3.5 h-3.5 ml-1.5" />
            حجز موعد
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">احجز موعدك الآن</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            اختر التاريخ والوقت المناسب لك وسنتواصل معك لتأكيد الموعد
          </p>
        </motion.div>

        {/* رسالة النجاح */}
        <AnimatePresence>
          {bookingSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-bl from-emerald-50 to-teal-50">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-emerald-800 mb-2">تم حجز موعدك بنجاح!</h3>
                  <p className="text-emerald-600 mb-1">
                    {DAY_NAMES_AR[new Date(selectedDate + 'T00:00:00').getDay()]} -{' '}
                    {format(new Date(selectedDate + 'T00:00:00'), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-emerald-600">الساعة {formatTime12Hour(selectedTime)}</p>
                  <p className="text-emerald-500 text-sm mt-4">سيتم التواصل معك قريباً لتأكيد الموعد</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* التقويم */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">اختر التاريخ</h3>
                </div>
                <CustomCalendar
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                  holidays={holidays}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* المواعيد + الفورم */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* المواعيد المتاحة */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">المواعيد المتاحة</h3>
                </div>

                {!selectedDate ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">اختر التاريخ أولاً لعرض المواعيد</p>
                  </div>
                ) : loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
                  </div>
                ) : !slotsResponse?.day_info.is_working ? (
                  <div className="text-center py-12">
                    <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                    <p className="text-red-400 font-medium">
                      {slotsResponse?.day_info.is_holiday
                        ? `عطلة: ${slotsResponse.day_info.holiday_reason || 'يوم عطلة'}`
                        : `${slotsResponse?.day_info.day_name} - يوم إجازة`}
                    </p>
                  </div>
                ) : slotsResponse?.slots.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                    <p className="text-amber-500">لا توجد مواعيد متاحة في هذا اليوم</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {slotsResponse.slots.map((slot) => (
                      <motion.button
                        key={slot.time}
                        whileHover={slot.available ? { scale: 1.05 } : {}}
                        whileTap={slot.available ? { scale: 0.95 } : {}}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                        className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          selectedTime === slot.time
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                            : slot.available
                            ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                        }`}
                      >
                        {formatTime12Hour(slot.time)}
                      </motion.button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* فورم بيانات المريضة */}
            {selectedDate && selectedTime && slotsResponse?.day_info.is_working && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-rose-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">بيانات المريضة</h3>
                    </div>
                    <div>
                      <Label htmlFor="patientName">الاسم الكامل *</Label>
                      <Input
                        id="patientName"
                        placeholder="أدخلي اسمك الكامل"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="mt-1.5 text-right"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientPhone">رقم الهاتف *</Label>
                      <Input
                        id="patientPhone"
                        placeholder="07XXXXXXXX"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="mt-1.5 text-right"
                        dir="ltr"
                      />
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !patientName.trim() || !patientPhone.trim()}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white py-5 text-base rounded-xl shadow-md cursor-pointer"
                    >
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 ml-2 animate-spin" />جاري الحجز...</>
                      ) : (
                        <><CheckCircle2 className="w-5 h-5 ml-2" />تأكيد الحجز</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
