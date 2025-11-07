import apiClient from "./client";
import { Practice, Question } from "@/types";

export interface GeneratePracticeData {
  sessionId: string;
  conceptIds?: string[];
}

export interface SubmitPracticeData {
  practiceId: string;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
}

export interface SubmitPracticeResponse {
  score: number;
  feedback: Array<{
    questionId: string;
    correct: boolean;
    explanation: string;
  }>;
  conceptMasteryUpdates: Array<{
    conceptId: string;
    masteryLevel: number;
  }>;
}

export interface GeneratePracticeResponse {
  practiceId: string;
  status: string;
  message: string;
}

export const practiceApi = {
  generate: (data: GeneratePracticeData) =>
    apiClient.post<GeneratePracticeResponse>("/practice/generate", data),

  getPractice: (practiceId: string) =>
    apiClient.get<Practice>(`/practice/${practiceId}`),

  submitPractice: (practiceId: string, answers: SubmitPracticeData["answers"]) =>
    apiClient.post<SubmitPracticeResponse>(`/practice/${practiceId}/submit`, { answers }),

  getStudentPractices: (studentId: string, params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get<Practice[]>(`/practice/student/${studentId}`, { params }),
};

