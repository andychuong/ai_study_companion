"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-secondary-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <Link href="/register">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Registration
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms & Conditions</CardTitle>
            <p className="text-sm text-secondary-600 mt-2">Last updated: November 7, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-secondary-700">
              <section>
                <h2 className="text-xl font-semibold text-secondary-900 mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using AI Study Companion, you accept and agree to be bound by the terms
                  and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-secondary-900 mb-3">2. Use License</h2>
                <p>
                  Permission is granted to temporarily use AI Study Companion for personal, non-commercial
                  educational purposes. This is the grant of a license, not a transfer of title, and under
                  this license you may not:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or other proprietary notations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-secondary-900 mb-3">3. User Accounts</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account and password. You
                  agree to accept responsibility for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-secondary-900 mb-3">4. Privacy Policy</h2>
                <p>
                  Your use of AI Study Companion is also governed by our Privacy Policy. Please review our
                  Privacy Policy to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-secondary-900 mb-3">5. Limitation of Liability</h2>
                <p>
                  AI Study Companion shall not be liable for any indirect, incidental, special, consequential,
                  or punitive damages resulting from your use or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-secondary-900 mb-3">6. Contact Information</h2>
                <p>
                  If you have any questions about these Terms & Conditions, please contact us at
                  support@aistudycompanion.com
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

