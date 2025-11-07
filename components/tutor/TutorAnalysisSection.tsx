"use client";

import { TutorRoutingAnalysis } from "@/lib/api/tutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface TutorAnalysisSectionProps {
  analysis: TutorRoutingAnalysis | null;
  isLoading: boolean;
}

export function TutorAnalysisSection({ analysis, isLoading }: TutorAnalysisSectionProps) {
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-secondary-600">Analyzing your needs...</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  if (analysis.shouldRoute) {
    return (
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
      </div>
    );
  }

  return (
    <div className="bg-success-50 border border-success-200 rounded-lg p-4 text-center">
      <CheckCircle className="h-8 w-8 text-success-600 mx-auto mb-2" />
      <p className="text-success-900 font-semibold mb-1">You're doing great!</p>
      <p className="text-sm text-success-700">
        Based on your progress, you can continue learning with the AI companion. 
        If you still want to book a session, you can proceed below.
      </p>
    </div>
  );
}

