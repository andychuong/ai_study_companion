"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubjectSuggestion } from "@/lib/api/suggestions";
import { Lightbulb, Star, TrendingUp, CheckCircle, X } from "lucide-react";

interface SuggestionsModalProps {
  suggestions: SubjectSuggestion[];
  onClose: () => void;
  onAccept: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
}

export function SuggestionsModal({ suggestions, onClose, onAccept, onDismiss }: SuggestionsModalProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (suggestionId: string) => {
    setDismissedIds(new Set([...dismissedIds, suggestionId]));
    onDismiss(suggestionId);
  };

  const visibleSuggestions = suggestions.filter((s) => !dismissedIds.has(s.suggestionId));

  if (visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary-600" />
              <CardTitle className="text-2xl">🎉 New Subject Suggestions!</CardTitle>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-secondary-600 mt-2">
            Study topics and practice activities to help you achieve your goal:
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleSuggestions.map((suggestion) => (
            <Card key={suggestion.suggestionId} className="border-primary-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{suggestion.topic}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {suggestion.relevanceScore !== null && (
                        <Badge variant="info" className="flex items-center gap-1 w-fit">
                          <Star className="h-3 w-3 fill-current" />
                          {suggestion.relevanceScore.toFixed(1)}/10 relevance
                        </Badge>
                      )}
                      {suggestion.difficulty && (
                        <Badge variant="default" className="capitalize">
                          {suggestion.difficulty}
                        </Badge>
                      )}
                      {suggestion.estimatedHours && (
                        <Badge variant="default">
                          ~{suggestion.estimatedHours}h
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestion.description && (
                  <p className="text-sm text-secondary-600">{suggestion.description}</p>
                )}
                {suggestion.practiceActivities && suggestion.practiceActivities.length > 0 && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary-900 mb-1">Practice Activities:</p>
                        <ul className="text-sm text-primary-800 list-disc list-inside space-y-1">
                          {suggestion.practiceActivities.map((activity, idx) => (
                            <li key={idx}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {suggestion.prerequisites && suggestion.prerequisites.length > 0 && (
                  <div className="text-xs text-secondary-500">
                    <span className="font-semibold">Prerequisites: </span>
                    {suggestion.prerequisites.join(', ')}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => onAccept(suggestion.suggestionId)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Study Topic
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDismiss(suggestion.suggestionId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="pt-4 border-t border-secondary-200">
            <Button variant="outline" className="w-full" onClick={onClose}>
              View All Suggestions Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

