"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { practiceApi } from "@/lib/api/practice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Session } from "@/types";

interface SessionDetailModalProps {
  session: Session;
  onClose: () => void;
}

export function SessionDetailModal({ session, onClose }: SessionDetailModalProps) {
  const router = useRouter();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  const generatePracticeMutation = useMutation({
    mutationFn: async () => {
      // Filter out invalid concept IDs (must be valid UUIDs)
      const validConceptIds = session.concepts
        .map((c) => c.id)
        .filter((id) => {
          // Check if it's a valid UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return id && uuidRegex.test(id);
        });
      
      const response = await practiceApi.generate({
        sessionId: session.id,
        conceptIds: validConceptIds.length > 0 ? validConceptIds : undefined,
      });
      return response.data;
    },
    onSuccess: (data) => {
      addNotification({
        type: "success",
        message: data.message || "Practice problems are being generated! You'll be notified when they're ready.",
      });
      // Invalidate practices query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["practices"] });
      // Navigate to the practice page
      router.push(`/practice/${data.practiceId}`);
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Session Details</CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-600">Date</p>
              <p className="font-medium">
                {format(new Date(session.date), "MMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Duration</p>
              <p className="font-medium">{Math.round(session.duration / 60)} minutes</p>
            </div>
          </div>

          {session.topics.length > 0 && (
            <div>
              <p className="text-sm text-secondary-600 mb-2">Topics Covered</p>
              <div className="flex flex-wrap gap-2">
                {session.topics.map((topic, idx) => (
                  <Badge key={idx} variant="info">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {session.concepts.length > 0 && (
            <div>
              <p className="text-sm text-secondary-600 mb-2">Concepts</p>
              <div className="space-y-2">
                {session.concepts.map((concept) => (
                  <div key={concept.id} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                    <span className="font-medium">{concept.name}</span>
                    <Badge variant={concept.masteryLevel >= 80 ? "success" : "warning"}>
                      {concept.masteryLevel}% mastery
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-secondary-600 mb-2">Transcript</p>
            <div className="p-4 bg-secondary-50 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{session.transcript}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => generatePracticeMutation.mutate()}
              loading={generatePracticeMutation.isPending}
              disabled={session.analysisStatus !== "completed"}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Generate Practice Problems
            </Button>
            {session.analysisStatus !== "completed" && (
              <p className="text-sm text-secondary-500 self-center ml-2">
                Session analysis must be completed before generating practice
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

