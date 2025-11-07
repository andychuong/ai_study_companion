import apiClient from "./client";
import { Progress } from "@/types";

export const progressApi = {
  getProgress: (studentId: string) =>
    apiClient.get<Progress>(`/progress/student/${studentId}`),
};

