import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Goal } from "@/types";
import { goalsApi, CreateGoalData } from "@/lib/api/goals";

export function useGoals(studentId: string) {
  return useQuery({
    queryKey: ["goals", studentId],
    queryFn: async () => {
      const response = await goalsApi.getGoals(studentId);
      return response.data;
    },
    enabled: !!studentId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalData) => goalsApi.createGoal(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals", variables.studentId] });
    },
  });
}

export function useCompleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => goalsApi.completeGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export interface UpdateGoalData {
  subject?: string;
  description?: string;
  targetDate?: Date | null;
  progress?: number;
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: UpdateGoalData }) =>
      goalsApi.updateGoal(goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => goalsApi.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

