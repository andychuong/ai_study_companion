"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { tutorApi } from "@/lib/api/tutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/calendar/Calendar";
import { TimeSlotPicker } from "@/components/calendar/TimeSlotPicker";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { Calendar as CalendarIcon, Clock, User, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function BookSessionPage() {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);

  // Get tutors list
  const { data: tutors, isLoading: loadingTutors } = useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const response = await tutorApi.getTutors();
      return response.data;
    },
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: {
      tutorId: string;
      sessionDate: Date;
      duration: number;
    }) => {
      // TODO: Implement actual booking API call
      // For now, just simulate success
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      addNotification({
        type: "success",
        message: "Session booked successfully! You'll receive a confirmation email shortly.",
      });
      // Reset form
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedTutor(null);
      // Redirect to sessions history
      setTimeout(() => {
        router.push("/sessions");
      }, 1500);
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  const handleBooking = () => {
    if (!selectedTutor || !selectedDate || !selectedTime) {
      addNotification({
        type: "error",
        message: "Please select a tutor, date, and time",
      });
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(":");
    const sessionDateTime = new Date(selectedDate);
    sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Default duration: 1 hour (3600 seconds)
    const duration = 3600;

    bookingMutation.mutate({
      tutorId: selectedTutor,
      sessionDate: sessionDateTime,
      duration,
    });
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Book a Session</h1>
        <p className="text-secondary-600 mt-1">Schedule a tutoring session with your tutor</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary-600" />
                <CardTitle>Select Date</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                minDate={minDate}
              />
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" />
                  <CardTitle>Select Time</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <TimeSlotPicker
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Tutor Selection & Booking Summary */}
        <div className="space-y-6">
          {/* Tutor Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                <CardTitle>Select Tutor</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTutors ? (
                <div className="space-y-2">
                  <div className="h-12 bg-secondary-200 rounded animate-pulse" />
                  <div className="h-12 bg-secondary-200 rounded animate-pulse" />
                </div>
              ) : tutors && tutors.length > 0 ? (
                <div className="space-y-2">
                  {tutors.map((tutor) => (
                    <button
                      key={tutor.id}
                      type="button"
                      onClick={() => setSelectedTutor(tutor.id)}
                      className={`
                        w-full p-3 rounded-lg border-2 text-left transition-colors
                        ${
                          selectedTutor === tutor.id
                            ? "border-primary-600 bg-primary-50"
                            : "border-secondary-200 hover:border-secondary-300"
                        }
                      `}
                    >
                      <div className="font-medium text-secondary-900">
                        {tutor.name}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {tutor.email}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-600 text-sm">
                  No tutors available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Booking Summary */}
          {(selectedDate || selectedTime || selectedTutor) && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTutor && (
                  <div>
                    <p className="text-sm text-secondary-600">Tutor</p>
                    <p className="font-medium text-secondary-900">
                      {tutors?.find((t) => t.id === selectedTutor)?.name || "Not selected"}
                    </p>
                  </div>
                )}
                {selectedDate && (
                  <div>
                    <p className="text-sm text-secondary-600">Date</p>
                    <p className="font-medium text-secondary-900">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                )}
                {selectedTime && (
                  <div>
                    <p className="text-sm text-secondary-600">Time</p>
                    <p className="font-medium text-secondary-900">
                      {(() => {
                        const [hours, minutes] = selectedTime.split(":");
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? "PM" : "AM";
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${minutes} ${ampm}`;
                      })()}
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t border-secondary-200">
                  <p className="text-sm text-secondary-600">Duration</p>
                  <p className="font-medium text-secondary-900">1 hour</p>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleBooking}
                  disabled={!selectedTutor || !selectedDate || !selectedTime || bookingMutation.isPending}
                  loading={bookingMutation.isPending}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

