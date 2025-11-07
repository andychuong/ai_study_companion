"use client";

import { Tutor } from "@/lib/api/tutor";
import { User, CheckCircle } from "lucide-react";

interface TutorListSectionProps {
  tutors: Tutor[] | null;
  isLoading: boolean;
  selectedTutor: string | null;
  onSelectTutor: (tutorId: string) => void;
}

export function TutorListSection({
  tutors,
  isLoading,
  selectedTutor,
  onSelectTutor,
}: TutorListSectionProps) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-6 w-6 border-3 border-primary-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!tutors || tutors.length === 0) {
    return (
      <div className="text-center py-4 text-secondary-600">
        <p>No tutors available at the moment.</p>
      </div>
    );
  }

  return (
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
            onClick={() => onSelectTutor(tutor.id)}
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
  );
}

