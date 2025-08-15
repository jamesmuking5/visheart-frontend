"use client";

// Core React and Next.js imports
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

// API layer: Project data and segmentation job management
import { projectApi, segmentationApi } from "@/lib/api";

// UI components
import { Button } from "@/components/ui/button";
import { Loader2, Heart, ArrowLeft } from "lucide-react";

// Data processing: RLE mask decoding and TAR image caching
import { decodeSegmentationMasks, DecodedMasks } from "@/lib/decode-RLE";
import { tarImageCache, TarFetchDebugInfo } from "@/lib/tar-image-cache";

// Canvas rendering for medical image visualization
// Removed Konva - using plain Canvas API for better performance with Uint8 masks

// Type definitions
import { ProjectInfo, UserJob, UserJobsResponse, JobStatus, MedSAMask, EditableMask, SegmentationMask } from "@/types/project";

// Color mapping for cardiac anatomy visualization
const CLASS_COLORS = {
  lvc: { r: 255, g: 0, b: 0, a: 180 }, // Red - Left Ventricle Cavity
  rv: { r: 0, g: 255, b: 0, a: 180 }, // Green - Right Ventricle
  myo: { r: 0, g: 0, b: 255, a: 180 }, // Blue - Myocardium
} as const;

/**
 * Main Project Page Component
 *
 * DATA FLOW:
 * 1. Load project info → Check for existing masks
 * 2. If masks exist: Decode RLE → Load TAR images → Render canvas
 * 3. If no masks: Check job status → Show start button or job progress
 * 4. Canvas renders: Background image + segmentation overlays
 */
