"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { CheckCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
  onComplete?: (goalId: string) => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  variant?: "active" | "completed";
}

export function GoalCard({ goal, onComplete, onEdit, onDelete, variant = "active" }: GoalCardProps) {
  return (
    <Card className={variant === "completed" ? "opacity-75" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{goal.subject}</CardTitle>
            <p className="text-sm text-secondary-600 mt-1">{goal.description}</p>
          </div>
          <Badge variant={variant === "active" ? "warning" : "success"}>
            {variant === "active" ? "Active" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {variant === "active" && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-secondary-600">Progress</span>
              <span className="font-medium">{goal.progress}%</span>
            </div>
            <ProgressBar value={goal.progress} />
          </div>
        )}

        <div className="text-sm text-secondary-600">
          <p>
            <span className="font-medium">Created:</span>{" "}
            {format(new Date(goal.createdAt), "MMM d, yyyy")}
          </p>
          {goal.targetDate && variant === "active" && (
            <p>
              <span className="font-medium">Target:</span>{" "}
              {format(new Date(goal.targetDate), "MMM d, yyyy")}
            </p>
          )}
          {goal.completedAt && variant === "completed" && (
            <p>
              <span className="font-medium">Completed:</span>{" "}
              {format(new Date(goal.completedAt), "MMM d, yyyy")}
            </p>
          )}
        </div>

        {variant === "active" && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(goal)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onDelete(goal.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            {onComplete && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onComplete(goal.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

