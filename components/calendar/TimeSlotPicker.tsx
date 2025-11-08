"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
  selectedTime?: string | null;
  onTimeSelect: (time: string) => void;
  unavailableTimes?: string[];
}

const DEFAULT_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
];

export function TimeSlotPicker({
  selectedTime,
  onTimeSelect,
  unavailableTimes = [],
}: TimeSlotPickerProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-secondary-900">Select Time</h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {DEFAULT_TIME_SLOTS.map((time) => {
          const isSelected = selectedTime === time;
          const isUnavailable = unavailableTimes.includes(time);

          return (
            <Button
              key={time}
              type="button"
              variant={isSelected ? "primary" : "outline"}
              size="sm"
              onClick={() => !isUnavailable && onTimeSelect(time)}
              disabled={isUnavailable}
              className={cn(
                isUnavailable && "opacity-50 cursor-not-allowed line-through"
              )}
            >
              {formatTime(time)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

