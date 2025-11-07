"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGoal } from "@/lib/hooks/useGoals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { X } from "lucide-react";

const goalSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  targetDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface CreateGoalFormProps {
  studentId: string;
  onClose: () => void;
}

export function CreateGoalForm({ studentId, onClose }: CreateGoalFormProps) {
  const createGoal = useCreateGoal();
  const { addNotification } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      await createGoal.mutateAsync({
        studentId,
        subject: data.subject,
        description: data.description,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      });
      addNotification({
        type: "success",
        message: "Goal created successfully!",
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
          <CardTitle>Create New Goal</CardTitle>
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
          <div className="flex gap-2">
            <Button type="submit" loading={createGoal.isPending}>
              Create Goal
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

