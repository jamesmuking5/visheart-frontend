"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { projectApi, segmentationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, ArrowLeft } from "lucide-react";
import { decodeSegmentationMasks, DecodedMasks } from "@/lib/decode-RLE";
import { Stage, Layer, Shape } from "react-konva";
import Konva from "konva";
import { tarImageCache, TarFetchDebugInfo } from "@/lib/tar-image-cache";

// Types
import {
  ProjectInfo,
  UserJob,
  UserJobsResponse,
  JobStatus,
  MedSAMask,
  EditableMask,
  SegmentationMask,
} from "@/types/project";

// Constants for mask visualization
const CLASS_COLORS = {
  lvc: { r: 255, g: 0, b: 0, a: 180 }, // Red - Left Ventricle Cavity
  rv: { r: 0, g: 255, b: 0, a: 180 }, // Green - Right Ventricle
  myo: { r: 0, g: 0, b: 255, a: 180 }, // Blue - Myocardium
} as const;

// Main component for the project page
export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // State management
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [maskFound, setMaskFound] = useState<boolean>(false);
  // Stores encoded masks from API
  const [medSamMask, setMedSamMask] = useState<MedSAMask[]>([]);
  const [editableMask, setEditableMask] = useState<EditableMask[]>([]);
  // Stores the decoded masks for rendering
  const [decodedMasks, setDecodedMasks] = useState<DecodedMasks>({
    aiMasks: {},
    manualMasks: {},
  });
  const [activeJobCount, setActiveJobCount] = useState<number>(0);
  const [projectActiveJobs, setProjectActiveJobs] = useState<UserJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [segmentationError, setSegmentationError] = useState<string | null>(
    null,
  );
  const [isStartingSegmentation, setIsStartingSegmentation] =
    useState<boolean>(false);

  // Tar image cache state
  const [tarDebugInfo, setTarDebugInfo] = useState<TarFetchDebugInfo | null>(
    null,
  );
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [imageLoadingProgress, setImageLoadingProgress] = useState<number>(0);

  // Function to load project images from tar file
  const loadProjectImages = async (projectId: string) => {
    try {
      setIsLoadingImages(true);
      setImageLoadingProgress(0);

      // Initialize tar cache
      await tarImageCache.init();

      // Fetch and extract images
      const result = await tarImageCache.fetchAndExtractProjectImages(
        projectId,
        projectApi.getProjectPresignedUrl,
      );

      // Update debug info
      setTarDebugInfo(tarImageCache.getDebugInfo());

      if (result.success) {
        console.log(
          `[ProjectPage] Successfully loaded ${result.extractedImages} images`,
        );

        // Get available frames and slices for preloading current view
        const { frames, slices } =
          await tarImageCache.getAvailableFramesAndSlices(projectId);
        if (frames.length > 0 && slices.length > 0) {
          // Preload first frame/slice image
          const imageUrl = await tarImageCache.getImageURL(
            projectId,
            frames[0],
            slices[0],
          );
          if (imageUrl) {
            setImageUrls(
              (prev) =>
                new Map(prev.set(`${frames[0]}_${slices[0]}`, imageUrl)),
            );
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

  useEffect(() => {
    if (!projectId) return;

    // Fetch project information, masks, and jobs
    const fetchProjectData = async () => {
      try {
        // 0. Reset states
        setLoading(true);
        setError(null);
        setSegmentationError(null);

        // 1. Fetch project information
        const response = await projectApi.getProjectInfo(projectId);
        if (!response.success || !response.project) {
          setError(response.message || "Project not found");
          return;
        }
        setProject(response.project);

        // 2. Fetch segmentation masks first
        const masksResponse =
          await segmentationApi.getSegmentationResults(projectId);

        if (
          masksResponse.success &&
          masksResponse.segmentations &&
          masksResponse.segmentations.length > 0
        ) {
          // If masks found - separate them
          setMaskFound(true);

          const aiMasks = masksResponse.segmentations.filter(
            (mask: SegmentationMask): mask is MedSAMask =>
              mask.isMedSAMOutput === true,
          );
          const manualMasks = masksResponse.segmentations.filter(
            (mask: SegmentationMask): mask is EditableMask =>
              mask.isMedSAMOutput === false,
          );

          // Set the RLE masks in state
          setMedSamMask(aiMasks);
          setEditableMask(manualMasks);

          // 3. Start decoding RLE masks if project dimensions are available
          if (response.project.dimensions) {
            const decoded = decodeSegmentationMasks(aiMasks, manualMasks, {
              height: response.project.dimensions.height,
              width: response.project.dimensions.width,
            });
            setDecodedMasks(decoded);
          } else {
            throw new Error(
              "Project dimensions not available for mask decoding",
            );
          }

          // 4. Start loading tar images in background
          loadProjectImages(projectId);

          // console.log(
          //   `Found ${aiMasks.length} AI masks and ${manualMasks.length} manual masks`,
          // );

          // Clear job states since we have masks
          setActiveJobCount(0);
          setProjectActiveJobs([]);
        } else {
          // No masks found - check job status
          setMaskFound(false);
          setMedSamMask([]);
          setEditableMask([]);

          // 3. Fetch user jobs only if no masks exist
          try {
            const jobsResponse: UserJobsResponse =
              await segmentationApi.getUserJobs();
            if (jobsResponse.success) {
              setActiveJobCount(jobsResponse.activeJobCount);

              // Filter jobs with this projectId
              const projectJobs = jobsResponse.jobs.filter((job) => {
                return job.projectId === projectId;
              });
              setProjectActiveJobs(projectJobs);

              // Check for completed jobs - if they exist but no masks, throw error
              const completedJobs = projectJobs.filter(
                (job) => job.status === JobStatus.COMPLETED,
              );
              const failedJobs = projectJobs.filter(
                (job) => job.status === JobStatus.FAILED,
              );

              if (completedJobs.length > 0) {
                throw new Error(
                  `Processing error: Found ${completedJobs.length} completed job(s) but no segmentation masks. This indicates a server-side processing issue.`,
                );
              }

              if (failedJobs.length > 0) {
                setSegmentationError(
                  `Segmentation failed. Found ${failedJobs.length} failed job(s).`,
                );
              }

              // Check for active jobs specifically
              const activeJobs = projectJobs.filter(
                (job) =>
                  job.status === JobStatus.PENDING ||
                  job.status === JobStatus.IN_PROGRESS,
              );
              console.log(
                `Found ${activeJobs.length} active jobs for project ${projectId}:`,
                activeJobs,
              );
            }
          } catch (jobError) {
            if (
              jobError instanceof Error &&
              jobError.message.includes("Processing error")
            ) {
              // Re-throw processing errors
              throw jobError;
            }
            // console.warn("Failed to fetch user jobs:", jobError);
            // Don't fail the entire fetch if jobs fail for other reasons
          }

          // console.warn("No segmentation masks found for this project.");
        }
      } catch (err: unknown) {
        console.error("Error fetching project data:", err);
        let errorMessage = "Failed to load project";

        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (
          typeof err === "object" &&
          err !== null &&
          "response" in err
        ) {
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

  // Canvas component for displaying decoded masks using Konva
  const MaskTestCanvas = () => {
    const stageRef = useRef<Konva.Stage>(null);
    const [currentFrame, setCurrentFrame] = useState<number>(0);
    const [currentSlice, setCurrentSlice] = useState<number>(0);
    const [availableFrames, setAvailableFrames] = useState<number[]>([]);
    const [availableSlices, setAvailableSlices] = useState<number[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    // Load image for current frame/slice
    const loadCurrentImage = async (frame: number, slice: number) => {
      try {
        const imageUrl = await tarImageCache.getImageURL(
          projectId,
          frame,
          slice,
        );
        setCurrentImageUrl(imageUrl);

        // Cache the URL for future use
        if (imageUrl) {
          setImageUrls(
            (prev) => new Map(prev.set(`${frame}_${slice}`, imageUrl)),
          );
        }
      } catch (error) {
        console.error(
          `[MaskTestCanvas] Failed to load image for frame ${frame}, slice ${slice}:`,
          error,
        );
        setCurrentImageUrl(null);
      }
    };

    // Extract available frames and slices from mask keys
    const aiMasksLength = Object.keys(decodedMasks.aiMasks).length;
    useEffect(() => {
      if (aiMasksLength === 0) return;

      const frames = new Set<number>();
      const slices = new Set<number>();

      Object.keys(decodedMasks.aiMasks).forEach((maskKey) => {
        // Parse mask key: ai_mask_0_frame_0_slice_0_class
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

      // Reset to first available frame/slice if current selection is invalid
      if (!sortedFrames.includes(currentFrame) && sortedFrames.length > 0) {
        setCurrentFrame(sortedFrames[0]);
      }
      if (!sortedSlices.includes(currentSlice) && sortedSlices.length > 0) {
        setCurrentSlice(sortedSlices[0]);
      }
    }, [aiMasksLength, currentFrame, currentSlice]);

    // Load image when frame/slice changes
    useEffect(() => {
      if (availableFrames.length > 0 && availableSlices.length > 0) {
        loadCurrentImage(currentFrame, currentSlice);
      }
    }, [currentFrame, currentSlice, availableFrames, availableSlices]);

    // Don't render if no masks available or missing dimensions
    if (
      !project?.dimensions ||
      Object.keys(decodedMasks.aiMasks).length === 0
    ) {
      return null;
    }

    const { width, height } = project.dimensions;

    // Filter masks for current frame and slice
    const currentMasks = Object.entries(decodedMasks.aiMasks).filter(
      ([maskKey]) => {
        const match = maskKey.match(/frame_(\d+)_slice_(\d+)/);
        if (!match) return false;
        const frameNum = parseInt(match[1], 10);
        const sliceNum = parseInt(match[2], 10);
        return frameNum === currentFrame && sliceNum === currentSlice;
      },
    );

    // Helper function to draw masks on canvas
    const drawMasksOnCanvas = (ctx: CanvasRenderingContext2D) => {
      // Create a temporary canvas to prepare the mask overlay
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext("2d");

      if (!maskCtx) return;

      // Create composite ImageData for all masks (IMPORTANT: This swaps the width/height when rendering)
      const imageData = maskCtx.createImageData(height, width);

      // Paint all current masks onto the same ImageData
      currentMasks.forEach(([maskKey, maskData]) => {
        // Extract class name from mask key
        const classMatch = maskKey.match(/_([^_]+)$/);
        const className = classMatch ? classMatch[1] : null;

        if (
          !className ||
          !CLASS_COLORS[className as keyof typeof CLASS_COLORS]
        ) {
          return; // Skip masks with unknown classes
        }

        const color = CLASS_COLORS[className as keyof typeof CLASS_COLORS];

        // Paint pixels with class color
        for (let i = 0; i < maskData.length; i++) {
          if (maskData[i] > 0) {
            const pixelIndex = i * 4;

            // Use alpha blending for overlapping masks
            const existingAlpha = imageData.data[pixelIndex + 3];
            if (existingAlpha === 0) {
              // No existing pixel, paint directly
              imageData.data[pixelIndex] = color.r; // R
              imageData.data[pixelIndex + 1] = color.g; // G
              imageData.data[pixelIndex + 2] = color.b; // B
              imageData.data[pixelIndex + 3] = color.a; // A
            } else {
              // Blend with existing pixel (simple additive blending)
              const alpha = color.a / 255;
              const invAlpha = 1 - alpha;

              imageData.data[pixelIndex] = Math.min(
                255,
                imageData.data[pixelIndex] * invAlpha + color.r * alpha,
              );
              imageData.data[pixelIndex + 1] = Math.min(
                255,
                imageData.data[pixelIndex + 1] * invAlpha + color.g * alpha,
              );
              imageData.data[pixelIndex + 2] = Math.min(
                255,
                imageData.data[pixelIndex + 2] * invAlpha + color.b * alpha,
              );
              imageData.data[pixelIndex + 3] = Math.min(
                255,
                existingAlpha + color.a,
              );
            }
          }
        }
      });

      // Put the blended mask data onto the temporary canvas
      maskCtx.putImageData(imageData, 0, 0);

      // Draw the temporary canvas onto the main context
      ctx.drawImage(maskCanvas, 0, 0, width, height);
    };

    // Konva Shape render function for painting masks directly
    const renderMasks = (context: Konva.Context) => {
      const ctx = context._context;

      if (!ctx) return;

      // Draw background image if available
      if (currentImageUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          // Re-draw masks on top of image
          drawMasksOnCanvas(ctx);
        };
        img.src = currentImageUrl;
      } else {
        // No background image, just draw masks
        drawMasksOnCanvas(ctx);
      }
    };

    return (
      <div className="space-y-4">
        <h3 className="text-foreground font-semibold">
          MedSAM AI Segmentation Viewer
        </h3>

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

        {/* Konva Stage */}
        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <Stage
            width={project.dimensions!.width}
            height={project.dimensions!.height}
            ref={stageRef}
            className="border border-gray-300 dark:border-gray-600"
            style={{ maxWidth: "100%", height: "auto", background: "black" }}
          >
            <Layer>
              <Shape
                sceneFunc={renderMasks}
                width={project.dimensions!.width}
                height={project.dimensions!.height}
                key={`${currentFrame}-${currentSlice}`} // Re-render when frame/slice changes
              />
            </Layer>
          </Stage>
          <div className="text-muted-foreground mt-2 space-y-1 text-sm">
            <p>
              Showing AI masks for Frame {currentFrame + 1}, Slice{" "}
              {currentSlice + 1}
            </p>
            <p>
              Available: {availableFrames.length} frames,{" "}
              {availableSlices.length} slices
            </p>
            <p>
              Canvas size: {project.dimensions!.width} ×{" "}
              {project.dimensions!.height}
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
            <p className="text-muted-foreground mt-1 text-xs">
              Colors assigned based on class labels: lvc, rv, myo
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Component for segmentation request button
  const RequestSegmentationButton = () => {
    // Helper functions for job filtering
    const getJobsByStatus = (status: JobStatus) =>
      projectActiveJobs.filter((job) => job.status === status);

    // Check if there are ANY jobs (any status) for this project
    const hasAnyJobs = projectActiveJobs.length > 0;

    // Only show button if BOTH conditions are true:
    // 1. No masks found for this projectId
    // 2. No UserJobs with this projectId
    const shouldShowButton = !maskFound && !hasAnyJobs;

    // If button shouldn't be shown, display job status information instead
    if (!shouldShowButton) {
      // If we have masks, show different message
      if (maskFound) {
        return (
          <div className="space-y-2">
            <p className="text-green-600 dark:text-green-400">
              Segmentation masks already exist for this project.
            </p>
            <p className="text-muted-foreground text-sm">
              AI segmentation has been completed. Use the viewer above to
              explore the results.
            </p>
          </div>
        );
      }

      // If we have jobs, show job status
      if (hasAnyJobs) {
        const pendingJobs = getJobsByStatus(JobStatus.PENDING);
        const inProgressJobs = getJobsByStatus(JobStatus.IN_PROGRESS);
        const completedJobs = getJobsByStatus(JobStatus.COMPLETED);
        const failedJobs = getJobsByStatus(JobStatus.FAILED);

        return (
          <div className="space-y-2">
            {(pendingJobs.length > 0 || inProgressJobs.length > 0) && (
              <p className="text-blue-600 dark:text-blue-400">
                Segmentation in progress...
              </p>
            )}
            {completedJobs.length > 0 && (
              <p className="text-green-600 dark:text-green-400">
                Segmentation completed
              </p>
            )}
            {failedJobs.length > 0 && (
              <p className="text-red-600 dark:text-red-400">
                Segmentation failed
              </p>
            )}

            {pendingJobs.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {pendingJobs.length} job(s) pending (Queue position:{" "}
                {pendingJobs[0].queuePosition})
              </p>
            )}
            {inProgressJobs.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {inProgressJobs.length} job(s) currently processing
              </p>
            )}
            {completedJobs.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {completedJobs.length} job(s) completed
              </p>
            )}
            {failedJobs.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {failedJobs.length} job(s) failed
              </p>
            )}

            <p className="text-muted-foreground text-sm">
              Segmentation already initiated for this project. Button disabled.
            </p>
          </div>
        );
      }
    }

    // Function to handle starting segmentation
    const handleStartSegmentation = async () => {
      if (isStartingSegmentation) return; // Prevent multiple clicks

      try {
        setIsStartingSegmentation(true);
        // console.log("Starting segmentation for project:", projectId);

        const response = await segmentationApi.startSegmentation(projectId);
        if (response) {
          // console.log("Segmentation started successfully:", response);
          // Refresh the page to show the new job status
          window.location.reload();
        }
      } catch (error) {
        console.error("Error starting segmentation:", error);
        setSegmentationError("Failed to start segmentation. Please try again.");
        setIsStartingSegmentation(false); // Re-enable button on error
      }
    };

    // Only render button if both conditions are met: no masks AND no jobs
    if (shouldShowButton) {
      return (
        <div className="space-y-4">
          <p className="text-foreground">
            No segmentation masks found. Start AI segmentation to generate
            masks.
          </p>
          {segmentationError && (
            <div className="rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {segmentationError}
            </div>
          )}
          <Button
            onClick={handleStartSegmentation}
            variant="secondary"
            disabled={isStartingSegmentation}
          >
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

    // If we reach here, button should not be shown (handled by earlier returns)
    return null;
  };

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
            <h1 className="text-foreground text-2xl font-bold">
              Project Not Found
            </h1>
            <p className="text-muted-foreground">
              {error || "The requested project could not be found."}
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-4 p-4">
        <details className="rounded-md border">
          <summary className="text-foreground cursor-pointer bg-gray-50 p-3 font-semibold dark:bg-gray-800">
            Project Info (Click to expand)
          </summary>
          <pre className="overflow-auto p-4 text-sm whitespace-pre-wrap">
            {JSON.stringify(project, null, 2)}
          </pre>
        </details>

        {/* Debug info */}
        <div className="rounded-md border bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <h3 className="text-foreground mb-2 font-semibold">Debug Info</h3>
          <div className="space-y-1 text-sm">
            <p className="text-foreground">
              Mask Found: {maskFound.toString()}
            </p>
            <p className="text-foreground">
              AI Masks Count: {medSamMask.length}
            </p>
            <p className="text-foreground">
              Manual Masks Count: {editableMask.length}
            </p>
            <p className="text-foreground">
              Active Jobs Count: {activeJobCount}
            </p>
            <p className="text-foreground">
              Project Active Jobs: {projectActiveJobs.length}
            </p>
            <p className="text-foreground">Project ID: {projectId}</p>
            <p className="text-foreground">
              Has Active Project Jobs:{" "}
              {projectActiveJobs
                .some(
                  (job) =>
                    job.status === JobStatus.PENDING ||
                    job.status === JobStatus.IN_PROGRESS,
                )
                .toString()}
            </p>
            <p className="text-foreground">
              Has Any Project Jobs: {(projectActiveJobs.length > 0).toString()}
            </p>
            <p className="text-foreground">
              Should Show Button (No Masks + No Jobs):{" "}
              {(!maskFound && projectActiveJobs.length === 0).toString()}
            </p>
            <p className="text-foreground">
              Is Starting Segmentation: {isStartingSegmentation.toString()}
            </p>
            <p className="text-foreground">
              Decoded AI Masks: {Object.keys(decodedMasks.aiMasks).length}
            </p>
            <p className="text-foreground">
              Decoded Manual Masks:{" "}
              {Object.keys(decodedMasks.manualMasks).length}
            </p>
            {segmentationError && (
              <p className="text-red-600">
                Segmentation Error: {segmentationError}
              </p>
            )}

            {/* Tar Image Cache Debug Info */}
            <div className="mt-3 border-t pt-2">
              <h4 className="text-foreground mb-1 text-sm font-semibold">
                Image Cache Debug Info:
              </h4>
              <p className="text-foreground text-xs">
                Is Loading Images: {isLoadingImages.toString()}
              </p>
              <p className="text-foreground text-xs">
                Loading Progress: {imageLoadingProgress}%
              </p>
              <p className="text-foreground text-xs">
                Cached Image URLs: {imageUrls.size}
              </p>
              {tarDebugInfo && (
                <>
                  <p className="text-foreground text-xs">
                    Presigned URL Fetched:{" "}
                    {tarDebugInfo.presignedUrlFetched.toString()}
                  </p>
                  {tarDebugInfo.presignedUrl && (
                    <p className="text-foreground text-xs break-all">
                      Presigned URL: {tarDebugInfo.presignedUrl}
                    </p>
                  )}
                  {tarDebugInfo.presignedUrlExpiry && (
                    <p className="text-foreground text-xs">
                      URL Expires:{" "}
                      {new Date(
                        tarDebugInfo.presignedUrlExpiry,
                      ).toLocaleString()}
                    </p>
                  )}
                  <p className="text-foreground text-xs">
                    Tar File Fetched: {tarDebugInfo.tarFileFetched.toString()}
                  </p>
                  <p className="text-foreground text-xs">
                    Tar File Size:{" "}
                    {(tarDebugInfo.tarFileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-foreground text-xs">
                    Extraction Completed:{" "}
                    {tarDebugInfo.extractionCompleted.toString()}
                  </p>
                  <p className="text-foreground text-xs">
                    Images Found/Stored: {tarDebugInfo.totalImagesFound}/
                    {tarDebugInfo.imagesStored}
                  </p>
                  <p className="text-foreground text-xs">
                    Processing Time: {tarDebugInfo.processingTime.toFixed(0)}ms
                  </p>
                  {tarDebugInfo.cacheErrors.length > 0 && (
                    <p className="text-xs text-red-600">
                      Cache Errors: {tarDebugInfo.cacheErrors.join(", ")}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <RequestSegmentationButton />

        <MaskTestCanvas />

        {projectActiveJobs.length > 0 && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-purple-50 p-3 font-semibold dark:bg-purple-900/20">
              Project Jobs ({projectActiveJobs.length}) (Click to expand)
            </summary>
            <div className="space-y-2 p-4">
              {projectActiveJobs.map((job) => (
                <div key={job.jobId} className="rounded border p-2">
                  <p className="text-foreground">
                    <strong>Job ID:</strong> {job.jobId}
                  </p>
                  <p className="text-foreground">
                    <strong>Status:</strong> {job.status}
                  </p>
                  {job.queuePosition && (
                    <p className="text-foreground">
                      <strong>Queue Position:</strong> {job.queuePosition}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {medSamMask.length > 0 && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-blue-50 p-3 font-semibold dark:bg-blue-900/20">
              AI Masks ({medSamMask.length}) (Click to expand)
            </summary>
            <pre className="max-h-96 overflow-auto p-4 text-sm whitespace-pre-wrap">
              {JSON.stringify(medSamMask, null, 2)}
            </pre>
          </details>
        )}

        {editableMask.length > 0 && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-green-50 p-3 font-semibold dark:bg-green-900/20">
              Editable Masks ({editableMask.length}) (Click to expand)
            </summary>
            <pre className="max-h-96 overflow-auto p-4 text-sm whitespace-pre-wrap">
              {JSON.stringify(editableMask, null, 2)}
            </pre>
          </details>
        )}

        {(Object.keys(decodedMasks.aiMasks).length > 0 ||
          Object.keys(decodedMasks.manualMasks).length > 0) && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-orange-50 p-3 font-semibold dark:bg-orange-900/20">
              Decoded Masks (AI: {Object.keys(decodedMasks.aiMasks).length},
              Manual: {Object.keys(decodedMasks.manualMasks).length}) (Click to
              expand)
            </summary>
            <div className="space-y-4 p-4">
              {Object.keys(decodedMasks.aiMasks).length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
                    AI Masks:
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(decodedMasks.aiMasks).map(([key, mask]) => (
                      <div key={key} className="text-muted-foreground text-sm">
                        <span className="font-mono text-xs">{key}</span>:
                        <span className="ml-2">Size: {mask.length} pixels</span>
                        <span className="ml-2">
                          Non-zero: {mask.filter((v) => v > 0).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(decodedMasks.manualMasks).length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-green-600 dark:text-green-400">
                    Manual Masks:
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(decodedMasks.manualMasks).map(
                      ([key, mask]) => (
                        <div
                          key={key}
                          className="text-muted-foreground text-sm"
                        >
                          <span className="font-mono text-xs">{key}</span>:
                          <span className="ml-2">
                            Size: {mask.length} pixels
                          </span>
                          <span className="ml-2">
                            Non-zero: {mask.filter((v) => v > 0).length}
                          </span>
                        </div>
                      ),
                    )}
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
