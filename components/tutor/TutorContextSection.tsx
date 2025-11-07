"use client";

import { TutorContext } from "@/lib/api/tutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TutorContextSectionProps {
  tutorContext: TutorContext | null;
  isLoading: boolean;
}

export function TutorContextSection({ tutorContext, isLoading }: TutorContextSectionProps) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-6 w-6 border-3 border-primary-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!tutorContext) {
    return null;
  }

  return (
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
  );
}

