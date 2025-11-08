"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selectedDate?: Date | null;
  onDateSelect: (date: Date) => void;
  unavailableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({
  selectedDate,
  onDateSelect,
  unavailableDates = [],
  minDate,
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isUnavailable = (date: Date) => {
    return unavailableDates.some((unavailable) => isSameDay(date, unavailable));
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (isPast(date) && !isToday(date)) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date) || isUnavailable(date)) return;
    onDateSelect(date);
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={previousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-secondary-900">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-secondary-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isUnavailableDate = isUnavailable(day);
          const isDisabledDate = isDisabled(day);
          const isTodayDate = isToday(day);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={isDisabledDate || isUnavailableDate}
              className={cn(
                "aspect-square p-2 text-sm rounded-lg transition-colors",
                !isCurrentMonth && "text-secondary-300",
                isCurrentMonth && !isSelected && !isTodayDate && "text-secondary-700 hover:bg-secondary-100",
                isTodayDate && !isSelected && "bg-primary-50 text-primary-600 font-medium",
                isSelected && "bg-primary-600 text-white font-medium",
                isDisabledDate && "text-secondary-300 cursor-not-allowed",
                isUnavailableDate && "bg-red-50 text-red-400 cursor-not-allowed line-through",
                !isDisabledDate && !isUnavailableDate && "hover:bg-secondary-100"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

