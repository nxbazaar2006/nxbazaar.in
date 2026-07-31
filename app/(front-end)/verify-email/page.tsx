import { getData } from "@/lib/getData";
import { Info, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

interface VerifyMailPageProps {
  searchParams: Promise<{ userId?: string }>;
}

export default async function VerifyMail({ searchParams }: VerifyMailPageProps) {
  const { userId } = await searchParams;

  let email = "";
  let name = "";

  if (userId) {
    try {
      const user = await getData<{ email: string; name: string }>(`users/${userId}`);
      email = user?.email ?? "";
      name = user?.name ?? "";
    } catch {
      // user not found - continue with empty email
    }
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen mt-16 px-4">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
          <p className="text-green-100 text-sm mt-1">Almost there!</p>
        </div>

        {/* Body */}
        <div className="px-8 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wide">
              Account Created Successfully
            </span>
          </div>

          <p className="text-gray-600 text-base leading-relaxed mb-3">
            {name ? (
              <>
                Hi <span className="font-semibold text-gray-800">{name}</span>, we have sent a
                verification email to:
              </>
            ) : (
              "We have sent a verification email to:"
            )}
          </p>

          {email ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 inline-block">
              <span className="font-bold text-gray-800 text-sm break-all">{email}</span>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-6 inline-flex items-center gap-2">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-yellow-700 text-sm">
                Email address not available. Please check your inbox.
              </span>
            </div>
          )}

          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Click on the link in the email to verify your account and complete your onboarding
            process. If you don&apos;t see it, check your spam or junk folder.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Change Email
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
          <p className="text-xs text-gray-400">
            Didn&apos;t receive the email?{" "}
            <span className="text-green-600 font-medium cursor-pointer hover:underline">
              Resend verification email
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}