export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // Core project state
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mask data pipeline: API → RLE encoded → Decoded for rendering
  const [maskFound, setMaskFound] = useState<boolean>(false);
  const [medSamMask, setMedSamMask] = useState<MedSAMask[]>([]); // Raw AI masks
  const [editableMask, setEditableMask] = useState<EditableMask[]>([]); // User-edited masks
  const [decodedMasks, setDecodedMasks] = useState<DecodedMasks>({
    aiMasks: {},
    manualMasks: {},
  });

  // Job tracking for segmentation processing queue
  const [activeJobCount, setActiveJobCount] = useState<number>(0);
  const [projectActiveJobs, setProjectActiveJobs] = useState<UserJob[]>([]);
  const [segmentationError, setSegmentationError] = useState<string | null>(null);
  const [isStartingSegmentation, setIsStartingSegmentation] = useState<boolean>(false);

  // Image cache: TAR file → Individual images → Canvas rendering
  const [tarDebugInfo, setTarDebugInfo] = useState<TarFetchDebugInfo | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [imageLoadingProgress, setImageLoadingProgress] = useState<number>(0);

  // Image loading pipeline: TAR download → Extract → Cache → Render
  const loadProjectImages = async (projectId: string) => {
    try {
      setIsLoadingImages(true);
      setImageLoadingProgress(0);

      await tarImageCache.init();

      // Download and extract TAR archive containing medical images
      const result = await tarImageCache.fetchAndExtractProjectImages(projectId, projectApi.getProjectPresignedUrl);

      setTarDebugInfo(tarImageCache.getDebugInfo());

      if (result.success) {
        console.log(`[ProjectPage] Loaded ${result.extractedImages} images`);

        // Preload first image for immediate display
        const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
        if (frames.length > 0 && slices.length > 0) {
          const imageUrl = await tarImageCache.getImageURL(projectId, frames[0], slices[0]);
          if (imageUrl) {
            setImageUrls((prev) => new Map(prev.set(`${frames[0]}_${slices[0]}`, imageUrl)));
          }
        }
      } else {
        console.error(`[ProjectPage] Failed to load images:`, result.errors);
      }

      setImageLoadingProgress(100);
    } catch (error) {
      console.error(`[ProjectPage] Error loading project images:`, error);
      setTarDebugInfo({
        presignedUrlFetched: false,
        presignedUrl: null,
        presignedUrlExpiry: null,
        tarFileFetched: false,
        tarFileSize: 0,
        extractionStarted: false,
        extractionCompleted: false,
        totalImagesFound: 0,
        imagesStored: 0,
        cacheErrors: [error instanceof Error ? error.message : "Unknown error"],
        processingTime: 0,
      });
    } finally {
      setIsLoadingImages(false);
    }
  };

  /**
   * Main data loading effect - orchestrates the entire data pipeline
   *
   * FLOW: Project Info → Masks → Jobs → Images
   * 1. Fetch project metadata
   * 2. Check for existing segmentation masks
   * 3. If masks found: Decode RLE → Load images
   * 4. If no masks: Check job status → Show appropriate UI
   */
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null); // project
        setSegmentationError(null); //.mask

        // Step 1: Get project information (required for everything else)
        const response = await projectApi.getProjectInfo(projectId);
        if (!response.success || !response.project) {
          setError(response.message || "Project not found");
          return;
        }
        setProject(response.project);

        // Step 2: Check for existing masks (determines UI flow)
        const masksResponse = await segmentationApi.getSegmentationResults(projectId);

        if (masksResponse.success && masksResponse.segmentations?.length > 0) {
          // MASKS FOUND → Decode and visualize
          setMaskFound(true);

          const aiMasks = masksResponse.segmentations.filter((mask: SegmentationMask): mask is MedSAMask => mask.isMedSAMOutput === true);
          const manualMasks = masksResponse.segmentations.filter((mask: SegmentationMask): mask is EditableMask => mask.isMedSAMOutput === false);

          setMedSamMask(aiMasks);
          setEditableMask(manualMasks);

          // Step 3: Decode RLE masks for canvas rendering
          if (response.project.dimensions) {
            const decoded = decodeSegmentationMasks(aiMasks, manualMasks, {
              height: response.project.dimensions.height,
              width: response.project.dimensions.width,
            });
            setDecodedMasks(decoded); // has both decoded AI and manual masks
          } else {
            throw new Error("Project dimensions not available for mask decoding");
          }

          // Step 4: Load background images for visualization
          loadProjectImages(projectId);

          // Basically don't care about jobs here since we have masks
          setActiveJobCount(0);
          setProjectActiveJobs([]);
        } else {
          // NO MASKS → Check job status
          setMaskFound(false);
          setMedSamMask([]);
          setEditableMask([]);

          // Trace from jobs
          try {
            const jobsResponse: UserJobsResponse = await segmentationApi.getUserJobs();
            if (jobsResponse.success) {
              setActiveJobCount(jobsResponse.activeJobCount);

              const projectJobs = jobsResponse.jobs.filter((job) => job.projectId === projectId);
              setProjectActiveJobs(projectJobs);

              // Data validation: completed jobs should have masks
              const completedJobs = projectJobs.filter((job) => job.status === JobStatus.COMPLETED);
              const failedJobs = projectJobs.filter((job) => job.status === JobStatus.FAILED);

              if (completedJobs.length > 0) {
                throw new Error(`Processing error: Found ${completedJobs.length} completed job(s) but no masks. Server-side issue.`);
              }

              if (failedJobs.length > 0) {
                setSegmentationError(`Segmentation failed. Found ${failedJobs.length} failed job(s).`);
              }

              const activeJobs = projectJobs.filter((job) => job.status === JobStatus.PENDING || job.status === JobStatus.IN_PROGRESS);
              console.log(`Found ${activeJobs.length} active jobs for project ${projectId}:`, activeJobs);
            }
          } catch (jobError) {
            if (jobError instanceof Error && jobError.message.includes("Processing error")) {
              throw jobError;
            }
            // Don't fail entire fetch for job API issues
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching project data:", err);
        let errorMessage = "Failed to load project";

        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "object" && err !== null && "response" in err) {
          const axiosError = err as {
            response?: { data?: { message?: string } };
          };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  /**
   * Canvas Component - Renders medical images with segmentation overlays
   *
   * RENDERING FLOW:
   * 1. Extract frame/slice navigation from mask data
   * 2. Load background image for current frame/slice
   * 3. Filter masks matching current view
   * 4. Render: Background image → Colored mask overlays
   */
  const MaskTestCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Navigation state for 4D medical data (frame, slice, height, width)
    const [currentFrame, setCurrentFrame] = useState<number>(0);
    const [currentSlice, setCurrentSlice] = useState<number>(0);
    const [availableFrames, setAvailableFrames] = useState<number[]>([]);
    const [availableSlices, setAvailableSlices] = useState<number[]>([]);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

    // Load specific image from cache for current frame/slice
    const loadCurrentImage = async (frame: number, slice: number) => {
      try {
        const imageUrl = await tarImageCache.getImageURL(projectId, frame, slice);

        if (imageUrl) {
          setImageUrls((prev) => new Map(prev.set(`${frame}_${slice}`, imageUrl)));

          // Preload the image for immediate rendering
          const img = new Image();
          img.onload = () => {
            setBackgroundImage(img);
          };
          img.onerror = () => {
            console.error(`[MaskTestCanvas] Failed to load image: ${imageUrl}`);
            setBackgroundImage(null);
          };
          img.src = imageUrl;
        }
      } catch (error) {
        console.error(`[MaskTestCanvas] Failed to load image for frame ${frame}, slice ${slice}:`, error);
        setBackgroundImage(null);
      }
    };

    // Extract navigation dimensions from mask keys
    // Pattern: "ai_mask_0_frame_X_slice_Y_class" → Extract X, Y for navigation
    const aiMasksLength = Object.keys(decodedMasks.aiMasks).length;
    useEffect(() => {
      if (aiMasksLength === 0) return;

      const frames = new Set<number>();
      const slices = new Set<number>();

      Object.keys(decodedMasks.aiMasks).forEach((maskKey) => {
        const match = maskKey.match(/frame_(\d+)_slice_(\d+)/);
        if (match) {
          frames.add(parseInt(match[1], 10));
          slices.add(parseInt(match[2], 10));
        }
      });

      const sortedFrames = Array.from(frames).sort((a, b) => a - b);
      const sortedSlices = Array.from(slices).sort((a, b) => a - b);

      setAvailableFrames(sortedFrames);
      setAvailableSlices(sortedSlices);

      // Reset invalid selections to first available
      if (!sortedFrames.includes(currentFrame) && sortedFrames.length > 0) {
        setCurrentFrame(sortedFrames[0]);
      }
      if (!sortedSlices.includes(currentSlice) && sortedSlices.length > 0) {
        setCurrentSlice(sortedSlices[0]);
      }
    }, [aiMasksLength, currentFrame, currentSlice]);

    // Reactive image loading when navigation changes
    useEffect(() => {
      if (availableFrames.length > 0 && availableSlices.length > 0) {
        loadCurrentImage(currentFrame, currentSlice);
      }
    }, [currentFrame, currentSlice, availableFrames, availableSlices]);

    // Filter masks for current view (only matching frame/slice)
    const currentMasks = Object.entries(decodedMasks.aiMasks).filter(([maskKey]) => {
      const match = maskKey.match(/frame_(\d+)_slice_(\d+)/);
      if (!match) return false;
      const frameNum = parseInt(match[1], 10);
      const sliceNum = parseInt(match[2], 10);
      return frameNum === currentFrame && sliceNum === currentSlice;
    });

    // Trigger re-render when data changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !project?.dimensions) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = project.dimensions;

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height); // Inverted due to our coordinate system
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      // Draw background image if available
      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, width, height);
      }

      // Draw masks as overlays
      if (currentMasks.length > 0) {
        // Create ImageData for efficient pixel manipulation
        // Note: Using height, width to match the mask data encoding
        const imageData = ctx.createImageData(height, width);

        // If there's a background image, get its pixel data first
        if (backgroundImage) {
          // Create temporary canvas to get background pixels
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.drawImage(backgroundImage, 0, 0, width, height);
            const bgImageData = tempCtx.getImageData(0, 0, width, height);
            imageData.data.set(bgImageData.data);
          }
        }

        // Paint each mask with its anatomical class color
        currentMasks.forEach(([maskKey, maskData]) => {
          const classMatch = maskKey.match(/_([^_]+)$/);
          const className = classMatch ? classMatch[1] : null;

          if (!className || !CLASS_COLORS[className as keyof typeof CLASS_COLORS]) {
            return;
          }

          const color = CLASS_COLORS[className as keyof typeof CLASS_COLORS];

          // Efficient pixel painting with alpha blending
          for (let i = 0; i < maskData.length; i++) {
            if (maskData[i] > 0) {
              const pixelIndex = i * 4;
              const existingAlpha = imageData.data[pixelIndex + 3];

              if (existingAlpha === 0) {
                // Direct paint for transparent pixels
                imageData.data[pixelIndex] = color.r;
                imageData.data[pixelIndex + 1] = color.g;
                imageData.data[pixelIndex + 2] = color.b;
                imageData.data[pixelIndex + 3] = color.a;
              } else {
                // Alpha blend for overlapping masks
                const alpha = color.a / 255;
                const invAlpha = 1 - alpha;

                imageData.data[pixelIndex] = Math.min(255, imageData.data[pixelIndex] * invAlpha + color.r * alpha);
                imageData.data[pixelIndex + 1] = Math.min(255, imageData.data[pixelIndex + 1] * invAlpha + color.g * alpha);
                imageData.data[pixelIndex + 2] = Math.min(255, imageData.data[pixelIndex + 2] * invAlpha + color.b * alpha);
                imageData.data[pixelIndex + 3] = Math.min(255, existingAlpha + color.a);
              }
            }
          }
        });

        // Render the final composited image
        ctx.putImageData(imageData, 0, 0);
      }
    }, [backgroundImage, currentMasks]);

    // Guard: Don't render without essential data
    if (!project?.dimensions || Object.keys(decodedMasks.aiMasks).length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        <h3 className="text-foreground font-semibold">MedSAM AI Segmentation Viewer</h3>

        {/* Frame and Slice Controls */}
        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-2 dark:bg-gray-800">
          {/* Frame Slider */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium">
              Frame: {currentFrame + 1} (of {availableFrames.length})
            </label>
            <input
              type="range"
              min={Math.min(...availableFrames)}
              max={Math.max(...availableFrames)}
              value={currentFrame}
              onChange={(e) => setCurrentFrame(parseInt(e.target.value, 10))}
              disabled={availableFrames.length <= 1}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />

            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{Math.min(...availableFrames) + 1}</span>
              <span>{Math.max(...availableFrames) + 1}</span>
            </div>
          </div>

          {/* Slice Slider */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium">
              Slice: {currentSlice + 1} (of {availableSlices.length})
            </label>
            <input
              type="range"
              min={Math.min(...availableSlices)}
              max={Math.max(...availableSlices)}
              value={currentSlice}
              onChange={(e) => setCurrentSlice(parseInt(e.target.value, 10))}
              disabled={availableSlices.length <= 1}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{Math.min(...availableSlices) + 1}</span>
              <span>{Math.max(...availableSlices) + 1}</span>
            </div>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 dark:border-gray-600"
            style={{
              maxWidth: "100%",
              height: "auto",
              background: "black",
              imageRendering: "pixelated", // Crisp rendering for medical images
            }}
          />
          <div className="text-muted-foreground mt-2 space-y-1 text-sm">
            <p>
              Showing AI masks for Frame {currentFrame + 1}, Slice {currentSlice + 1}
            </p>
            <p>
              Available: {availableFrames.length} frames, {availableSlices.length} slices
            </p>
            <p>
              Canvas size: {project.dimensions!.width} × {project.dimensions!.height}
            </p>
            <p>Current masks: {currentMasks.length} for this frame/slice</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-red-500"></div>
                <span>LVC (Left Ventricle Cavity)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-green-500"></div>
                <span>RV (Right Ventricle)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-blue-500"></div>
                <span>MYO (Myocardium)</span>
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Colors assigned based on class labels: lvc, rv, myo</p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Segmentation Button Component
   *
   * UI FLOW: Check state → Show appropriate UI
   * - Masks exist: Show completion message
   * - Jobs active: Show progress status
   * - Neither: Show start button
   */
  const RequestSegmentationButton = () => {
    const getJobsByStatus = (status: JobStatus) => projectActiveJobs.filter((job) => job.status === status);
    const hasAnyJobs = projectActiveJobs.length > 0;
    const shouldShowButton = !maskFound && !hasAnyJobs;

    if (!shouldShowButton) {
      if (maskFound) {
        return (
          <div className="space-y-2">
            <p className="text-green-600 dark:text-green-400">Segmentation masks already exist for this project.</p>
            <p className="text-muted-foreground text-sm">AI segmentation completed. Use the viewer above to explore results.</p>
          </div>
        );
      }

      if (hasAnyJobs) {
        const pendingJobs = getJobsByStatus(JobStatus.PENDING);
        const inProgressJobs = getJobsByStatus(JobStatus.IN_PROGRESS);
        const completedJobs = getJobsByStatus(JobStatus.COMPLETED);
        const failedJobs = getJobsByStatus(JobStatus.FAILED);

        return (
          <div className="space-y-2">
            {(pendingJobs.length > 0 || inProgressJobs.length > 0) && <p className="text-blue-600 dark:text-blue-400">Segmentation in progress...</p>}
            {completedJobs.length > 0 && <p className="text-green-600 dark:text-green-400">Segmentation completed</p>}
            {failedJobs.length > 0 && <p className="text-red-600 dark:text-red-400">Segmentation failed</p>}

            {pendingJobs.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {pendingJobs.length} job(s) pending (Queue: {pendingJobs[0].queuePosition})
              </p>
            )}
            {inProgressJobs.length > 0 && <p className="text-muted-foreground text-sm">{inProgressJobs.length} job(s) processing</p>}
            {completedJobs.length > 0 && <p className="text-muted-foreground text-sm">{completedJobs.length} job(s) completed</p>}
            {failedJobs.length > 0 && <p className="text-muted-foreground text-sm">{failedJobs.length} job(s) failed</p>}

            <p className="text-muted-foreground text-sm">Segmentation already initiated. Button disabled.</p>
          </div>
        );
      }
    }

    // Start segmentation job → Refresh page to show new state
    const handleStartSegmentation = async () => {
      if (isStartingSegmentation) return;

      try {
        setIsStartingSegmentation(true);
        const response = await segmentationApi.startSegmentation(projectId);
        if (response) {
          window.location.reload(); // Refresh to show job status
        }
      } catch (error) {
        console.error("Error starting segmentation:", error);
        setSegmentationError("Failed to start segmentation. Please try again.");
        setIsStartingSegmentation(false);
      }
    };

    if (shouldShowButton) {
      return (
        <div className="space-y-4">
          <p className="text-foreground">No segmentation masks found. Start AI segmentation to generate masks.</p>
          {segmentationError && <div className="rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">{segmentationError}</div>}
          <Button onClick={handleStartSegmentation} variant="secondary" disabled={isStartingSegmentation}>
            {isStartingSegmentation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Segmentation...
              </>
            ) : (
              "Start AI Segmentation"
            )}
          </Button>
        </div>
      );
    }

    return null;
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-bold">Project Not Found</h1>
            <p className="text-muted-foreground">{error || "The requested project could not be found."}</p>
          </div>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  /**
   * Main Render - Project page with interactive components
   *
   * LAYOUT FLOW:
   * 1. Collapsible project info (debugging)
   * 2. Debug state panel (development)
   * 3. Action button (start segmentation or show status)
   * 4. Interactive canvas (mask visualization)
   * 5. Data inspection panels (debugging)
   */
  return (
    <>
      <div className="space-y-4 p-4">
        {/* Project metadata */}
        <details className="rounded-md border">
          <summary className="text-foreground cursor-pointer bg-gray-50 p-3 font-semibold dark:bg-gray-800">Project Info (Click to expand)</summary>
          <pre className="overflow-auto p-4 text-sm whitespace-pre-wrap">{JSON.stringify(project, null, 2)}</pre>
        </details>

        {/* Development debug panel */}
        <div className="rounded-md border bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <h3 className="text-foreground mb-2 font-semibold">Debug Info</h3>
          <div className="space-y-1 text-sm">
            <p className="text-foreground">Mask Found: {maskFound.toString()}</p>
            <p className="text-foreground">AI Masks: {medSamMask.length}</p>
            <p className="text-foreground">Manual Masks: {editableMask.length}</p>
            <p className="text-foreground">Active Jobs: {activeJobCount}</p>
            <p className="text-foreground">Project Jobs: {projectActiveJobs.length}</p>
            <p className="text-foreground">Project ID: {projectId}</p>
            <p className="text-foreground">Has Active Jobs: {projectActiveJobs.some((job) => job.status === JobStatus.PENDING || job.status === JobStatus.IN_PROGRESS).toString()}</p>
            <p className="text-foreground">Show Button: {(!maskFound && projectActiveJobs.length === 0).toString()}</p>
            <p className="text-foreground">Starting Segmentation: {isStartingSegmentation.toString()}</p>
            <p className="text-foreground">Decoded AI Masks: {Object.keys(decodedMasks.aiMasks).length}</p>
            <p className="text-foreground">Decoded Manual Masks: {Object.keys(decodedMasks.manualMasks).length}</p>
            {segmentationError && <p className="text-red-600">Segmentation Error: {segmentationError}</p>}

            {/* Image cache status */}
            <div className="mt-3 border-t pt-2">
              <h4 className="text-foreground mb-1 text-sm font-semibold">Image Cache Status:</h4>
              <p className="text-foreground text-xs">Loading: {isLoadingImages.toString()}</p>
              <p className="text-foreground text-xs">Progress: {imageLoadingProgress}%</p>
              <p className="text-foreground text-xs">Cached URLs: {imageUrls.size}</p>
              {tarDebugInfo && (
                <>
                  <p className="text-foreground text-xs">URL Fetched: {tarDebugInfo.presignedUrlFetched.toString()}</p>
                  <p className="text-foreground text-xs">TAR Fetched: {tarDebugInfo.tarFileFetched.toString()}</p>
                  <p className="text-foreground text-xs">Size: {(tarDebugInfo.tarFileSize / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="text-foreground text-xs">Extracted: {tarDebugInfo.extractionCompleted.toString()}</p>
                  <p className="text-foreground text-xs">
                    Images: {tarDebugInfo.totalImagesFound}/{tarDebugInfo.imagesStored}
                  </p>
                  <p className="text-foreground text-xs">Time: {tarDebugInfo.processingTime.toFixed(0)}ms</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main user actions */}
        <RequestSegmentationButton />

        {/* Interactive visualization */}
        <MaskTestCanvas />

        {/* Data inspection panels for debugging */}

        {/* Active job monitoring */}
        {projectActiveJobs.length > 0 && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-purple-50 p-3 font-semibold dark:bg-purple-900/20">Project Jobs ({projectActiveJobs.length})</summary>
            <div className="space-y-2 p-4">
              {projectActiveJobs.map((job) => (
                <div key={job.jobId} className="rounded border p-2">
                  <p className="text-foreground">
                    <strong>ID:</strong> {job.jobId}
                  </p>
                  <p className="text-foreground">
                    <strong>Status:</strong> {job.status}
                  </p>
                  {job.queuePosition && (
                    <p className="text-foreground">
                      <strong>Queue:</strong> {job.queuePosition}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Raw AI mask data */}
        {medSamMask.length > 0 && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-blue-50 p-3 font-semibold dark:bg-blue-900/20">AI Masks ({medSamMask.length})</summary>
            <pre className="max-h-96 overflow-auto p-4 text-sm whitespace-pre-wrap">{JSON.stringify(medSamMask, null, 2)}</pre>
          </details>
        )}

        {/* Manual mask data */}
        {editableMask.length > 0 && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-green-50 p-3 font-semibold dark:bg-green-900/20">Editable Masks ({editableMask.length})</summary>
            <pre className="max-h-96 overflow-auto p-4 text-sm whitespace-pre-wrap">{JSON.stringify(editableMask, null, 2)}</pre>
          </details>
        )}

        {/* Processed mask statistics */}
        {(Object.keys(decodedMasks.aiMasks).length > 0 || Object.keys(decodedMasks.manualMasks).length > 0) && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-orange-50 p-3 font-semibold dark:bg-orange-900/20">
              Decoded Masks (AI: {Object.keys(decodedMasks.aiMasks).length}, Manual: {Object.keys(decodedMasks.manualMasks).length})
            </summary>
            <div className="space-y-4 p-4">
              {Object.keys(decodedMasks.aiMasks).length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">AI Masks:</h4>
                  <div className="space-y-1">
                    {Object.entries(decodedMasks.aiMasks).map(([key, mask]) => (
                      <div key={key} className="text-muted-foreground text-sm">
                        <span className="font-mono text-xs">{key}</span>:<span className="ml-2">Size: {mask.length}</span>
                        <span className="ml-2">Active: {mask.filter((v) => v > 0).length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(decodedMasks.manualMasks).length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-green-600 dark:text-green-400">Manual Masks:</h4>
                  <div className="space-y-1">
                    {Object.entries(decodedMasks.manualMasks).map(([key, mask]) => (
                      <div key={key} className="text-muted-foreground text-sm">
                        <span className="font-mono text-xs">{key}</span>:<span className="ml-2">Size: {mask.length}</span>
                        <span className="ml-2">Active: {mask.filter((v) => v > 0).length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </>
  );
}
