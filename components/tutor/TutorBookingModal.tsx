"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { tutorApi } from "@/lib/api/tutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/uiStore";
import { TutorAnalysisSection } from "./TutorAnalysisSection";
import { TutorContextSection } from "./TutorContextSection";
import { TutorListSection } from "./TutorListSection";
import { BookingFormSection } from "./BookingFormSection";
import { X, User, BookOpen } from "lucide-react";

interface TutorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion?: string;
  onBookingComplete?: () => void;
}

export function TutorBookingModal({
  isOpen,
  onClose,
  currentQuestion,
  onBookingComplete,
}: TutorBookingModalProps) {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  // Analyze routing
  const { data: analysis, isLoading: analyzing } = useQuery({
    queryKey: ["tutor-routing-analysis", user?.id, currentQuestion],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not found");
      const response = await tutorApi.analyzeRouting({
        studentId: user.id,
        currentQuestion: currentQuestion || undefined,
      });
      return response.data;
    },
    enabled: isOpen && !!user?.id,
  });

  // Get tutors list
  const { data: tutors, isLoading: loadingTutors } = useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const response = await tutorApi.getTutors();
      return response.data;
    },
    enabled: isOpen,
  });

  // Get tutor context
  const { data: tutorContext, isLoading: loadingContext } = useQuery({
    queryKey: ["tutor-context", user?.id, analysis?.recommendedTopic],
    queryFn: async () => {
      if (!user?.id || !analysis) throw new Error("Missing data");
      const response = await tutorApi.getTutorContext(
        user.id,
        analysis.recommendedTopic
      );
      return response.data;
    },
    enabled: isOpen && !!analysis && !!user?.id,
  });

  const handleBooking = async () => {
    if (!selectedTutor || !bookingDate || !bookingTime) {
      addNotification({
        type: "error",
        message: "Please select a tutor, date, and time",
      });
      return;
    }

    // TODO: Implement actual booking API call
    addNotification({
      type: "success",
      message: "Tutor session booked! You'll receive a confirmation email shortly.",
    });
    
    if (onBookingComplete) {
      onBookingComplete();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary-600" />
              <CardTitle className="text-2xl">Book a Tutor Session</CardTitle>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Results */}
          <TutorAnalysisSection analysis={analysis ?? null} isLoading={analyzing} />

          {/* Tutor Context Summary */}
          {analysis?.shouldRoute && (
            <TutorContextSection tutorContext={tutorContext ?? null} isLoading={loadingContext} />
          )}

          {/* Tutor Selection */}
          <TutorListSection
            tutors={tutors ?? null}
            isLoading={loadingTutors}
            selectedTutor={selectedTutor}
            onSelectTutor={setSelectedTutor}
          />

          {/* Booking Date & Time */}
          {selectedTutor && (
            <BookingFormSection
              bookingDate={bookingDate}
              bookingTime={bookingTime}
              onDateChange={setBookingDate}
              onTimeChange={setBookingTime}
            />
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-secondary-200">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleBooking}
              disabled={!selectedTutor || !bookingDate || !bookingTime}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

