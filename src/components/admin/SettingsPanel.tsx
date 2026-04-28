'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { SLOT_DURATION_OPTIONS } from '@/types';
import type { ClinicSettings, ApiResponse } from '@/types';

export default function SettingsPanel() {
  const { toast } = useToast();
  const { adminPassword, setSettings } = useAppStore();
  const [settings, setLocalSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form fields
  const [clinicName, setClinicName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [doctorImage, setDoctorImage] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState('5');
  const [reviewCount, setReviewCount] = useState('0');
  const [slotDuration, setSlotDuration] = useState('30');
  const [locationMapUrl, setLocationMapUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data: ApiResponse<ClinicSettings> = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        setLocalSettings(s as unknown as ClinicSettings);
        setClinicName(s.clinic_name);
        setDoctorName(s.doctor_name);
        setDoctorSpecialty(s.doctor_specialty);
        setDoctorImage(s.doctor_image || '');
        setHeroImage(s.hero_image || '');
        setHeroDescription(s.hero_description_ar || '');
        setPhone(s.phone);
        setAddress(s.address);
        setRating(String(s.rating));
        setReviewCount(String(s.review_count));
        setSlotDuration(String(s.slot_duration_minutes));
        setLocationMapUrl(s.location_map_url || '');
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في تحميل الإعدادات', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (newPassword && newPassword !== confirmPassword) {
        toast({ title: 'خطأ', description: 'كلمة المرور غير متطابقة', variant: 'destructive' });
        setSaving(false);
        return;
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_password: adminPassword,
          clinic_name: clinicName,
          doctor_name: doctorName,
          doctor_specialty: doctorSpecialty,
          doctor_image: doctorImage || null,
          hero_image: heroImage || null,
          hero_description_ar: heroDescription,
          phone: phone,
          address: address,
          rating: Number(rating),
          review_count: Number(reviewCount),
          slot_duration_minutes: Number(slotDuration),
          location_map_url: locationMapUrl || null,
          new_password: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'تم الحفظ', description: 'تم تحديث الإعدادات بنجاح' });
        setNewPassword('');
        setConfirmPassword('');
        fetchSettings();
      } else {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في حفظ الإعدادات', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">إعدادات العيادة</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* Basic Info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">المعلومات الأساسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>اسم العيادة</Label>
              <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="mt-1 text-right" />
            </div>
            <div>
              <Label>اسم الطبيبة</Label>
              <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="mt-1 text-right" />
            </div>
            <div>
              <Label>التخصص</Label>
              <Input value={doctorSpecialty} onChange={(e) => setDoctorSpecialty(e.target.value)} className="mt-1 text-right" />
            </div>
            <div>
              <Label>الهاتف</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 text-right" dir="ltr" />
            </div>
          </div>
          <div>
            <Label>العنوان</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 text-right" />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">الصور</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>رابط صورة الطبيبة</Label>
              <Input value={doctorImage} onChange={(e) => setDoctorImage(e.target.value)} className="mt-1 text-right" dir="ltr" placeholder="https://..." />
            </div>
            <div>
              <Label>رابط صورة الخلفية (Hero)</Label>
              <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} className="mt-1 text-right" dir="ltr" placeholder="https://..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {doctorImage && (
              <div className="aspect-square rounded-lg overflow-hidden border">
                <img src={doctorImage} alt="Doctor" className="w-full h-full object-cover" />
              </div>
            )}
            {heroImage && (
              <div className="aspect-video rounded-lg overflow-hidden border">
                <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hero Description */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">وصف الصفحة الرئيسية</h3>
          <Textarea
            value={heroDescription}
            onChange={(e) => setHeroDescription(e.target.value)}
            placeholder="وصف مختصر عن العيادة..."
            className="text-right min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">إعدادات متقدمة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>مدة الموعد (بالدقائق)</Label>
              <Select value={slotDuration} onValueChange={setSlotDuration}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التقييم (1-5)</Label>
              <Input type="number" min="1" max="5" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1 text-right" />
            </div>
            <div>
              <Label>عدد التقييمات</Label>
              <Input type="number" min="0" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} className="mt-1 text-right" />
            </div>
            <div>
              <Label>رابط موقع الخريطة</Label>
              <Input value={locationMapUrl} onChange={(e) => setLocationMapUrl(e.target.value)} className="mt-1 text-right" dir="ltr" placeholder="Google Maps embed URL" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">تغيير كلمة المرور</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label>كلمة المرور الجديدة</Label>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 text-left"
                placeholder="اتركها فارغة إذا لم تريد التغيير"
              />
            </div>
            <div>
              <Label>تأكيد كلمة المرور</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 text-left"
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
