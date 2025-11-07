"use client";

import { Input } from "@/components/ui/input";

interface BookingFormSectionProps {
  bookingDate: string;
  bookingTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function BookingFormSection({
  bookingDate,
  bookingTime,
  onDateChange,
  onTimeChange,
}: BookingFormSectionProps) {
  return (
    <div className="space-y-4 border-t border-secondary-200 pt-4">
      <h3 className="font-semibold text-secondary-900">Schedule Session</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={bookingDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <Input
          label="Time"
          type="time"
          value={bookingTime}
          onChange={(e) => onTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
}

