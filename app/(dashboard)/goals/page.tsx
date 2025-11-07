"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useGoals, useCompleteGoal } from "@/lib/hooks/useGoals";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { suggestionsApi } from "@/lib/api/suggestions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { Target, Plus } from "lucide-react";
import { CreateGoalForm } from "@/components/goals/CreateGoalForm";
import { GoalCard } from "@/components/goals/GoalCard";
import { SuggestionsModal } from "@/components/goals/SuggestionsModal";

export default function GoalsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: goals, isLoading } = useGoals(user?.id || "");
  const completeGoal = useCompleteGoal();
  const { addNotification } = useUIStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

  // Fetch suggestions when modal is shown
  const { data: suggestionsData } = useQuery({
    queryKey: ["suggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return { suggestions: [] };
      const response = await suggestionsApi.getStudentSuggestions(user.id);
      return response.data;
    },
    enabled: !!user?.id && showSuggestionsModal,
  });

  const handleComplete = async (goalId: string) => {
    try {
      await completeGoal.mutateAsync(goalId);
      
      // Wait a moment for Inngest to generate suggestions, then check
      setTimeout(async () => {
        queryClient.invalidateQueries({ queryKey: ["suggestions", user?.id] });
        // Check for new suggestions
        try {
          const response = await suggestionsApi.getStudentSuggestions(user?.id || "");
          const pendingSuggestions = response.data.suggestions.filter(
            (s) => s.status === "pending"
          );
          if (pendingSuggestions.length > 0) {
            setShowSuggestionsModal(true);
          } else {
            addNotification({
              type: "success",
              message: "Goal completed! Great job! Subject suggestions will be available soon.",
            });
          }
        } catch (error) {
          // If suggestions aren't ready yet, just show success
          addNotification({
            type: "success",
            message: "Goal completed! Great job!",
          });
        }
      }, 2000);
    } catch (error) {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 bg-secondary-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-80 bg-secondary-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-secondary-200 rounded animate-pulse" />
        </div>
        <CardSkeleton count={2} />
      </div>
    );
  }

  const activeGoals = goals?.filter((g) => g.status === "active") || [];
  const completedGoals = goals?.filter((g) => g.status === "completed") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Goals</h1>
          <p className="text-secondary-600 mt-1">Track your learning goals</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && user?.id && (
        <CreateGoalForm
          studentId={user.id}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* Active Goals */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Active Goals</h2>
        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600 mb-4">No active goals</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                variant="active"
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Completed Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} variant="completed" />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Modal */}
      {showSuggestionsModal && suggestionsData && (
        <SuggestionsModal
          suggestions={suggestionsData.suggestions.filter((s) => s.status === "pending")}
          onClose={() => setShowSuggestionsModal(false)}
          onAccept={(suggestionId) => {
            suggestionsApi.acceptSuggestion(suggestionId).then(() => {
              queryClient.invalidateQueries({ queryKey: ["suggestions", user?.id] });
              queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
              addNotification({
                type: "success",
                message: "Suggestion accepted! A new goal has been created.",
              });
            });
          }}
          onDismiss={(suggestionId) => {
            suggestionsApi.dismissSuggestion(suggestionId).then(() => {
              queryClient.invalidateQueries({ queryKey: ["suggestions", user?.id] });
            });
          }}
        />
      )}
    </div>
  );
}

