"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useGoals, useCompleteGoal, useUpdateGoal, useDeleteGoal } from "@/lib/hooks/useGoals";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { Target, Plus } from "lucide-react";
import { CreateGoalForm } from "@/components/goals/CreateGoalForm";
import { EditGoalForm } from "@/components/goals/EditGoalForm";
import { GoalCard } from "@/components/goals/GoalCard";
import { Goal } from "@/types";

export default function GoalsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: goals, isLoading } = useGoals(user?.id || "");
  const completeGoal = useCompleteGoal();
  const deleteGoal = useDeleteGoal();
  const { addNotification } = useUIStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

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
            // Invalidate suggestions so they refresh in the suggestions tab
            queryClient.invalidateQueries({ queryKey: ["suggestions", user?.id] });
            addNotification({
              type: "success",
              message: "Goal created successfully! Check the Suggestions tab for study topics.",
            });
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

    </div>
  );
}

