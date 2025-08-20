"use client";

import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/context/ProjectContext";

// Custom components
import { NoProjectFound } from "@/components/project(test)/NoProjectFound";
import { ErrorProject } from "@/components/project(test)/ErrorProject";
import { LoadingProject } from "@/components/project(test)/LoadingProject";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { loading, projectData, error } = useProject();

  // Missing projectId handling
  if (!projectId) return <NoProjectFound message="Project ID is missing." />;
  
  // Loading state
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;
  
  // Error states
  if (error) return <ErrorProject error={error} />;

  return projectData ? (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-4">Project: {projectData.name}</h1>
          <p className="text-muted-foreground mb-6">{projectData.description}</p>
          
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/project(test)/${projectId}/preview`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
            >
              Go to Preview
            </button>
            
            <button
              onClick={() => router.push(`/project(test)/${projectId}/segmentation`)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md transition-colors"
            >
              Start Segmentation
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
