import apiClient from "./client";
import { Goal } from "@/types";

export interface CreateGoalData {
  studentId: string;
  subject: string;
  description: string;
  targetDate?: Date;
}

export const goalsApi = {
  getGoals: (studentId: string) =>
    apiClient.get<Goal[]>(`/goals/student/${studentId}`),

  createGoal: (data: CreateGoalData) =>
    apiClient.post<Goal>("/goals", data),

  completeGoal: (goalId: string) =>
    apiClient.put<Goal>(`/goals/${goalId}/complete`),

  updateGoal: (goalId: string, data: Partial<CreateGoalData>) =>
    apiClient.put<Goal>(`/goals/${goalId}`, data),

  deleteGoal: (goalId: string) =>
    apiClient.delete(`/goals/${goalId}`),
};

