"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { transcriptApi, UploadTranscriptData } from "@/lib/api/transcripts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { X } from "lucide-react";
import apiClient from "@/lib/api/client";

const uploadSchema = z.object({
  tutorId: z.string().uuid("Please select a tutor"),
  sessionDate: z.string().min(1, "Session date is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(600, "Duration cannot exceed 600 minutes"),
  transcript: z.string().min(10, "Transcript must be at least 10 characters"),
  transcriptSource: z.enum(["read_ai", "manual_upload", "api_import", "other"]),
  transcriptFormat: z.enum(["plain_text", "json", "csv", "markdown"]),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  onClose: () => void;
  studentId?: string;
}

export function UploadForm({ onClose, studentId }: UploadFormProps) {
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  // Get tutors list
  const { data: tutors } = useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const response = await apiClient.get<Array<{ id: string; email: string; name: string }>>("/tutors/list");
      return response.data;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadTranscriptData) => {
      const response = await transcriptApi.upload(data);
      return response.data;
    },
    onSuccess: () => {
      addNotification({
        type: "success",
        message: "Transcript uploaded successfully! Analysis will begin shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["sessions", studentId] });
      onClose();
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      transcriptSource: "manual_upload",
      transcriptFormat: "plain_text",
      duration: 60, // Default 60 minutes
      sessionDate: new Date().toISOString().slice(0, 16), // Default to current date/time in datetime-local format
    },
  });

  const onSubmit = async (data: UploadFormData) => {
    // Convert duration from minutes to seconds
    const durationInSeconds = data.duration * 60;
    
    // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO string
    const sessionDateISO = data.sessionDate.includes("T")
      ? `${data.sessionDate}:00Z` // Add seconds and UTC timezone
      : `${data.sessionDate}T12:00:00Z`; // Fallback if no time provided

    await uploadMutation.mutateAsync({
      tutorId: data.tutorId,
      sessionDate: sessionDateISO,
      duration: durationInSeconds,
      transcript: data.transcript,
      transcriptSource: data.transcriptSource,
      transcriptFormat: data.transcriptFormat,
    });
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upload Session Transcript</CardTitle>
          <Button variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Tutor <span className="text-error">*</span>
              </label>
              <select
                {...register("tutorId")}
                className="flex h-10 w-full rounded-md border border-secondary-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a tutor</option>
                {tutors?.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name} ({tutor.email})
                  </option>
                ))}
              </select>
              {errors.tutorId && <p className="mt-1 text-sm text-error">{errors.tutorId.message}</p>}
            </div>

            <Input
              label="Session Date"
              type="datetime-local"
              error={errors.sessionDate?.message}
              required
              {...register("sessionDate")}
            />

            <Input
              label="Duration (minutes)"
              type="number"
              min="1"
              max="600"
              error={errors.duration?.message}
              required
              {...register("duration", { valueAsNumber: true })}
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Source <span className="text-error">*</span>
              </label>
              <select
                {...register("transcriptSource")}
                className="flex h-10 w-full rounded-md border border-secondary-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="manual_upload">Manual Upload</option>
                <option value="read_ai">Read.ai</option>
                <option value="api_import">API Import</option>
                <option value="other">Other</option>
              </select>
              {errors.transcriptSource && <p className="mt-1 text-sm text-error">{errors.transcriptSource.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Format <span className="text-error">*</span>
              </label>
              <select
                {...register("transcriptFormat")}
                className="flex h-10 w-full rounded-md border border-secondary-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="plain_text">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              {errors.transcriptFormat && <p className="mt-1 text-sm text-error">{errors.transcriptFormat.message}</p>}
            </div>
          </div>

          <Textarea
            label="Transcript"
            placeholder="Paste or type the session transcript here..."
            rows={10}
            error={errors.transcript?.message}
            required
            {...register("transcript")}
          />

          <div className="flex gap-2">
            <Button type="submit" loading={uploadMutation.isPending}>
              Upload Transcript
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

