"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useGoals, useCompleteGoal, useUpdateGoal, useDeleteGoal } from "@/lib/hooks/useGoals";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { suggestionsApi } from "@/lib/api/suggestions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { Target, Plus } from "lucide-react";
import { CreateGoalForm } from "@/components/goals/CreateGoalForm";
import { EditGoalForm } from "@/components/goals/EditGoalForm";
import { GoalCard } from "@/components/goals/GoalCard";
import { SuggestionsModal } from "@/components/goals/SuggestionsModal";
import { Goal } from "@/types";

export default function GoalsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: goals, isLoading } = useGoals(user?.id || "");
  const completeGoal = useCompleteGoal();
  const deleteGoal = useDeleteGoal();
  const { addNotification } = useUIStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Always fetch suggestions to check for new ones
  const { data: suggestionsData, refetch: refetchSuggestions } = useQuery({
    queryKey: ["suggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return { suggestions: [] };
      const response = await suggestionsApi.getStudentSuggestions(user.id);
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Check for pending suggestions when data changes
  useEffect(() => {
    if (suggestionsData?.suggestions && !showSuggestionsModal) {
      const pendingSuggestions = suggestionsData.suggestions.filter(
        (s) => s.status === "pending"
      );
      // Only auto-show if there are pending suggestions and user hasn't dismissed the modal
      if (pendingSuggestions.length > 0) {
        // Small delay to avoid showing immediately on page load
        const timer = setTimeout(() => {
          setShowSuggestionsModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [suggestionsData, showSuggestionsModal]);

  const handleComplete = async (goalId: string) => {
    try {
      await completeGoal.mutateAsync(goalId);
      addNotification({
        type: "success",
        message: "Goal completed! Great job!",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteGoal.mutateAsync(goalId);
      addNotification({
        type: "success",
        message: "Goal deleted successfully",
      });
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
          onSuccess={async () => {
            setShowCreateForm(false);
            queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
            
            // Start checking for suggestions with exponential backoff
            let attempts = 0;
            const maxAttempts = 10; // Check for up to ~30 seconds
            const checkForSuggestions = async () => {
              attempts++;
              try {
                await refetchSuggestions();
                const currentData = queryClient.getQueryData(["suggestions", user?.id]) as { suggestions: any[] } | undefined;
                const pendingSuggestions = currentData?.suggestions?.filter(
                  (s) => s.status === "pending"
                ) || [];
                
                if (pendingSuggestions.length > 0) {
                  setShowSuggestionsModal(true);
                } else if (attempts < maxAttempts) {
                  // Exponential backoff: 2s, 3s, 4s, 5s, etc.
                  setTimeout(checkForSuggestions, (attempts + 1) * 1000);
                }
              } catch (error) {
                // If suggestions aren't ready yet, retry
                if (attempts < maxAttempts) {
                  setTimeout(checkForSuggestions, (attempts + 1) * 1000);
                }
              }
            };
            
            // Start checking after initial delay
            setTimeout(checkForSuggestions, 2000);
          }}
        />
      )}

      {/* Edit Goal Form */}
      {editingGoal && (
        <EditGoalForm
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
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
                onEdit={handleEdit}
                onDelete={handleDelete}
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
          suggestions={(suggestionsData.suggestions || []).filter((s) => s.status === "pending")}
          onClose={() => {
            setShowSuggestionsModal(false);
            // Stop polling when modal is closed
            queryClient.setQueryData(["suggestions", user?.id], suggestionsData);
          }}
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

