"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
  onComplete?: (goalId: string) => void;
  variant?: "active" | "completed";
}

export function GoalCard({ goal, onComplete, variant = "active" }: GoalCardProps) {
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
          {goal.completedAt && (
            <p>
              <span className="font-medium">
                {variant === "active" ? "Target:" : "Completed:"}
              </span>{" "}
              {format(new Date(goal.completedAt), "MMM d, yyyy")}
            </p>
          )}
        </div>

        {variant === "active" && onComplete && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onComplete(goal.id)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

