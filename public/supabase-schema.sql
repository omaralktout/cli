-- ============================================
-- Supabase Database Schema
-- Medical Clinic Booking System
-- Dr. Hanan Buruq - Gynecology & Obstetrics
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Clinic Settings Table
-- ============================================
CREATE TABLE clinic_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_name TEXT NOT NULL DEFAULT 'عيادة د. حنان بروق',
  doctor_name TEXT NOT NULL DEFAULT 'د. حنان بروق',
  doctor_specialty TEXT NOT NULL DEFAULT 'أخصائية النسائية والتوليد والعقم',
  doctor_image TEXT,
  hero_image TEXT,
  hero_description_ar TEXT DEFAULT 'عيادة متخصصة في أمراض النساء والتوليد والعقم',
  phone TEXT DEFAULT '+962',
  address TEXT DEFAULT 'ش. عدن، عمّان 11140',
  rating NUMERIC DEFAULT 4.7,
  review_count INTEGER DEFAULT 368,
  location_map_url TEXT,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 15,
  admin_password TEXT NOT NULL DEFAULT 'admin123',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO clinic_settings (id, clinic_name, doctor_name, doctor_specialty, hero_description_ar, rating, review_count, slot_duration_minutes, admin_password)
VALUES (
  uuid_generate_v4(),
  'عيادة د. حنان بروق',
  'د. حنان بروق',
  'أخصائية النسائية والتوليد والعقم',
  'عيادة متخصصة في أمراض النساء والتوليد والعقم - نسعى لتقديم أفضل رعاية صحية لجميع نساء الأردن',
  4.7,
  368,
  15,
  'admin123'
);

-- ============================================
-- 2. Working Hours Table
-- ============================================
CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  is_working BOOLEAN NOT NULL DEFAULT false,
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '17:00',
  break_start TEXT,
  break_end TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day_of_week)
);

-- Insert default working hours (Sunday-Thursday)
INSERT INTO working_hours (day_of_week, is_working, start_time, end_time, break_start, break_end) VALUES
(0, true, '11:30', '19:00', '14:00', '15:00'),  -- Sunday
(1, true, '09:00', '17:00', '13:00', '14:00'),  -- Monday
(2, true, '09:00', '17:00', '13:00', '14:00'),  -- Tuesday
(3, true, '09:00', '17:00', '13:00', '14:00'),  -- Wednesday
(4, true, '09:00', '17:00', '13:00', '14:00'),  -- Thursday
(5, false, '09:00', '17:00', NULL, NULL),         -- Friday (off)
(6, false, '09:00', '17:00', NULL, NULL);         -- Saturday (off)

-- ============================================
-- 3. Holidays / Off Days Table
-- ============================================
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- ============================================
-- 4. Appointments Table
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Gallery Images Table
-- ============================================
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_working_hours_day ON working_hours(day_of_week);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Public read access for clinic_settings
CREATE POLICY "Public can read clinic settings"
  ON clinic_settings FOR SELECT
  USING (true);

-- Public read access for working_hours
CREATE POLICY "Public can read working hours"
  ON working_hours FOR SELECT
  USING (true);

-- Public read access for holidays
CREATE POLICY "Public can read holidays"
  ON holidays FOR SELECT
  USING (true);

-- Public can create appointments
CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Public can read appointments (for checking availability)
CREATE POLICY "Public can read appointments"
  ON appointments FOR SELECT
  USING (true);

-- Public can read gallery
CREATE POLICY "Public can read gallery"
  ON gallery_images FOR SELECT
  USING (true)
  ORDER BY display_order ASC;

-- Full access for authenticated/admin users
-- (Using service_role key from backend for admin operations)

-- ============================================
-- Helper Functions
-- ============================================

-- Function to check if a time slot is available
CREATE OR REPLACE FUNCTION is_slot_available(
  p_date DATE,
  p_time TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE appointment_date = p_date
    AND appointment_time = p_time
    AND status IN ('confirmed', 'completed')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_clinic_settings_updated_at
  BEFORE UPDATE ON clinic_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_working_hours_updated_at
  BEFORE UPDATE ON working_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Done! Run this SQL in your Supabase SQL Editor
-- ============================================
