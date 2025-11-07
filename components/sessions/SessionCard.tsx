"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Session } from "@/types";

interface SessionCardProps {
  session: Session;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Analyzed</Badge>;
      case "processing":
        return <Badge variant="warning">Processing</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {session.topics.length > 0 ? session.topics[0] : "Session"}
            </CardTitle>
            <p className="text-sm text-secondary-600 mt-1">
              {format(new Date(session.date), "MMM d, yyyy")}
            </p>
          </div>
          {getStatusBadge(session.analysisStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <Calendar className="h-4 w-4" />
          <span>{Math.round(session.duration / 60)} minutes</span>
        </div>
        {session.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {session.topics.slice(0, 3).map((topic, idx) => (
              <Badge key={idx} variant="info" className="text-xs">
                {topic}
              </Badge>
            ))}
            {session.topics.length > 3 && (
              <Badge variant="default" className="text-xs">
                +{session.topics.length - 3} more
              </Badge>
            )}
          </div>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

