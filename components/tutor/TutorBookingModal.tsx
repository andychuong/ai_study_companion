"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { tutorApi, TutorRoutingAnalysis, Tutor, TutorContext } from "@/lib/api/tutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { X, User, AlertCircle, CheckCircle, Clock, BookOpen } from "lucide-react";
import { format } from "date-fns";

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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "info";
    }
  };

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
          {analyzing ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-secondary-600">Analyzing your needs...</p>
            </div>
          ) : analysis && analysis.shouldRoute ? (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-secondary-900">Tutor Recommended</h3>
                      <Badge variant={getUrgencyColor(analysis.urgency)}>
                        {analysis.urgency} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary-700 mb-2">{analysis.reason}</p>
                    <p className="text-sm text-secondary-600">
                      <span className="font-medium">Recommended Topic:</span> {analysis.recommendedTopic}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tutor Context Summary */}
              {loadingContext ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-3 border-primary-600 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : tutorContext && (
                <Card className="border-secondary-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Student Context Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-secondary-900 mb-2">Focus Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutorContext.recommendedFocus.map((area, idx) => (
                          <Badge key={idx} variant="info">{area}</Badge>
                        ))}
                      </div>
                    </div>
                    {tutorContext.studentStrengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-secondary-900 mb-2">Student Strengths</h4>
                        <div className="flex flex-wrap gap-2">
                          {tutorContext.studentStrengths.map((strength, idx) => (
                            <Badge key={idx} variant="success">{strength}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {tutorContext.currentChallenges.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-secondary-900 mb-2">Current Challenges</h4>
                        <ul className="list-disc list-inside text-sm text-secondary-600 space-y-1">
                          {tutorContext.currentChallenges.slice(0, 3).map((challenge, idx) => (
                            <li key={idx}>{challenge}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : analysis && !analysis.shouldRoute ? (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-success-600 mx-auto mb-2" />
              <p className="text-success-900 font-semibold mb-1">You're doing great!</p>
              <p className="text-sm text-success-700">
                Based on your progress, you can continue learning with the AI companion. 
                If you still want to book a session, you can proceed below.
              </p>
            </div>
          ) : null}

          {/* Tutor Selection */}
          {loadingTutors ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-3 border-primary-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : tutors && tutors.length > 0 ? (
            <div>
              <h3 className="font-semibold text-secondary-900 mb-3">Select a Tutor</h3>
              <div className="space-y-2">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedTutor === tutor.id
                        ? "border-primary-600 bg-primary-50"
                        : "border-secondary-200 hover:border-primary-300"
                    }`}
                    onClick={() => setSelectedTutor(tutor.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-900">{tutor.name}</p>
                        <p className="text-sm text-secondary-600">{tutor.email}</p>
                      </div>
                      {selectedTutor === tutor.id && (
                        <CheckCircle className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-secondary-600">
              <p>No tutors available at the moment.</p>
            </div>
          )}

          {/* Booking Date & Time */}
          {selectedTutor && (
            <div className="space-y-4 border-t border-secondary-200 pt-4">
              <h3 className="font-semibold text-secondary-900">Schedule Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Time"
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
            </div>
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

