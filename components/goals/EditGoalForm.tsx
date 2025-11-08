"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateGoal } from "@/lib/hooks/useGoals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { X } from "lucide-react";
import { Goal } from "@/types";
import { format } from "date-fns";

const goalSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  targetDate: z.string().optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface EditGoalFormProps {
  goal: Goal;
  onClose: () => void;
}

export function EditGoalForm({ goal, onClose }: EditGoalFormProps) {
  const updateGoal = useUpdateGoal();
  const { addNotification } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      subject: goal.subject,
      description: goal.description,
      targetDate: goal.targetDate
        ? format(new Date(goal.targetDate), "yyyy-MM-dd")
        : undefined,
      progress: goal.progress,
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      await updateGoal.mutateAsync({
        goalId: goal.id,
        data: {
          subject: data.subject,
          description: data.description,
          targetDate: data.targetDate ? new Date(data.targetDate) : null,
          progress: data.progress,
        },
      });
      addNotification({
        type: "success",
        message: "Goal updated successfully!",
      });
      reset();
      onClose();
    } catch (error) {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Goal</CardTitle>
          <Button variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Subject"
            placeholder="e.g., Chemistry, SAT Prep"
            error={errors.subject?.message}
            {...register("subject")}
          />
          <Input
            label="Description"
            placeholder="Describe your goal..."
            error={errors.description?.message}
            {...register("description")}
          />
          <Input
            label="Target Date (Optional)"
            type="date"
            error={errors.targetDate?.message}
            {...register("targetDate")}
          />
          <Input
            label="Progress (%)"
            type="number"
            min={0}
            max={100}
            error={errors.progress?.message}
            {...register("progress", { valueAsNumber: true })}
          />
          <div className="flex gap-2">
            <Button type="submit" loading={updateGoal.isPending}>
              Update Goal
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

