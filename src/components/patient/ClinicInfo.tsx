'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Stethoscope,
  Heart,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ClinicSettings, WorkingHour, GalleryImage, DAY_NAMES_AR as DayNamesType } from '@/types';
import { DAY_NAMES_AR } from '@/types';
import { formatTime12Hour } from '@/lib/slot-generator';

interface ClinicInfoProps {
  settings: ClinicSettings | null;
  loading: boolean;
}

export default function ClinicInfo({ settings, loading }: ClinicInfoProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [whRes, galRes] = await Promise.all([
          fetch('/api/working-hours'),
          fetch('/api/gallery'),
        ]);
        if (whRes.ok) {
          const whData = await whRes.json();
          if (whData.success) setWorkingHours(whData.data);
        }
        if (galRes.ok) {
          const galData = await galRes.json();
          if (galData.success) setGallery(galData.data);
        }
      } catch {}
    }
    fetchData();
  }, []);

  if (loading || !settings) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const workingDays = workingHours.filter((wh) => wh.is_working && wh.is_active);

  return (
    <section id="clinic-info" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-4 px-4 py-1.5">
            <Stethoscope className="w-3.5 h-3.5 ml-1.5" />
            عن العيادة
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            تعرّف على عيادتنا
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            نقدم لكم أفضل خدمات الرعاية الصحية للنساء والتوليد بأحدث التقنيات
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg overflow-hidden h-full">
              <div className="bg-gradient-to-bl from-rose-500 to-rose-600 p-6 text-center">
                {settings.doctor_image ? (
                  <img
                    src={settings.doctor_image}
                    alt={settings.doctor_name}
                    className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-14 h-14 text-white/80" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{settings.doctor_name}</h3>
                <p className="text-rose-100 mt-1">{settings.doctor_specialty}</p>
              </div>
              <CardContent className="p-6 space-y-4">
                {settings.rating > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(settings.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({settings.review_count} تقييم)</span>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                    <span className="text-gray-600 text-sm">{settings.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-teal-500 shrink-0" />
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-gray-600 hover:text-teal-600 transition-colors text-sm"
                      dir="ltr"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Working Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">مواعيد العمل</h3>
                </div>
                <div className="space-y-3">
                  {workingHours.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      لم يتم تحديد مواعيد العمل بعد
                    </p>
                  ) : (
                    workingHours.map((wh) => (
                      <div
                        key={wh.id}
                        className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${
                          wh.is_working && wh.is_active
                            ? 'bg-gray-50'
                            : 'bg-red-50'
                        }`}
                      >
                        <span
                          className={`font-medium text-sm ${
                            wh.is_working && wh.is_active
                              ? 'text-gray-700'
                              : 'text-red-400 line-through'
                          }`}
                        >
                          {DAY_NAMES_AR[wh.day_of_week]}
                        </span>
                        {wh.is_working && wh.is_active ? (
                          <span className="text-sm text-gray-500" dir="ltr">
                            {formatTime12Hour(wh.start_time)} - {formatTime12Hour(wh.end_time)}
                          </span>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-500">
                            مغلق
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gallery & Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Gallery */}
            {gallery.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">معرض الصور</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {gallery.slice(0, 6).map((img) => (
                      <div
                        key={img.id}
                        className="aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={img.image_url}
                          alt={img.caption || 'صورة من العيادة'}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map */}
            {settings.location_map_url && (
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-6 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">الموقع</h3>
                  </div>
                  <div className="h-48">
                    <iframe
                      src={settings.location_map_url}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
