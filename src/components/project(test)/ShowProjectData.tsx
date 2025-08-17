// Prints the project response from the backend
// Returns a single button that opens a sheet with project data

"use client";

import { useState } from "react";

// Auth context
import { useAuth } from "@/context/auth-context";

// Sheet import
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Tab import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// API and Auth imports
import { projectApi, segmentationApi } from "@/lib/api";
import { ShowForUser, ShowForRegisteredUser } from "@/components/RoleGuard";

// Icon imports
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Play, AlertTriangle, Shield } from "lucide-react";

// Type definitions
import * as ProjectTypes from "@/types/project(test)";
import { getMaskStats } from "@/lib/decode-RLE(test)";

type ShowProjectDataProps = {
  project: ProjectTypes.ProjectData;
  hasMasks: boolean;
  decodedMasks?: Record<string, Uint8Array> | null;
  masks?: ProjectTypes.BaseSegmentationMask[] | null;
  jobs?: ProjectTypes.UserJob[] | null;
  jobsError?: string | null;
  onProjectUpdate?: () => void; // Callback to refresh project data in parent
};

export const ShowProjectData = ({ project, hasMasks, decodedMasks, masks, jobs, jobsError, onProjectUpdate }: ShowProjectDataProps) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStartingSegmentation, setIsStartingSegmentation] = useState(false);
  const [segmentationError, setSegmentationError] = useState<string | null>(null);
  const [localProject, setLocalProject] = useState(project);

  if (!localProject) return null;

  const width = localProject.dimensions?.width ?? 0;
  const height = localProject.dimensions?.height ?? 0;

  // Handle save/unsave project
  const handleSaveProject = async (isSaved: boolean) => {
    setIsUpdating(true);
    try {
      await projectApi.saveProject(localProject.projectId, isSaved);
      setLocalProject((prev) => ({ ...prev, isSaved }));
      onProjectUpdate?.(); // Notify parent component to refresh
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Parse segmentation error and return user-friendly message
  const getSegmentationErrorMessage = (error: any): string => {
    const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Unknown error occurred";
    const statusCode = error?.response?.status;
    const isAdmin = user?.role === "admin";

    // Check for 500 errors (GPU server down/unavailable)
    if (statusCode === 500) {
      return isAdmin
        ? `GPU server is probably unavailable (HTTP 500). Backend message: "${errorMessage}"`
        : "The GPU processing server is probably unavailable. Please contact your administrator or try again later.";
    }

    // Check for other GPU server down indicators
    if (
      errorMessage.toLowerCase().includes("gpu") ||
      errorMessage.toLowerCase().includes("server") ||
      errorMessage.toLowerCase().includes("connection") ||
      errorMessage.toLowerCase().includes("timeout") ||
      statusCode === 503
    ) {
      return isAdmin
        ? `GPU server is currently down or unreachable. Error: "${errorMessage}"`
        : "The segmentation service is temporarily unavailable. Please contact your administrator or try again later.";
    }

    // Check for resource exhaustion
    if (errorMessage.toLowerCase().includes("busy") || errorMessage.toLowerCase().includes("queue")) {
      return "The GPU server is currently busy processing other requests. Please try again in a few minutes.";
    }

    // Check for authentication/authorization errors
    if (statusCode === 401 || statusCode === 403) {
      return isAdmin ? `Authentication/Authorization error: "${errorMessage}"` : "Access denied. Please contact your administrator.";
    }

    // Check for project-related errors
    if (statusCode === 404 || errorMessage.toLowerCase().includes("project") || errorMessage.toLowerCase().includes("not found")) {
      return "Project not found or invalid. Please refresh the page and try again.";
    }

    // Generic error with role-based messaging
    if (isAdmin) {
      return `Technical error (${statusCode || "Unknown"}): ${errorMessage}`;
    } else {
      return "An unexpected error occurred. Please contact your administrator for assistance.";
    }
  };

  // Handle start segmentation
  const handleStartSegmentation = async () => {
    setIsStartingSegmentation(true);
    setSegmentationError(null);

    try {
      await segmentationApi.startSegmentation(localProject.projectId);
      // Only reload on success
      window.location.reload();
    } catch (error) {
      console.error("Error starting segmentation:", error);
      setSegmentationError(getSegmentationErrorMessage(error));
    } finally {
      setIsStartingSegmentation(false);
    }
  };

  // Derive mask summary
  const decodedKeys = decodedMasks ? Object.keys(decodedMasks) : [];
  const totalDecoded = decodedKeys.length;
  const perClassCount: Record<string, number> = {};
  decodedKeys.forEach((k) => {
    const cls = k.split("_").pop() || "unknown"; // key format ends with class
    perClassCount[cls] = (perClassCount[cls] || 0) + 1;
  });

  // Derive job summary
  const jobCounts = (jobs || []).reduce(
    (acc, j) => {
      acc[j.status] = (acc[j.status] || 0) + 1;
      return acc;
    },
    {} as Record<ProjectTypes.JobStatus, number>,
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="text-background bg-foreground" variant="ghost" size="sm">
          Project Information
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] max-w-[800px] min-w-[500px] z-100 pt-8">
        <SheetHeader>
          <SheetTitle className="text-center font-extrabold w-full text-foreground text-2xl">Project Information</SheetTitle>
        </SheetHeader>
        <Tabs className="w-full px-5" defaultValue="project">
          <TabsList className="flex w-full flex-row gap-2 h-14">
            <TabsTrigger value="project">Project Data</TabsTrigger>
            {hasMasks && <TabsTrigger value="mask">Mask Data</TabsTrigger>} {/* Show mask tab only if masks exist */}
            {!hasMasks && <TabsTrigger value="job">Job Data</TabsTrigger>}
          </TabsList>

          {/* Project Data Section */}
          <TabsContent value="project" className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Project ID</span>
                <span className="text-muted-foreground">{project.projectId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Name</span>
                <span className="text-muted-foreground">{localProject.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Description</span>
                <span className="text-muted-foreground max-w-[60%] truncate" title={localProject.description}>
                  {localProject.description}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Status</span>
                <ShowForRegisteredUser fallback={<Badge variant={localProject.isSaved ? "default" : "secondary"}>{localProject.isSaved ? "Saved" : "Temp"}</Badge>}>
                  <Button variant="ghost" size="sm" onClick={() => handleSaveProject(!localProject.isSaved)} className="h-auto p-1" disabled={isUpdating}>
                    <Badge variant={localProject.isSaved ? "default" : "secondary"} className="cursor-pointer hover:opacity-80">
                      {localProject.isSaved ? "Saved" : "Temp"}
                    </Badge>
                  </Button>
                </ShowForRegisteredUser>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">File Type</span>
                <span className="text-muted-foreground">
                  {localProject.filetype} • {localProject.filesize} bytes
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Dimensions</span>
                <span className="text-muted-foreground">
                  {width} × {height}
                  {localProject.dimensions?.slices !== undefined && ` × ${localProject.dimensions.slices}`}
                  {localProject.dimensions?.frames !== undefined && ` × ${localProject.dimensions.frames}`}
                </span>
              </div>
              {localProject.voxelsize && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Voxel Size</span>
                  <span className="text-muted-foreground">
                    x: {localProject.voxelsize.x}, y: {localProject.voxelsize.y}
                    {localProject.voxelsize.z !== undefined && `, z: ${localProject.voxelsize.z}`}
                    {localProject.voxelsize.t !== undefined && `, t: ${localProject.voxelsize.t}`}
                  </span>
                </div>
              )}
              {localProject.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Created</span>
                  <span className="text-muted-foreground">{new Date(localProject.createdAt).toLocaleString()}</span>
                </div>
              )}
              {localProject.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Updated</span>
                  <span className="text-muted-foreground">{new Date(localProject.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Mask Data Section */}
          {hasMasks && (
            <TabsContent value="mask" className="p-0">
              <ScrollArea className="h-[60vh] max-h-[500px] min-h-[300px] p-4">
                <div className="space-y-4">
                  {totalDecoded > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Masks</span>
                        <Badge variant="outline">{totalDecoded}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">By Class</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(perClassCount).map(([cls, count]) => (
                            <div key={cls} className="flex items-center justify-between rounded-md border p-2">
                              <span className="uppercase text-xs text-muted-foreground">{cls}</span>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Sample Masks</p>
                        <div className="space-y-2">
                          {decodedKeys.slice(0, 5).map((key) => {
                            const stats = getMaskStats(decodedMasks![key]);
                            return (
                              <div key={key} className="rounded-md border p-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground truncate max-w-[70%]" title={key}>
                                    {key}
                                  </span>
                                  <span className="text-xs">{(stats.coverage * 100).toFixed(2)}% coverage</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {masks && masks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Raw Mask Sets</p>
                      <div className="space-y-2">
                        {masks.slice(0, 3).map((m) => (
                          <div key={m._id} className="rounded-md border p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{m.name}</span>
                              <Badge variant="outline">{m.isMedSAMOutput ? "AI" : "Manual"}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Frames: {m.frames?.length || 0}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
          {/* Job Section */}
          <TabsContent value="job" className="p-0">
            <ScrollArea className="h-[60vh] max-h-[500px] min-h-[300px] p-4">
              <div className="space-y-4">
                {jobsError && (
                  <div className="text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {jobsError}
                  </div>
                )}

                {!jobs || jobs.length === 0 ? (
                  <div className="text-center py-6 space-y-4">
                    <CheckCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No Active Jobs</h3>
                    <p className="text-muted-foreground text-sm mb-4">No segmentation jobs found for this project. Start a new segmentation to see job details here.</p>

                    {!hasMasks && (
                      <ShowForUser fallback={null}>
                        {segmentationError ? (
                          // Error state with improved design
                          <div className="space-y-4 max-w-lg mx-auto">
                            <div className="rounded-xl border border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10 p-6 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  {user?.role === "admin" ? (
                                    <div className="rounded-full bg-destructive/15 p-2">
                                      <AlertTriangle className="h-5 w-5 text-destructive" />
                                    </div>
                                  ) : (
                                    <div className="rounded-full bg-destructive/15 p-2">
                                      <XCircle className="h-5 w-5 text-destructive" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-destructive text-lg mb-2">{user?.role === "admin" ? "System Error" : "Service Unavailable"}</h4>
                                  <div className="space-y-3">
                                    <p className="text-sm text-destructive/90 leading-relaxed text-justify">{segmentationError}</p>
                                    {user?.role === "admin" && (
                                      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground font-medium w-full">Admin View - Technical details shown</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 justify-center">
                              <Button variant="outline" size="sm" onClick={() => setSegmentationError(null)} className="px-4 py-2">
                                Dismiss
                              </Button>
                              <Button onClick={handleStartSegmentation} disabled={isStartingSegmentation} size="sm" className="px-4 py-2 font-medium">
                                {isStartingSegmentation ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
                                {isStartingSegmentation ? "Retrying..." : "Try Again"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Normal state with improved design
                          <div className="flex flex-col items-center space-y-3">
                            <Button
                              onClick={handleStartSegmentation}
                              disabled={isStartingSegmentation}
                              size="lg"
                              className="px-6 py-3 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              {isStartingSegmentation ? (
                                <>
                                  <RefreshCw className="mr-2.5 h-4 w-4 animate-spin" />
                                  Starting Segmentation...
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2.5 h-4 w-4" />
                                  Start Segmentation
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center max-w-sm">This will process your medical images using AI segmentation</p>
                          </div>
                        )}
                      </ShowForUser>
                    )}
                  </div>
                ) : jobs.length === 1 && (jobs[0].status === ProjectTypes.JobStatus.IN_PROGRESS || jobs[0].status === ProjectTypes.JobStatus.PENDING) && !hasMasks ? (
                  // Single job in progress without masks - show detailed view
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <RefreshCw className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin" />
                      <h3 className="text-sm font-medium text-foreground">Segmentation In Progress</h3>
                    </div>

                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 p-4 bg-blue-50/50 dark:bg-blue-950/30">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">Job Status</span>
                          <div className="flex items-center gap-2">
                            {jobs[0].status === ProjectTypes.JobStatus.IN_PROGRESS ? (
                              <RefreshCw className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            )}
                            <Badge variant={jobs[0].status === ProjectTypes.JobStatus.IN_PROGRESS ? "default" : "secondary"}>
                              {jobs[0].status === ProjectTypes.JobStatus.IN_PROGRESS ? "Processing" : "Pending"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">Job ID</span>
                          <span className="text-muted-foreground font-mono text-sm">{jobs[0].jobId.slice(-12)}</span>
                        </div>

                        {jobs[0].queuePosition !== null && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">Queue Position</span>
                            <span className="text-muted-foreground">{jobs[0].queuePosition}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 dark:border-amber-800 p-4 bg-amber-50/50 dark:bg-amber-950/30">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-900 dark:text-amber-100">Please Wait</h4>
                          <p className="text-sm text-amber-800 dark:text-amber-200">Your segmentation is being processed. This may take a few minutes depending on the image size and server load.</p>
                          <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                            <strong>Tip:</strong> Refresh this dialog periodically to check for completion. The segmentation results will appear in the Mask Data tab once ready.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Multiple jobs or other cases - show summary view
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="rounded-md border p-2 text-center">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-lg font-semibold">{jobCounts[ProjectTypes.JobStatus.PENDING] || 0}</p>
                      </div>
                      <div className="rounded-md border p-2 text-center">
                        <p className="text-xs text-muted-foreground">In Progress</p>
                        <p className="text-lg font-semibold">{jobCounts[ProjectTypes.JobStatus.IN_PROGRESS] || 0}</p>
                      </div>
                      <div className="rounded-md border p-2 text-center">
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-lg font-semibold">{jobCounts[ProjectTypes.JobStatus.COMPLETED] || 0}</p>
                      </div>
                      <div className="rounded-md border p-2 text-center">
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-lg font-semibold">{jobCounts[ProjectTypes.JobStatus.FAILED] || 0}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recent Jobs</p>
                      <div className="space-y-2">
                        {jobs.slice(0, 8).map((job) => (
                          <div key={job.jobId} className="flex items-center justify-between rounded-md border p-2">
                            <div>
                              <p className="text-sm font-medium">Job {job.jobId.slice(-8)}</p>
                              <p className="text-xs text-muted-foreground">Queue: {job.queuePosition ?? "-"}</p>
                              <p className="text-xs text-muted-foreground">For: {job.projectId}</p>
                            </div>
                            <Badge variant="outline">{job.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
