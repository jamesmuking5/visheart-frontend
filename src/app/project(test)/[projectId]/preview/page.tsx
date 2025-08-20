"use client";

import { useParams } from "next/navigation";
import { useProject } from "@/context/ProjectContext";

// Custom components
import { NoProjectFound } from "@/components/project(test)/NoProjectFound";
import { ErrorProject } from "@/components/project(test)/ErrorProject";
import { ShowProjectData } from "@/components/project(test)/ShowProjectData";
import { LoadingProject } from "@/components/project(test)/LoadingProject";
import { DebugProjectPageInfo } from "@/components/project(test)/DebugProjectPageInfo";
import { DebugMRIViewer } from "@/components/project(test)/DebugMRIViewer";

export default function PreviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    loading,
    projectData,
    hasMasks,
    undecodedMasks,
    decodedMasks,
    jobs,
    error,
    jobsError,
  } = useProject();

  // Missing projectId handling
  if (!projectId) return <NoProjectFound message="Project ID is missing." />;
  
  // Loading state
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;
  
  // Error states
  if (error) return <ErrorProject error={error} />;

  return projectData ? (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Simple name and description viewer */}
        <DebugProjectPageInfo projectData={projectData} />
        
        {/* Debug MRI Image Viewer */}
        <DebugMRIViewer projectId={projectId} />
        
        {/* Mask Viewer - Show decoded masks when available */}
        {/* {hasMasks && decodedMasks && <MaskViewer decodedMasks={decodedMasks} projectDimensions={projectData.dimensions} />} */}
        
        {/* Sheet to show project, mask or job metadata on a right-side popup */}
        <ShowProjectData 
          project={projectData} 
          hasMasks={hasMasks} 
          decodedMasks={decodedMasks} 
          masks={undecodedMasks} 
          jobs={jobs} 
          jobsError={jobsError} 
        />
      </div>
    </div>
  ) : null;
}
