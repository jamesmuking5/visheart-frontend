"use client";

import { useProject } from "@/context/ProjectContext";
import { ShowProjectData } from "@/components/project/ShowProjectData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Clock, CheckCircle2, XCircle, AlertCircle, Database, Activity, Download, Settings } from "lucide-react";

export function ProjectDashboardBar() {
  const { projectData, loading, hasMasks, undecodedMasks, decodedMasks, jobs, error, jobsError } = useProject();

  if (!projectData) return null;

  // Get status info
  const getProjectStatus = () => {
    if (error) return { status: "error", icon: XCircle, color: "destructive" as const, text: "Error" };
    if (loading !== "done") return { status: "loading", icon: Clock, color: "secondary" as const, text: "Loading" };
    if (hasMasks) return { status: "completed", icon: CheckCircle2, color: "default" as const, text: "Ready" };

    // Check job status
    const runningJobs = jobs?.filter((job) => job.status === "in_progress") || [];
    if (runningJobs.length > 0) return { status: "processing", icon: Activity, color: "secondary" as const, text: "Processing" };

    return { status: "pending", icon: AlertCircle, color: "outline" as const, text: "Pending" };
  };

  const statusInfo = getProjectStatus();
  const StatusIcon = statusInfo.icon;

  // Get mask count from actual mask data, not jobs
  const maskCount = hasMasks ? undecodedMasks?.length || 0 : 0;

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Project info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div className="flex flex-col">
                <h1 className="font-semibold text-sm leading-none">{projectData.name}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{projectData.description}</p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              <Badge variant={statusInfo.color} className="text-xs">
                {statusInfo.text}
              </Badge>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                <span>
                  {projectData.dimensions?.width}×{projectData.dimensions?.height}
                </span>
              </div>

              {hasMasks && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>{maskCount} masks</span>
                </div>
              )}

              {jobs && jobs.length > 0 && (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>{jobs.length} jobs</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>

            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
