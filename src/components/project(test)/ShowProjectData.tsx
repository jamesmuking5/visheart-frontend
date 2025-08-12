// Prints the project response from the backend
// Returns a single button that opens a sheet with project data

"use client";

// Sheet import
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Tab import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
};

export const ShowProjectData = ({ project, hasMasks, decodedMasks, masks, jobs, jobsError }: ShowProjectDataProps) => {
  if (!project) return null;

  const width = project.dimensions?.width ?? 0;
  const height = project.dimensions?.height ?? 0;

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
        <h1 className="text-center font-extrabold w-full text-foreground text-2xl">Project Information</h1>
        <Tabs className="w-full px-5" defaultValue="project">
          <TabsList className="flex w-full flex-row gap-2 h-6">
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
                <span className="text-muted-foreground">{project.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Description</span>
                <span className="text-muted-foreground max-w-[60%] truncate" title={project.description}>
                  {project.description}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Status</span>
                <Badge variant={project.isSaved ? "default" : "secondary"}>{project.isSaved ? "Saved" : "Temp"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">File</span>
                <span className="text-muted-foreground">
                  {project.filetype} • {project.filesize} bytes
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Dimensions</span>
                <span className="text-muted-foreground">
                  {width} × {height}
                  {project.dimensions?.slices !== undefined && ` × ${project.dimensions.slices}`}
                  {project.dimensions?.frames !== undefined && ` × ${project.dimensions.frames}`}
                </span>
              </div>
              {project.voxelsize && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Voxel Size</span>
                  <span className="text-muted-foreground">
                    x: {project.voxelsize.x}, y: {project.voxelsize.y}
                    {project.voxelsize.z !== undefined && `, z: ${project.voxelsize.z}`}
                    {project.voxelsize.t !== undefined && `, t: ${project.voxelsize.t}`}
                  </span>
                </div>
              )}
              {project.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Created</span>
                  <span className="text-muted-foreground">{new Date(project.createdAt).toLocaleString()}</span>
                </div>
              )}
              {project.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Updated</span>
                  <span className="text-muted-foreground">{new Date(project.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Mask Data Section */}
          {hasMasks && (
            <TabsContent value="mask" className="p-0">
              <ScrollArea className="h-2xl p-4">
                <div className="space-y-4">
                  {totalDecoded > 0 ? (
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
                  ) : null}

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
          <TabsContent value="job" className="p-4 space-y-4">
            {jobsError && <div className="text-destructive text-sm">{jobsError}</div>}

            {!jobs || jobs.length === 0 ? (
              <div className="text-muted-foreground text-sm">No jobs found for this project.</div>
            ) : (
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
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
