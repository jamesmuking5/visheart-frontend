// This component is used to block routes based on roles:
// Example:
// // src/app/reports/page.tsx
// "use client";

// import { ProtectedRoute } from "@/components/ProtectedRoute";

// export default function ReportsPage() {
//   return (
//     <ProtectedRoute allowedRoles={["analyst", "admin"]} fallback={<p>No access to reports.</p>}>
//       <h1>Reports</h1>
//       <p>Only users with the 'analyst' or 'admin' role can view this page.</p>
//     </ProtectedRoute>
//   );
// }

"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
  autoRedirect?: boolean; // New prop to control auto-redirection
}

export function ProtectedRoute({
  children,
  allowedRoles = ["user", "admin"],
  redirectTo = "/",
  fallback,
  autoRedirect = false, // Default to false to prevent automatic redirects
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && autoRedirect) {
      if (!user) {
        setShouldRedirect(true);
        router.push(redirectTo);
      } else if (
        user &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
      ) {
        setShouldRedirect(true);
        router.push(redirectTo);
      }
    }
  }, [user, loading, router, allowedRoles, redirectTo, autoRedirect]);

  // Show loading state during auth check
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-sm text-gray-600">Checking permissions...</span>
        </div>
      </div>
    );
  }

  // Show loading state during redirect
  if (shouldRedirect) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-sm text-gray-600">Redirecting...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback || <div>Access denied. Insufficient permissions.</div>;
  }

  return <>{children}</>;
}

// Specific role protection components
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const defaultFallback = (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This area is restricted to administrators only. If you need access,
            please contact your system administrator.
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute
      allowedRoles={["admin"]}
      fallback={fallback || defaultFallback}
    >
      {children}
    </ProtectedRoute>
  );
}

export function UserOrAdmin({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["user", "admin"]} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Registration protection - only allows guests and unauthenticated users
export function RegistrationOnly({
  children,
  redirectTo = "/dashboard",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role !== "guest") {
      // If user is authenticated and not a guest, redirect to dashboard
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state during auth check
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Allow access for unauthenticated users or guests
  if (!user || user.role === "guest") {
    return <>{children}</>;
  }

  // Show redirecting state for authenticated non-guest users
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <span className="text-sm text-gray-600">Redirecting to dashboard...</span>
      </div>
    </div>
  );
}
