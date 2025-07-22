"use client";

import { LoginForm } from "@/components/LoginForm";
import { RegistrationOnly } from "@/components/ProtectedRoute";

/**
 * Login Page Component
 *
 * Provides a dedicated login interface for users to authenticate.
 * This page is protected to prevent already authenticated users from accessing it.
 *
 * Features:
 * - User authentication with form validation
 * - Guest login support
 * - Responsive design
 * - Protected route (redirects authenticated users)
 *
 * @returns JSX.Element - Rendered login page
 */
export default function LoginPage() {
  return (
    <RegistrationOnly redirectTo="/">
      <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        <div className="w-full max-w-md">
          {/* Login Form Component */}
          <div className="bg-card/80 border-0 shadow-xl backdrop-blur-sm rounded-lg">
            <LoginForm />
          </div>
        </div>
      </div>
    </RegistrationOnly>
  );
}
