'use client';

import {
  MapPin,
  Phone,
  Heart,
  Stethoscope,
} from 'lucide-react';
import type { ClinicSettings } from '@/types';

interface FooterProps {
  settings: ClinicSettings | null;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Clinic Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {settings?.clinic_name || 'عيادة د. حنان بروق'}
                </h3>
                <p className="text-gray-400 text-xs">{settings?.doctor_specialty || 'أمراض النساء والتوليد'}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              نلتزم بتقديم أفضل رعاية صحية للنساء بأعلى معايير الجودة والاحترافية.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-rose-400">تواصلي معنا</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a
                  href={`tel:${settings?.phone || ''}`}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                  dir="ltr"
                >
                  {settings?.phone || '05XXXXXXXX'}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">
                  {settings?.address || 'لم يتم تحديد العنوان'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-rose-400">روابط سريعة</h4>
            <div className="space-y-2">
              <button
                onClick={() => document.getElementById('clinic-info')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-gray-300 hover:text-white transition-colors text-sm cursor-pointer"
              >
                عن العيادة
              </button>
              <button
                onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-gray-300 hover:text-white transition-colors text-sm cursor-pointer"
              >
                حجز موعد
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} {settings?.clinic_name || 'عيادة د. حنان بروق'}. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
