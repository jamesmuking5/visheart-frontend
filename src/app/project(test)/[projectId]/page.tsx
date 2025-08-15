"use client";

// Core React and Next.js imports
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

// Custom components
import { NoProjectFound } from "@/components/project(test)/NoProjectFound";
import { ErrorProject } from "@/components/project(test)/ErrorProject";
import { ShowProjectData } from "@/components/project(test)/ShowProjectData";
import { LoadingProject } from "@/components/project(test)/LoadingProject";
import { DebugProjectPageInfo } from "@/components/project(test)/DebugProjectPageInfo";

// Custom utilities
import { projectApi, segmentationApi } from "@/lib/api";
import { decodeSegmentationMasks } from "@/lib/decode-RLE(test)";

// Type definitions
import * as ProjectTypes from "@/types/project(test)";

// Type for Loading
import { LoadingStage } from "@/types/project(test)";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState<LoadingStage>("idle"); // Page loading

  // General state variables
  const [error, setError] = useState<string | null>(null); // Page error state

  // 1. Fetch project data from backend
  const [projectData, setProjectData] = useState<ProjectTypes.ProjectData | null>(null); // Project data as fetched from the API
  useEffect(() => {
    setLoading("project"); // Set loading state for project data

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
        // Simulate a delay for loading state (todo)
        setTimeout(() => {
          setLoading("idle");
        }, 500);
      });
  }, [projectId]);

  // 2. If projectId exists, check if segmentation masks exist (useEffect relies on projectData)
  // If masks exist, fetch and decode right away
  const [hasMasks, setHasMasks] = useState<boolean>(false); // State to track if masks exist, if not, check jobs
  const [undecodedMasks, setUndecodedMasks] = useState<ProjectTypes.BaseSegmentationMask[] | null>(null); //
  const [segmentationError, setSegmentationError] = useState<string | null>(null);
  const decodedMasks = useRef<Record<string, Uint8Array> | null>(null); // Decoded masks state
  const [maskFetchDone, setMaskFetchDone] = useState<boolean>(false); // Track when mask fetch completes

  useEffect(() => {
    setLoading("mask"); // Set loading state for segmentation masks

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
        // Handle segmentation masks (todo: decode them)
        console.log("Segmentation masks response:", response);
        console.log("Decoded masks ref:", decodedMasks.current);

        // If masks not found in backend, set mask error state, but not project/page error
        if (!response.success) {
          setHasMasks(false);
          setSegmentationError(response.message);
          decodedMasks.current = null; // Reset decoded masks
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
        decodedMasks.current = decodeSegmentationMasks(response.segmentations, projectData?.dimensions?.width || 0, projectData?.dimensions?.height || 0).masks; // Store in ref
        console.log("Decoded masks:", decodedMasks.current);
      })
      .catch((error: unknown) => {
        setSegmentationError("Failed to fetch segmentation masks.");
        console.error("Error fetching segmentation masks:", error);
      })
      .finally(() => {
        // Simulate a delay for loading state (todo)
        setTimeout(() => {
          setLoading("done");
          setMaskFetchDone(true); // mark mask fetch as completed
        }, 500);
      });
  }, [projectData, projectId, error]);

  // 3. If no masks exist, check if jobs exist
  // If jobs exist, filter by the status, if in_progress, segmentation already running, so do not show start segmentation button
  // If job completed, logical error, since we should have masks, throw error (?) or recommend to re-create project
  // If no jobs exist, show start segmentation button
  const [jobs, setJobs] = useState<ProjectTypes.UserJob[] | null>(null); // Jobs data state
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => {
    // If masks are present, clear any previous job error about missing results
    if (hasMasks && jobsError) {
      setJobsError(null);
    }

    // Only fetch jobs if mask fetch is done, we don't have masks, and project data is loaded
    // Don't block on segmentationError (e.g., 'No masks found')
    if (maskFetchDone && !hasMasks && projectData && projectId) {
      setLoading("job"); // Set loading state for job data

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
  }, [maskFetchDone, hasMasks, projectData, segmentationError, projectId]);

  // Missing projectId handling (to do)
  if (!projectId) return <NoProjectFound message="Project ID is missing." />;
  // Loading state (to do)
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;
  // Error states (project, masks, jobs)
  if (error) return <ErrorProject error={error} />;
  // Todo: if no masks, check jobs, and if no jobs, show start segmentation button
  // if (segmentationError) return <ErrorProject error={segmentationError} />;

  return projectData ? (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Simple name and description viewer */}
        <DebugProjectPageInfo projectData={projectData} />
        {/* Sheet to show project, mask or job metadata on a right-side popup */}
        <ShowProjectData project={projectData} hasMasks={hasMasks} decodedMasks={decodedMasks.current} masks={undecodedMasks} jobs={jobs} jobsError={jobsError} />
      </div>
    </div>
  ) : null;
}
