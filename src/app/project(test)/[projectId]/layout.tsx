"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProjectProvider } from "@/context/ProjectContext";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>();

  return <ProtectedRoute allowedRoles={["guest", "user", "admin"]}>{projectId && <ProjectProvider projectId={projectId}>{children}</ProjectProvider>}</ProtectedRoute>;
}
