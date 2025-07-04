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
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  allowedRoles = ["user", "admin"],
  redirectTo = "/",
  fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    } else if (
      !loading &&
      user &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      router.push(redirectTo);
    }
  }, [user, loading, router, allowedRoles, redirectTo]);

  if (loading) {
    return <div>Loading...</div>;
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
  return (
    <ProtectedRoute allowedRoles={["admin"]} fallback={fallback}>
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
