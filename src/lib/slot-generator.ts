import type { WorkingHour, TimeSlot, Appointment, SlotsResponse, DAY_NAMES_AR as DayNamesType } from '@/types';

export async function generateTimeSlots(
  workingHour: WorkingHour,
  slotDuration: number,
  date: string,
  existingAppointments: Appointment[],
  dayNamesAr: Record<number, string>,
  holidayReason?: string
): Promise<SlotsResponse> {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  const dayName = dayNamesAr[dayOfWeek] || '';

  const dayInfo = {
    day_name: dayName,
    is_working: workingHour?.is_working ?? false,
    is_holiday: !!holidayReason,
    holiday_reason: holidayReason,
  };

  // If not working or holiday, return empty slots
  if (!workingHour?.is_working || holidayReason) {
    return { date, slots: [], day_info: dayInfo };
  }

  const slots: TimeSlot[] = [];

  // Parse times
  const [startH, startM] = workingHour.start_time.split(':').map(Number);
  const [endH, endM] = workingHour.end_time.split(':').map(Number);

  // Break times (optional)
  const breakStart = workingHour.break_start ? workingHour.break_start.split(':').map(Number) : null;
  const breakEnd = workingHour.break_end ? workingHour.break_end.split(':').map(Number) : null;

  // Convert to minutes for easy comparison
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const breakStartMinutes = breakStart ? breakStart[0] * 60 + breakStart[1] : null;
  const breakEndMinutes = breakEnd ? breakEnd[0] * 60 + breakEnd[1] : null;

  // Generate slots
  let currentMinutes = startMinutes;
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Check if this slot falls within break time
    const slotEndMinutes = currentMinutes + slotDuration;
    const isDuringBreak =
      breakStartMinutes !== null &&
      breakEndMinutes !== null &&
      currentMinutes < breakEndMinutes &&
      slotEndMinutes > breakStartMinutes;

    if (isDuringBreak) {
      currentMinutes = breakEndMinutes!;
      continue;
    }

    // Check if slot already booked
    const existingAppointment = existingAppointments.find(
      (apt) => apt.appointment_time === timeStr && apt.status !== 'cancelled'
    );

    slots.push({
      time: timeStr,
      available: !existingAppointment,
      appointment: existingAppointment || undefined,
    });

    currentMinutes += slotDuration;
  }

  return { date, slots, day_info: dayInfo };
}

export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
