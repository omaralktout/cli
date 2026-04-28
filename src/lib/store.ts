'use client';

import { create } from 'zustand';
import type { ClinicSettings, WorkingHour, Appointment } from '@/types';

interface AppState {
  // Navigation
  currentView: 'patient' | 'admin-login' | 'admin-dashboard';
  setCurrentView: (view: 'patient' | 'admin-login' | 'admin-dashboard') => void;

  // Auth
  isAdminLoggedIn: boolean;
  setAdminLoggedIn: (val: boolean) => void;
  adminPassword: string;
  setAdminPassword: (pw: string) => void;

  // Settings
  settings: ClinicSettings | null;
  setSettings: (s: ClinicSettings | null) => void;

  // Working Hours
  workingHours: WorkingHour[];
  setWorkingHours: (wh: WorkingHour[]) => void;

  // Booking state
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedTime: string;
  setSelectedTime: (t: string) => void;
  bookingSuccess: boolean;
  setBookingSuccess: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'patient',
  setCurrentView: (view) => set({ currentView: view }),

  isAdminLoggedIn: false,
  setAdminLoggedIn: (val) => set({ isAdminLoggedIn: val }),
  adminPassword: '',
  setAdminPassword: (pw) => set({ adminPassword: pw }),

  settings: null,
  setSettings: (s) => set({ settings: s }),

  workingHours: [],
  setWorkingHours: (wh) => set({ workingHours: wh }),

  selectedDate: '',
  setSelectedDate: (d) => set({ selectedDate: d, selectedTime: '' }),
  selectedTime: '',
  setSelectedTime: (t) => set({ selectedTime: t }),
  bookingSuccess: false,
  setBookingSuccess: (v) => set({ bookingSuccess: v }),
}));
