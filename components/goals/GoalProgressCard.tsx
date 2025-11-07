"use client";

import { GoalProgress } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface GoalProgressCardProps {
  goal: GoalProgress;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const getProgressVariant = (progress: number) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "warning";
    return "error";
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${
      goal.isNearingCompletion 
        ? "border-primary-300 bg-primary-50" 
        : "border-secondary-200 bg-white"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-secondary-900">{goal.subject}</h3>
            {goal.isNearingCompletion && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Almost there!
              </Badge>
            )}
          </div>
          <p className="text-sm text-secondary-600">{goal.description}</p>
        </div>
        <Badge variant={getProgressVariant(goal.progress)}>
          {goal.progress}%
        </Badge>
      </div>

      <ProgressBar
        value={goal.progress}
        variant={getProgressVariant(goal.progress)}
        className="mb-3"
      />

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-secondary-500">Sessions</p>
          <p className="font-semibold text-secondary-900">{goal.sessionsCount}</p>
        </div>
        <div>
          <p className="text-secondary-500">Practices</p>
          <p className="font-semibold text-secondary-900">{goal.practicesCount}</p>
        </div>
        <div>
          <p className="text-secondary-500">Avg Score</p>
          <p className="font-semibold text-secondary-900">{goal.averageScore}%</p>
        </div>
      </div>

      {goal.targetDate && goal.daysUntilTarget !== null && (
        <div className="mt-3 pt-3 border-t border-secondary-200 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-secondary-400" />
          <span className="text-secondary-600">
            {goal.daysUntilTarget > 0 
              ? `${goal.daysUntilTarget} days until target`
              : goal.daysUntilTarget === 0
              ? "Target date is today!"
              : `${Math.abs(goal.daysUntilTarget)} days past target`
            }
          </span>
        </div>
      )}
    </div>
  );
}

