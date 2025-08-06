import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["guest", "user", "admin"]}>
      {children}
    </ProtectedRoute>
  );
}
