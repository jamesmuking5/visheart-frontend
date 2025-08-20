"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProjectProvider } from "@/context/ProjectContext";
import { ProjectDashboardBar } from "@/components/project(test)/ProjectDashboardBar";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <ProtectedRoute allowedRoles={["guest", "user", "admin"]}>
      {projectId && (
        <ProjectProvider projectId={projectId}>
          <div className="min-h-screen bg-background">
            <ProjectDashboardBar />
            <div className="container mx-auto">{children}</div>
          </div>
        </ProjectProvider>
      )}
    </ProtectedRoute>
  );
}
