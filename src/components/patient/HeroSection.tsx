'use client';

import { motion } from 'framer-motion';
import { Star, CalendarCheck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { ClinicSettings } from '@/types';

interface HeroSectionProps {
  settings: ClinicSettings | null;
  loading: boolean;
}

export default function HeroSection({ settings, loading }: HeroSectionProps) {
  const setView = useAppStore((s) => s.setCurrentView);
  
  const scrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] bg-gradient-to-bl from-rose-100 via-rose-50 to-teal-50 animate-pulse" />
    );
  }

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {settings?.hero_image ? (
        <img
          src={settings.hero_image}
          alt="عيادة د. حنان بروق"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 via-rose-300 to-teal-200" />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Clinic badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">نقبل الحجوزات الآن</span>
          </motion.div>

          {/* Clinic name */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {settings?.clinic_name || 'عيادة د. حنان بروق'}
          </h1>

          {/* Specialty */}
          <p className="text-lg md:text-xl text-rose-100 mb-2 font-medium">
            {settings?.doctor_specialty || 'أمراض النساء والتوليد'}
          </p>

          {/* Doctor name */}
          <p className="text-base md:text-lg text-white/80 mb-6">
            {settings?.doctor_name || 'د. حنان بروق'}
          </p>

          {/* Rating */}
          {settings && settings.rating > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(settings.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/80 text-sm">
                ({settings.review_count} تقييم)
              </span>
            </motion.div>
          )}

          {/* Description */}
          {settings?.hero_description_ar && (
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              {settings.hero_description_ar}
            </p>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={scrollToBooking}
              className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-rose-600/30 transition-all hover:shadow-xl hover:shadow-rose-600/40 hover:-translate-y-0.5 cursor-pointer"
            >
              <CalendarCheck className="w-5 h-5 ml-2" />
              احجز موعدك الآن
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToBooking}
              className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              تعرف على مواعيدنا
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
