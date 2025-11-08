"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suggestionsApi, SubjectSuggestion } from "@/lib/api/suggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { Lightbulb, CheckCircle, X, Star, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function SuggestionsPage() {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  // Fetch suggestions
  const { data, isLoading } = useQuery({
    queryKey: ["suggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return { suggestions: [] };
      const response = await suggestionsApi.getStudentSuggestions(user.id);
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Accept suggestion mutation
  const acceptMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const response = await suggestionsApi.acceptSuggestion(suggestionId);
      return response.data;
    },
    onSuccess: (data) => {
      addNotification({
        type: "success",
        message: data.message || "Suggestion accepted! A new goal has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["suggestions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  // Dismiss suggestion mutation
  const dismissMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const response = await suggestionsApi.dismissSuggestion(suggestionId);
      return response.data;
    },
    onSuccess: () => {
      addNotification({
        type: "success",
        message: "Suggestion dismissed",
      });
      queryClient.invalidateQueries({ queryKey: ["suggestions", user?.id] });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  const handleAccept = (suggestionId: string) => {
    acceptMutation.mutate(suggestionId);
  };

  const handleDismiss = (suggestionId: string) => {
    dismissMutation.mutate(suggestionId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-64 bg-secondary-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-secondary-200 rounded animate-pulse" />
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  const suggestions = data?.suggestions || [];
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const acceptedSuggestions = suggestions.filter((s) => s.status === "accepted");
  const dismissedSuggestions = suggestions.filter((s) => s.status === "dismissed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Study Topic Suggestions</h1>
        <p className="text-secondary-600 mt-1">
          Study topics and practice activities to help you achieve your goals
        </p>
      </div>

      {/* Pending Suggestions */}
      {pendingSuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">
              New Suggestions ({pendingSuggestions.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.suggestionId}
                suggestion={suggestion}
                onAccept={() => handleAccept(suggestion.suggestionId)}
                onDismiss={() => handleDismiss(suggestion.suggestionId)}
                isLoading={acceptMutation.isPending || dismissMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Accepted Suggestions */}
      {acceptedSuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <h2 className="text-xl font-semibold text-secondary-900">
              Accepted ({acceptedSuggestions.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceptedSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.suggestionId}
                suggestion={suggestion}
                isAccepted
              />
            ))}
          </div>
        </div>
      )}

      {/* Dismissed Suggestions */}
      {dismissedSuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <X className="h-5 w-5 text-secondary-400" />
            <h2 className="text-xl font-semibold text-secondary-900">
              Dismissed ({dismissedSuggestions.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dismissedSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.suggestionId}
                suggestion={suggestion}
                isDismissed
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No suggestions yet
            </h3>
            <p className="text-secondary-600 mb-4">
              Create a goal to receive personalized study topic suggestions!
            </p>
            <Link href="/goals">
              <Button variant="primary">View Goals</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: SubjectSuggestion;
  onAccept?: () => void;
  onDismiss?: () => void;
  isLoading?: boolean;
  isAccepted?: boolean;
  isDismissed?: boolean;
}

function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
  isLoading = false,
  isAccepted = false,
  isDismissed = false,
}: SuggestionCardProps) {
  const relevanceStars = suggestion.relevanceScore
    ? Math.round((suggestion.relevanceScore / 10) * 5)
    : 0;

  return (
    <Card className={isDismissed ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{suggestion.topic}</CardTitle>
          <div className="flex items-center gap-2">
            {suggestion.relevanceScore !== null && (
              <Badge variant="info" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {suggestion.relevanceScore.toFixed(1)}/10
              </Badge>
            )}
            {suggestion.difficulty && (
              <Badge variant="default" className="capitalize text-xs">
                {suggestion.difficulty}
              </Badge>
            )}
          </div>
        </div>
        {suggestion.estimatedHours && (
          <p className="text-xs text-secondary-500 mt-1">
            Estimated: ~{suggestion.estimatedHours} hours
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestion.description && (
          <p className="text-sm text-secondary-600">{suggestion.description}</p>
        )}

        {suggestion.practiceActivities && suggestion.practiceActivities.length > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary-900 mb-1">Practice Activities:</p>
                <ul className="text-xs text-primary-800 list-disc list-inside space-y-0.5">
                  {suggestion.practiceActivities.slice(0, 3).map((activity, idx) => (
                    <li key={idx}>{activity}</li>
                  ))}
                  {suggestion.practiceActivities.length > 3 && (
                    <li className="text-primary-600 italic">
                      +{suggestion.practiceActivities.length - 3} more
                    </li>
                  )}
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

        {!suggestion.practiceActivities && suggestion.valueProposition && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary-900">{suggestion.valueProposition}</p>
            </div>
          </div>
        )}

        {!isAccepted && !isDismissed && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={onAccept}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={onDismiss}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isAccepted && (
          <div className="pt-2">
            <Badge variant="success" className="w-full justify-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Accepted
            </Badge>
          </div>
        )}

        {isDismissed && (
          <div className="pt-2">
            <Badge variant="default" className="w-full justify-center">
              Dismissed
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

