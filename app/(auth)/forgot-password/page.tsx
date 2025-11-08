"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // TODO: Implement password reset functionality
    setTimeout(() => {
      setMessage("Password reset functionality coming soon. Please contact support.");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Image 
              src="/logo.svg" 
              alt="AI Study Companion Logo" 
              width={48} 
              height={48}
              className="flex-shrink-0"
            />
            <h1 className="text-2xl font-bold text-primary-600">AI Study Companion</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <p className="text-sm text-secondary-600 mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {message && (
              <div className="p-3 bg-info-50 border border-info-200 rounded-lg text-sm text-info-700">
                {message}
              </div>
            )}

            <Button type="submit" className="w-full" loading={isLoading}>
              Send Reset Link
            </Button>

            <div className="text-center text-sm text-secondary-600">
              Remember your password?{" "}
              <Link href="/login" className="text-primary-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

