"use client";

import { useParams } from "next/navigation";
import { useProject } from "@/context/ProjectContext";

// Custom components
import { NoProjectFound } from "@/components/project(test)/noProjectFound";
import { ErrorProject } from "@/components/project(test)/ErrorProject";
import { LoadingProject } from "@/components/project(test)/LoadingProject";
import { DebugProjectPageInfo } from "@/components/project(test)/DebugProjectPageInfo";
import { DebugMRIViewer } from "@/components/project(test)/DebugMRIViewer";

export default function PreviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { loading, projectData, error } = useProject();

  // Missing projectId handling
  if (!projectId) return <NoProjectFound message="Project ID is missing." />;

  // Loading state
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;

  // Error states
  if (error) return <ErrorProject error={error} />;

  return projectData ? (
    <div className="p-6 space-y-6">
      {/* Simple name and description viewer */}
      {/* <DebugProjectPageInfo projectData={projectData} /> */}

      {/* Debug MRI Image Viewer */}
      <DebugMRIViewer projectId={projectId} />
    </div>
  ) : null;
}
