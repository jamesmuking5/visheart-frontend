"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { projectApi, segmentationApi } from "@/lib/api";
import { decodeSegmentationMasks } from "@/lib/decode-RLE(test)";
import { tarImageCache } from "@/lib/tar-image-cache";
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

  // NEW: Tar cache management
  tarCacheReady: boolean;
  tarCacheError: string | null;
  getMRIImage: (frame: number, slice: number) => Promise<string | null>;
  preloadMRIImages: () => Promise<void>;
  getAvailableFramesAndSlices: () => Promise<{ frames: number[]; slices: number[] }>;
  fetchAndExtractProjectImages: () => Promise<{ success: boolean; extractedImages: number; totalImages: number; errors: string[] }>;
  clearProjectCache: () => Promise<void>;
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
  const [decodedMasks, setDecodedMasks] = useState<Record<string, Uint8Array> | null>(null);
  const [maskFetchDone, setMaskFetchDone] = useState<boolean>(false);

  // 3. Jobs state
  const [jobs, setJobs] = useState<ProjectTypes.UserJob[] | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // 4. Tar cache state - NEW
  const [tarCacheReady, setTarCacheReady] = useState<boolean>(false);
  const [tarCacheError, setTarCacheError] = useState<string | null>(null);

  // Tar cache methods - NEW
  const getMRIImage = async (frame: number, slice: number): Promise<string | null> => {
    if (!projectId) return null;
    try {
      return await tarImageCache.getImageURL(projectId, frame, slice);
    } catch (error) {
      console.error("[ProjectContext] Failed to get MRI image:", error);
      return null;
    }
  };

  const preloadMRIImages = async (): Promise<void> => {
    if (!projectId || !projectData) return;

    try {
      const result = await tarImageCache.fetchAndExtractProjectImages(projectId, projectApi.getProjectPresignedUrl);
      if (result.success) {
        setTarCacheReady(true);
        setTarCacheError(null);
        console.log(`[ProjectContext] Preloaded ${result.extractedImages} images for project ${projectId}`);
      } else {
        setTarCacheError(`Failed to preload images: ${result.errors.join(", ")}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown preload error";
      setTarCacheError(errorMessage);
      console.error("[ProjectContext] Preload error:", error);
    }
  };

  const getAvailableFramesAndSlices = async (): Promise<{ frames: number[]; slices: number[] }> => {
    if (!projectId) return { frames: [], slices: [] };

    try {
      return await tarImageCache.getAvailableFramesAndSlices(projectId);
    } catch (error) {
      console.error("[ProjectContext] Failed to get available frames and slices:", error);
      return { frames: [], slices: [] };
    }
  };

  const fetchAndExtractProjectImages = async (): Promise<{ success: boolean; extractedImages: number; totalImages: number; errors: string[] }> => {
    if (!projectId) return { success: false, extractedImages: 0, totalImages: 0, errors: ["No project ID"] };

    try {
      const result = await tarImageCache.fetchAndExtractProjectImages(projectId, projectApi.getProjectPresignedUrl);
      if (result.success) {
        setTarCacheReady(true);
        setTarCacheError(null);
      } else {
        setTarCacheError(`Image extraction failed: ${result.errors.join(", ")}`);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown extraction error";
      setTarCacheError(errorMessage);
      console.error("[ProjectContext] Extraction error:", error);
      return { success: false, extractedImages: 0, totalImages: 0, errors: [errorMessage] };
    }
  };

  const clearProjectCache = async (): Promise<void> => {
    if (!projectId) return;

    try {
      await tarImageCache.clearProjectCache(projectId);
      setTarCacheReady(false);
      setTarCacheError(null);
      console.log(`[ProjectContext] Cleared cache for project ${projectId}`);
    } catch (error) {
      console.error("[ProjectContext] Failed to clear cache:", error);
      setTarCacheError(`Failed to clear cache: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // 1. Fetch project data from backend
  useEffect(() => {
    setLoading("project");

    // Check if projectId is available
    if (!projectId) {
      setProjectData(null);
      setError("Project ID is missing.");
      // Don't set loading to done here - let final loading state management handle it
      return;
    }

    // Fetch project data using the projectId
    projectApi
      .getProjectInfo(projectId)
      .then((response) => {
        // If backend cannot find project, set error state, end loading
        if (!response.success) {
          setError(response.message);
          // Don't set loading to done here - let final loading state management handle it
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
      // Don't set loading to done here - let final loading state management handle it
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
        console.log("Decoded masks state:", decodedMasks);

        // If masks not found in backend, set mask error state, but not project/page error
        if (!response.success) {
          setHasMasks(false);
          setSegmentationError(response.message);
          setDecodedMasks(null);
          console.warn("No masks found:", response.message);
          return;
        }

        // Set into undecoded masks state first
        setUndecodedMasks(response.segmentations);
        // Determine if masks actually exist (non-empty set)
        const hasAnyMasks = Array.isArray(response.segmentations) && response.segmentations.length > 0;
        setHasMasks(hasAnyMasks);
        console.log("Undecoded masks:", response.segmentations);

        // Only decode masks if we have valid project dimensions
        // This prevents race conditions where masks are decoded with width/height = 0
        if (projectData?.dimensions?.width && projectData?.dimensions?.height) {
          console.log("Decoding masks with dimensions:", projectData.dimensions);
          const decodedResult = decodeSegmentationMasks(
            response.segmentations, 
            projectData.dimensions.width, 
            projectData.dimensions.height
          );
          setDecodedMasks(decodedResult.masks);
          console.log("Decoded masks:", decodedResult.masks);
        } else {
          console.warn("Cannot decode masks - missing or invalid project dimensions:", projectData?.dimensions);
          // Don't set decodedMasks to null - leave it for retry when dimensions are available
        }
      })
      .catch((error: unknown) => {
        setSegmentationError("Failed to fetch segmentation masks.");
        console.error("Error fetching segmentation masks:", error);
      })
      .finally(() => {
        // Don't set loading to done here - let final loading state management handle it
        setMaskFetchDone(true);
      });
  }, [projectData, projectId, error]);

  // 2b. Retry mask decoding when project dimensions become available (fixes race condition)
  useEffect(() => {
    // Only retry if we have undecoded masks, valid dimensions, but no decoded masks yet
    if (
      undecodedMasks && 
      Array.isArray(undecodedMasks) && 
      undecodedMasks.length > 0 &&
      projectData?.dimensions?.width && 
      projectData?.dimensions?.height &&
      !decodedMasks
    ) {
      console.log("Retrying mask decoding with available dimensions:", projectData.dimensions);
      
      try {
        const decodedResult = decodeSegmentationMasks(
          undecodedMasks, 
          projectData.dimensions.width, 
          projectData.dimensions.height
        );
        setDecodedMasks(decodedResult.masks);
        console.log("Successfully decoded masks on retry:", decodedResult.masks);
      } catch (error) {
        console.error("Failed to decode masks on retry:", error);
        setSegmentationError("Failed to decode segmentation masks");
      }
    }
  }, [projectData, undecodedMasks, decodedMasks]);

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
          // Don't set loading to done here - let final loading state management handle it
        });
    } else if (!maskFetchDone) {
      // wait for mask fetch to complete before deciding about jobs
      return;
    } else {
      // If we have masks or there's an error, no need to fetch jobs - final loading state will handle completion
    }
  }, [maskFetchDone, hasMasks, projectData, segmentationError, projectId, jobsError]);

  // 4. Initialize tar cache when project data is available and mask fetch is done - NEW
  useEffect(() => {
    if (!projectData || !projectId || !maskFetchDone) {
      setTarCacheReady(false);
      setTarCacheError(null);
      return;
    }

    // Set loading to tar-cache stage when we start tar cache initialization
    setLoading("tar-cache");

    const initializeTarCache = async () => {
      try {
        console.log(`[ProjectContext] Initializing tar cache for project ${projectId}`);

        // Initialize tar cache system
        await tarImageCache.init();

        // Check if images are already cached
        const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
        if (frames.length > 0 && slices.length > 0) {
          console.log(`[ProjectContext] Found ${frames.length} frames and ${slices.length} slices in tar cache`);
          setTarCacheReady(true);
          setTarCacheError(null);
        } else {
          console.log("[ProjectContext] No cached images found, will attempt to extract from tar");
          // Attempt to fetch and extract images in background
          const result = await tarImageCache.fetchAndExtractProjectImages(projectId, projectApi.getProjectPresignedUrl);
          if (result.success) {
            console.log(`[ProjectContext] Successfully extracted ${result.extractedImages} images to cache`);
            setTarCacheReady(true);
            setTarCacheError(null);
          } else {
            console.warn("[ProjectContext] Failed to extract images");
            setTarCacheError(`Image extraction failed: ${result.errors.join(", ")}`);
            setTarCacheReady(false);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown tar cache error";
        console.error("[ProjectContext] Tar cache initialization error:", error);
        setTarCacheError(errorMessage);
        setTarCacheReady(false);
      }
    };

    initializeTarCache();

    // Cleanup function - clear project-specific cache when component unmounts or project changes
    return () => {
      console.log(`[ProjectContext] Cleaning up tar cache for project ${projectId}`);
      tarImageCache.clearProjectCache(projectId).catch((error) => console.warn(`[ProjectContext] Cleanup error for project ${projectId}:`, error));
    };
  }, [projectData, projectId, maskFetchDone]);

  // 5. Final loading state management - set to done when all components are ready or there's an error
  useEffect(() => {
    // Set to done when:
    // 1. There's an error (project not found, etc.)
    // 2. OR we have project data, masks are fetched, and tar cache is ready (or has error)
    if (error || (projectData && maskFetchDone && (tarCacheReady || tarCacheError) && loading !== "done")) {
      setLoading("done");
    }
  }, [error, projectData, maskFetchDone, tarCacheReady, tarCacheError, loading]);

  const contextValue: ProjectContextType = {
    loading,
    projectData,
    hasMasks,
    undecodedMasks,
    decodedMasks,
    jobs,
    error,
    segmentationError,
    jobsError,
    maskFetchDone,
    // NEW: Tar cache properties and methods
    tarCacheReady,
    tarCacheError,
    getMRIImage,
    preloadMRIImages,
    getAvailableFramesAndSlices,
    fetchAndExtractProjectImages,
    clearProjectCache,
  };

  return <ProjectContext.Provider value={contextValue}>{children}</ProjectContext.Provider>;
}
