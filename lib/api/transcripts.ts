import apiClient from "./client";
import { Session } from "@/types";

export interface UploadTranscriptData {
  tutorId: string;
  sessionDate: string; // ISO datetime string
  duration: number; // in seconds
  transcript: string;
  transcriptSource: "read_ai" | "manual_upload" | "api_import" | "other";
  transcriptFormat: "plain_text" | "json" | "csv" | "markdown";
}

export interface UploadTranscriptResponse {
  sessionId: string;
  status: "processing" | "completed";
}

export const transcriptApi = {
  upload: (data: UploadTranscriptData) =>
    apiClient.post<UploadTranscriptResponse>("/transcripts/upload", data),

  getSession: (sessionId: string) =>
    apiClient.get<Session>(`/transcripts/${sessionId}`),

  getStudentSessions: (studentId: string, params?: { limit?: number; offset?: number }) =>
    apiClient.get<Session[]>(`/transcripts/student/${studentId}`, { params }),
};

