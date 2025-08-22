"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { projectApi, segmentationApi } from "@/lib/api";
import { decodeSegmentationMasks } from "@/lib/decode-RLE(test)";
import * as ProjectTypes from "@/types/project(test)";
import { LoadingStage } from "@/types/project(test)";

interface ProjectContextType {
  // Loading states
  loading: LoadingStage;

  // Data states
  projectData: ProjectTypes.ProjectData | null;
  hasMasks: boolean;
  undecodedMasks: ProjectTypes.BaseSegmentationMask[] | null;
  decodedMasks: Record<string, Uint8Array> | null;
  jobs: ProjectTypes.UserJob[] | null;

  // Error states
  error: string | null;
  segmentationError: string | null;
  jobsError: string | null;

  // Status flags
  maskFetchDone: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

interface ProjectProviderProps {
  children: ReactNode;
  projectId: string;
}

export function ProjectProvider({ children, projectId }: ProjectProviderProps) {
  const [loading, setLoading] = useState<LoadingStage>("idle");

  // General state variables
  const [error, setError] = useState<string | null>(null);

  // 1. Project data state
  const [projectData, setProjectData] = useState<ProjectTypes.ProjectData | null>(null);

  // 2. Masks state
  const [hasMasks, setHasMasks] = useState<boolean>(false);
  const [undecodedMasks, setUndecodedMasks] = useState<ProjectTypes.BaseSegmentationMask[] | null>(null);
  const [segmentationError, setSegmentationError] = useState<string | null>(null);
  const decodedMasksRef = useRef<Record<string, Uint8Array> | null>(null);
  const [maskFetchDone, setMaskFetchDone] = useState<boolean>(false);

  // 3. Jobs state
  const [jobs, setJobs] = useState<ProjectTypes.UserJob[] | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // 1. Fetch project data from backend
  useEffect(() => {
    setLoading("project");

    // Check if projectId is available
    if (!projectId) {
      setProjectData(null);
      setError("Project ID is missing.");
      setLoading("done");
      return;
    }

    // Fetch project data using the projectId
    projectApi
      .getProjectInfo(projectId)
      .then((response) => {
        // If backend cannot find project, set error state, end loading
        if (!response.success) {
          setError(response.message);
          setLoading("done");
          return;
        }

        // Handle project data
        setProjectData(response.project);
        console.log("Verifying project data:", response.project);
      })
      .catch((error: unknown) => {
        setError("Failed to fetch project data.");
        console.error("Error fetching project:", error);
      })
      .finally(() => {
        setLoading("idle");
      });
  }, [projectId]);

  // 2. If projectId exists, check if segmentation masks exist
  useEffect(() => {
    setLoading("mask");

    // If there is an error fetching project data, do not proceed with fetching masks
    if (error || !projectId) {
      setLoading("done");
      return;
    }

    // Reset mask fetch done when project changes
    setMaskFetchDone(false);

    // Fetch segmentation masks for the project
    segmentationApi
      .getSegmentationResults(projectId)
      .then((response) => {
        // Handle segmentation masks
        console.log("Segmentation masks response:", response);
        console.log("Decoded masks ref:", decodedMasksRef.current);

        // If masks not found in backend, set mask error state, but not project/page error
        if (!response.success) {
          setHasMasks(false);
          setSegmentationError(response.message);
          decodedMasksRef.current = null;
          console.warn("No masks found:", response.message);
          return;
        }

        // Set into undecoded masks state, then start decoding
        setUndecodedMasks(response.segmentations);
        // Determine if masks actually exist (non-empty set)
        const hasAnyMasks = Array.isArray(response.segmentations) && response.segmentations.length > 0;
        setHasMasks(hasAnyMasks);
        console.log("Undecoded masks:", response.segmentations);

        // Decode the masks
        decodedMasksRef.current = decodeSegmentationMasks(response.segmentations, projectData?.dimensions?.width || 0, projectData?.dimensions?.height || 0).masks;
        console.log("Decoded masks:", decodedMasksRef.current);
      })
      .catch((error: unknown) => {
        setSegmentationError("Failed to fetch segmentation masks.");
        console.error("Error fetching segmentation masks:", error);
      })
      .finally(() => {
        setLoading("done");
        setMaskFetchDone(true);
      });
  }, [projectData, projectId, error]);

  // 3. If no masks exist, check if jobs exist
  useEffect(() => {
    // If masks are present, clear any previous job error about missing results
    if (hasMasks && jobsError) {
      setJobsError(null);
    }

    // Only fetch jobs if mask fetch is done, we don't have masks, and project data is loaded
    // Don't block on segmentationError (e.g., 'No masks found')
    if (maskFetchDone && !hasMasks && projectData && projectId) {
      setLoading("job");

      // Fetch jobs for the current user
      segmentationApi
        .getUserJobs()
        .then((response) => {
          console.log("Jobs response:", response);

          // Handle job fetch error
          if (!response.success) {
            setJobsError(response.message);
            console.warn("Failed to fetch jobs:", response.message);
            setJobs(null);
            return;
          }

          // Filter jobs by current project ID
          const projectJobs = response.jobs.filter((job: ProjectTypes.UserJob) => job.projectId === projectId);
          setJobs(projectJobs);
          console.log(`Found ${projectJobs.length} jobs for project ${projectId}:`, projectJobs);

          // Check for logical errors: completed jobs should have masks
          const completedJobs = projectJobs.filter((job: ProjectTypes.UserJob) => job.status === ProjectTypes.JobStatus.COMPLETED);
          if (completedJobs.length > 0 && !hasMasks) {
            console.warn(`Warning: Found ${completedJobs.length} completed job(s) but no masks for project ${projectId}. This may indicate a server-side issue.`);
            setJobsError(`Found completed segmentation job(s) but no results. Please contact support or try re-creating the project.`);
          }
        })
        .catch((error: unknown) => {
          setJobsError("Failed to fetch job data.");
          console.error("Error fetching jobs:", error);
          setJobs(null);
        })
        .finally(() => {
          setLoading("done");
        });
    } else if (!maskFetchDone) {
      // wait for mask fetch to complete before deciding about jobs
      return;
    } else {
      // If we have masks or there's an error, no need to fetch jobs
      setLoading("done");
    }
  }, [maskFetchDone, hasMasks, projectData, segmentationError, projectId, jobsError]);

  const contextValue: ProjectContextType = {
    loading,
    projectData,
    hasMasks,
    undecodedMasks,
    decodedMasks: decodedMasksRef.current,
    jobs,
    error,
    segmentationError,
    jobsError,
    maskFetchDone,
  };

  return <ProjectContext.Provider value={contextValue}>{children}</ProjectContext.Provider>;
}
