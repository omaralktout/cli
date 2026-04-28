// ============================================
// Database Types
// ============================================

export interface ClinicSettings {
  id: string;
  clinic_name: string;
  doctor_name: string;
  doctor_specialty: string;
  doctor_image: string | null;
  hero_image: string | null;
  hero_description_ar: string;
  phone: string;
  address: string;
  rating: number;
  review_count: number;
  location_map_url: string | null;
  slot_duration_minutes: number;
  admin_password: string;
  created_at: string;
  updated_at: string;
}

export interface WorkingHour {
  id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  is_working: boolean;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  date: string;
  reason: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// ============================================
// Booking Types
// ============================================

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

export interface BookingFormData {
  patient_name: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SlotsResponse {
  date: string;
  slots: TimeSlot[];
  day_info: {
    day_name: string;
    is_working: boolean;
    is_holiday: boolean;
    holiday_reason?: string;
  };
}

// ============================================
// Day Names in Arabic
// ============================================

export const DAY_NAMES_AR: Record<number, string> = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

export const SLOT_DURATION_OPTIONS = [
  { value: 5, label: '5 دقائق' },
  { value: 10, label: '10 دقائق' },
  { value: 15, label: '15 دقيقة' },
  { value: 20, label: '20 دقيقة' },
  { value: 30, label: 'نصف ساعة' },
  { value: 45, label: '45 دقيقة' },
  { value: 60, label: 'ساعة كاملة' },
];
