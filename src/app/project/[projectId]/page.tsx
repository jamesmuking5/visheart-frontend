"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { projectApi, segmentationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, ArrowLeft } from "lucide-react";
import { decodeSegmentationMasks, DecodedMasks } from "@/lib/decode-RLE";

// Types
import {
  ProjectInfo,
  UserJob,
  UserJobsResponse,
  JobStatus,
} from "@/types/project";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [maskFound, setMaskFound] = useState(false); // if prior segmentation done
  const [medSamMask, setMedSamMask] = useState<any[] | null>([]);
  const [editableMask, setEditableMask] = useState<any[] | null>([]);
  const [decodedMasks, setDecodedMasks] = useState<DecodedMasks>({
    aiMasks: {},
    manualMasks: {},
  });
  const [userJobs, setUserJobs] = useState<UserJob[]>([]);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [projectActiveJobs, setProjectActiveJobs] = useState<UserJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segmentationError, setSegmentationError] = useState<string | null>(
    null,
  );
  const [isStartingSegmentation, setIsStartingSegmentation] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    // Fetch project information, masks, and jobs
    const fetchProjectData = async () => {
      try {
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

        // 2. Fetch user jobs to check for active jobs
        let projectJobs: UserJob[] = [];
        try {
          const jobsResponse: UserJobsResponse =
            await segmentationApi.getUserJobs();
          if (jobsResponse.success) {
            setUserJobs(jobsResponse.jobs);
            setActiveJobCount(jobsResponse.activeJobCount);

            // Filter jobs for this specific project
            console.log("All jobs:", jobsResponse.jobs);
            console.log("Current projectId:", projectId);

            projectJobs = jobsResponse.jobs.filter((job) => {
              console.log(
                `Comparing job.projectId (${job.projectId}) with projectId (${projectId})`,
              );
              return job.projectId === projectId;
            });
            setProjectActiveJobs(projectJobs);

            console.log(
              `Found ${projectJobs.length} jobs for project ${projectId}:`,
              projectJobs,
            );

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
          console.warn("Failed to fetch user jobs:", jobError);
          // Don't fail the entire fetch if jobs fail
        }

        // 3. Fetch segmentation masks
        const masksResponse =
          await segmentationApi.getSegmentationResults(projectId);

        if (
          masksResponse.success &&
          masksResponse.segmentations &&
          masksResponse.segmentations.length > 0
        ) {
          // Masks found - separate them
          setMaskFound(true);

          const aiMasks = masksResponse.segmentations.filter(
            (mask: any) => mask.isMedSAMOutput === true,
          );
          const manualMasks = masksResponse.segmentations.filter(
            (mask: any) => mask.isMedSAMOutput === false,
          );

          setMedSamMask(aiMasks);
          setEditableMask(manualMasks);

          // Decode RLE masks if project dimensions are available
          if (response.project.dimensions) {
            const decoded = decodeSegmentationMasks(aiMasks, manualMasks, {
              width: response.project.dimensions.width,
              height: response.project.dimensions.height,
            });
            setDecodedMasks(decoded);
          } else {
            console.warn("Project dimensions not available for mask decoding");
          }

          console.log(
            `Found ${aiMasks.length} AI masks and ${manualMasks.length} manual masks`,
          );
        } else {
          // No masks found - check job status for potential issues
          setMaskFound(false);
          setMedSamMask([]);
          setEditableMask([]);

          // Edge case: Check if there are completed/failed jobs but no masks (indicates error)
          const completedOrFailedJobs = projectJobs.filter(
            (job) =>
              job.status === JobStatus.COMPLETED ||
              job.status === JobStatus.FAILED,
          );

          if (completedOrFailedJobs.length > 0) {
            const failedJobs = completedOrFailedJobs.filter(
              (job) => job.status === JobStatus.FAILED,
            );
            const completedJobs = completedOrFailedJobs.filter(
              (job) => job.status === JobStatus.COMPLETED,
            );

            if (failedJobs.length > 0) {
              setSegmentationError(
                `Segmentation failed. Found ${failedJobs.length} failed job(s).`,
              );
            } else if (completedJobs.length > 0) {
              setSegmentationError(
                `Warning: Found ${completedJobs.length} completed job(s) but no segmentation masks. This may indicate a processing error.`,
              );
            }
          }

          console.warn("No segmentation masks found for this project.");
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

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Component to ask if want to start segmentation if no masks found
  const RequestSegmentationButton = () => {
    // Don't show button if masks are found
    if (maskFound) return null;

    // Check if there are ANY jobs (any status) for this project
    const hasAnyJobs = projectActiveJobs.length > 0;

    // Hide button if there are any jobs for this project
    if (hasAnyJobs) {
      const pendingJobs = projectActiveJobs.filter(
        (job) => job.status === JobStatus.PENDING,
      );
      const inProgressJobs = projectActiveJobs.filter(
        (job) => job.status === JobStatus.IN_PROGRESS,
      );
      const completedJobs = projectActiveJobs.filter(
        (job) => job.status === JobStatus.COMPLETED,
      );
      const failedJobs = projectActiveJobs.filter(
        (job) => job.status === JobStatus.FAILED,
      );

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

    // Function to handle starting segmentation
    const handleStartSegmentation = async () => {
      if (isStartingSegmentation) return; // Prevent multiple clicks

      try {
        setIsStartingSegmentation(true);
        console.log("Starting segmentation for project:", projectId);

        const response = await segmentationApi.startSegmentation(projectId);
        if (response) {
          console.log("Segmentation started successfully:", response);
          // Refresh the page to show the new job status
          window.location.reload();
        }
      } catch (error) {
        console.error("Error starting segmentation:", error);
        setSegmentationError("Failed to start segmentation. Please try again.");
        setIsStartingSegmentation(false); // Re-enable button on error
      }
    };

    // Render button to start segmentation
    return (
      <div className="space-y-4">
        <p className="text-foreground">
          No segmentation masks found. Start AI segmentation to generate masks.
        </p>
        {segmentationError && (
          <div className="rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {segmentationError}
          </div>
        )}{" "}
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
          <p className="text-foreground">Mask Found: {maskFound.toString()}</p>
          <p className="text-foreground">
            AI Masks Count: {medSamMask?.length || 0}
          </p>
          <p className="text-foreground">
            Manual Masks Count: {editableMask?.length || 0}
          </p>
          <p className="text-foreground">Active Jobs Count: {activeJobCount}</p>
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
            Is Starting Segmentation: {isStartingSegmentation.toString()}
          </p>
          <p className="text-foreground">
            Decoded AI Masks: {Object.keys(decodedMasks.aiMasks).length}
          </p>
          <p className="text-foreground">
            Decoded Manual Masks: {Object.keys(decodedMasks.manualMasks).length}
          </p>
          {segmentationError && (
            <p className="text-red-600">
              Segmentation Error: {segmentationError}
            </p>
          )}
        </div>

        <RequestSegmentationButton />

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

        {medSamMask && medSamMask.length > 0 && (
          <details className="rounded-md border">
            <summary className="text-foreground cursor-pointer bg-blue-50 p-3 font-semibold dark:bg-blue-900/20">
              AI Masks ({medSamMask.length}) (Click to expand)
            </summary>
            <pre className="max-h-96 overflow-auto p-4 text-sm whitespace-pre-wrap">
              {JSON.stringify(medSamMask, null, 2)}
            </pre>
          </details>
        )}

        {editableMask && editableMask.length > 0 && (
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
