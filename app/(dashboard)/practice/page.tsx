"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { usePractices } from "@/lib/hooks/usePractices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/ui/progress";
import Link from "next/link";
import { BookOpen, Search, Filter } from "lucide-react";
import { format } from "date-fns";

export default function PracticeListPage() {
  const { user } = useAuthStore();
  const { data: practices, isLoading } = usePractices(user?.id || "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-64 bg-secondary-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-secondary-200 rounded animate-pulse" />
        </div>
        <div className="rounded-lg border border-secondary-200 p-6">
          <div className="flex gap-4">
            <div className="h-10 flex-1 bg-secondary-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-secondary-200 rounded animate-pulse" />
          </div>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "in_progress":
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="default">Assigned</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Practice</h1>
          <p className="text-secondary-600 mt-1">Complete practice assignments to improve</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search practices..."
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Practice List */}
      {!practices || practices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 mb-4">No practices assigned yet</p>
            <p className="text-sm text-secondary-500">
              Complete a tutoring session to get practice assignments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {practices.map((practice) => {
            const progress = practice.status === "completed" ? 100 : practice.status === "in_progress" ? 50 : 0;
            
            return (
              <Card key={practice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{practice.subject || "Practice"}</CardTitle>
                      {practice.topic && (
                        <p className="text-sm text-secondary-600 mt-1">{practice.topic}</p>
                      )}
                    </div>
                    {getStatusBadge(practice.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-secondary-600">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>

                  <div className="text-sm text-secondary-600 space-y-1">
                    <p>
                      <span className="font-medium">Questions:</span> {practice.questions.length}
                    </p>
                    <p>
                      <span className="font-medium">Assigned:</span>{" "}
                      {format(new Date(practice.assignedAt), "MMM d, yyyy")}
                    </p>
                    {practice.score !== undefined && (
                      <p>
                        <span className="font-medium">Score:</span> {practice.score}%
                      </p>
                    )}
                  </div>

                  <Link href={`/practice/${practice.id}`}>
                    <Button className="w-full" variant={practice.status === "completed" ? "outline" : "primary"}>
                      {practice.status === "completed" ? "Review" : practice.status === "in_progress" ? "Continue" : "Start"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

