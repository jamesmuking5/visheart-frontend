"use client";

import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/context/ProjectContext";
import { useState } from "react";

// API
import { projectApi, segmentationApi } from "@/lib/api";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Icons
import { Play, Eye, Edit, Save, X, RefreshCw, Calendar, FileText, Database, CheckCircle, XCircle, Clock, AlertCircle, Settings, Image as ImageIcon, Activity, Layers } from "lucide-react";

// Custom components
import { NoProjectFound } from "@/components/project(test)/NoProjectFound";
import { ErrorProject } from "@/components/project(test)/ErrorProject";
import { LoadingProject } from "@/components/project(test)/LoadingProject";
import { ShowForUser, ShowForRegisteredUser } from "@/components/RoleGuard";

// Types
import * as ProjectTypes from "@/types/project(test)";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { loading, projectData, error, hasMasks, undecodedMasks, jobs, jobsError } = useProject();

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Segmentation state
  const [isStartingSegmentation, setIsStartingSegmentation] = useState(false);
  const [segmentationError, setSegmentationError] = useState<string | null>(null);

  // Missing projectId handling
  if (!projectId) return <NoProjectFound message="Project ID is missing." />;

  // Loading state
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;

  // Error states
  if (error) return <ErrorProject error={error} />;

  if (!projectData) return <ErrorProject error="Project data not available" />;

  // Initialize edit fields when starting to edit
  const handleStartEdit = () => {
    setEditedName(projectData.name);
    setEditedDescription(projectData.description || "");
    setIsEditing(true);
    setUpdateError(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName("");
    setEditedDescription("");
    setUpdateError(null);
  };

  // Save project updates
  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      setUpdateError("Project name is required");
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await projectApi.updateProject(projectId, editedName.trim(), editedDescription.trim());

      // Refresh page to get updated data
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error updating project:", error);
      setUpdateError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update project");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle start segmentation
  const handleStartSegmentation = async () => {
    setIsStartingSegmentation(true);
    setSegmentationError(null);

    try {
      await segmentationApi.startSegmentation(projectId);
      // Refresh page to see updated job status
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Small delay to show success state
    } catch (error: unknown) {
      console.error("Error starting segmentation:", error);
      setSegmentationError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to start segmentation");
    } finally {
      setIsStartingSegmentation(false);
    }
  };

  // Get job statistics
  const jobCounts = (jobs || []).reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {} as Record<ProjectTypes.JobStatus, number>,
  );

  // Get mask statistics
  const maskStats = undecodedMasks
    ? {
        total: undecodedMasks.length,
        aiGenerated: undecodedMasks.filter((mask) => mask.isMedSAMOutput).length,
        manual: undecodedMasks.filter((mask) => !mask.isMedSAMOutput).length,
        saved: undecodedMasks.filter((mask) => mask.isSaved).length,
      }
    : null;

  return (
    <div className="min-h-screen bg-muted/40 p-4 lg:p-8 ">
      <div className="container mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
              ← Back to Dashboard
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Project name" className="text-xl font-bold" />
                    {updateError && (
                      <Alert variant="destructive" className="w-fit">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{updateError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold text-foreground">{projectData.name}</h1>
                )}
                <p className="text-muted-foreground">Project ID: {projectId}</p>
              </div>
            </div>
          </div>

          {/* Edit Controls */}
          <ShowForRegisteredUser>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isUpdating}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating || !editedName.trim()}>
                  {isUpdating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            )}
          </ShowForRegisteredUser>
        </div>

        {/* Description Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} placeholder="Project description (optional)" rows={3} className="resize-none" />
            ) : (
              <p className="text-muted-foreground">{projectData.description || "No description provided."}</p>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Project Info & Actions */}
          <div className="xl:col-span-2 space-y-6">
            {/* Project Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Badge variant={projectData.isSaved ? "default" : "secondary"}>{projectData.isSaved ? "Saved" : "Temporary"}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Status</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="font-semibold">{projectData.dimensions?.frames || 0}</p>
                    <p className="text-xs text-muted-foreground">Frames</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="font-semibold">{projectData.dimensions?.slices || 0}</p>
                    <p className="text-xs text-muted-foreground">Slices</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="font-semibold">{(projectData.filesize / 1024 / 1024).toFixed(1)}MB</p>
                    <p className="text-xs text-muted-foreground">Size</p>
                  </div>
                </div>

                {projectData.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created
                    </span>
                    <span>{new Date(projectData.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => router.push(`/project(test)/${projectId}/preview`)} className="h-12" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Images
                  </Button>

                  {hasMasks ? (
                    <Button onClick={() => router.push(`/project(test)/${projectId}/segmentation`)} className="h-12">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Segmentation
                    </Button>
                  ) : (
                    <ShowForUser fallback={null}>
                      <Button onClick={handleStartSegmentation} disabled={isStartingSegmentation} className="h-12">
                        {isStartingSegmentation ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Segmentation
                          </>
                        )}
                      </Button>
                    </ShowForUser>
                  )}
                </div>

                {segmentationError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{segmentationError}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Dimensions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Width:</span>
                        <span>{projectData.dimensions?.width || 0} px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Height:</span>
                        <span>{projectData.dimensions?.height || 0} px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slices:</span>
                        <span>{projectData.dimensions?.slices || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frames:</span>
                        <span>{projectData.dimensions?.frames || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Voxel Size</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">X:</span>
                        <span>{projectData.voxelsize?.x || 0} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Y:</span>
                        <span>{projectData.voxelsize?.y || 0} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Z:</span>
                        <span>{projectData.voxelsize?.z || 0} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">T:</span>
                        <span>{projectData.voxelsize?.t || 0} ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">File Type:</span>
                    <p className="font-mono">{projectData.filetype}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <p>{(projectData.filesize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Project ID:</span>
                    <p className="truncate font-mono">{projectData.projectId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Saved:</span>
                    <p>{projectData.isSaved ? "Yes" : "No"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Masks & Jobs */}
          <div className="space-y-6">
            {/* Masks Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Segmentation Masks
                  {hasMasks && <Badge variant="outline">{maskStats?.total || 0}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasMasks && maskStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-900 dark:text-green-100">Available</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ready for editing</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold">{maskStats.total}</p>
                        <p className="text-xs text-muted-foreground">Total Masks</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AI Generated:</span>
                        <Badge variant="secondary">{maskStats.aiGenerated}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Manual/Edited:</span>
                        <Badge variant="outline">{maskStats.manual}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saved:</span>
                        <Badge variant="default">{maskStats.saved}</Badge>
                      </div>
                    </div>

                    <Button onClick={() => router.push(`/project(test)/${projectId}/segmentation`)} className="w-full" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Open Segmentation Editor
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-lg bg-muted/50 flex items-center justify-center">
                      <Layers className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-muted-foreground">No Masks Available</h3>
                      <p className="text-sm text-muted-foreground">Start segmentation to generate masks</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Jobs Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Processing Jobs
                  {jobs && jobs.length > 0 && <Badge variant="outline">{jobs.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{jobsError}</AlertDescription>
                  </Alert>
                ) : jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
                        <p className="font-semibold text-yellow-900 dark:text-yellow-100">{jobCounts[ProjectTypes.JobStatus.PENDING] || 0}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">{jobCounts[ProjectTypes.JobStatus.IN_PROGRESS] || 0}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100">{jobCounts[ProjectTypes.JobStatus.COMPLETED] || 0}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100">{jobCounts[ProjectTypes.JobStatus.FAILED] || 0}</p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </div>
                    </div>

                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {jobs.map((job, index) => (
                          <div key={job.jobId || index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              {job.status === ProjectTypes.JobStatus.PENDING && <Clock className="h-4 w-4 text-yellow-600" />}
                              {job.status === ProjectTypes.JobStatus.IN_PROGRESS && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                              {job.status === ProjectTypes.JobStatus.COMPLETED && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {job.status === ProjectTypes.JobStatus.FAILED && <XCircle className="h-4 w-4 text-red-600" />}
                              <div>
                                <p className="text-sm font-medium">Segmentation Job</p>
                                <p className="text-xs text-muted-foreground">Job ID: {job.jobId}</p>
                              </div>
                            </div>
                            <Badge variant={job.status === ProjectTypes.JobStatus.COMPLETED ? "default" : job.status === ProjectTypes.JobStatus.FAILED ? "destructive" : "secondary"}>
                              {job.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-lg bg-muted/50 flex items-center justify-center">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-muted-foreground">No Processing Jobs</h3>
                      <p className="text-sm text-muted-foreground">{hasMasks ? "All segmentation processing is complete" : "Start segmentation to see job progress"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
