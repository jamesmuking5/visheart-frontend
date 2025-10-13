"use client";

import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Clock, CheckCircle2, XCircle, AlertCircle, Database, Activity, Download, Settings, ChevronUp, ChevronDown } from "lucide-react";
import { segmentationApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ProjectDashboardBar() {
  const { projectData, loading, hasMasks, undecodedMasks, jobs, error } = useProject();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!projectData) return null;

  // Export function
  const handleExportProject = async () => {
    if (!projectData?.projectId) return;
    
    try {
      console.log(`[Export] Starting export for project: ${projectData.projectId}`);
      const exportResult = await segmentationApi.exportProjectData(projectData.projectId);
      console.log(`[Export] Received export result:`, { 
        blobSize: exportResult.blob.size, 
        blobType: exportResult.blob.type,
        expectedSize: exportResult.fileSizeBytes,
        filename: exportResult.suggestedFilename
      });
      
      const url = window.URL.createObjectURL(exportResult.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportResult.suggestedFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`[Export] Successfully downloaded export for project: ${projectData.projectId} as ${exportResult.suggestedFilename}`);
    } catch (error) {
      console.error("Error exporting project:", error);
    }
  };

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
    <>
      {/* Collapsible Dashboard Bar */}
      <div 
        className={cn(
          "sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0 opacity-0 border-b-0" : "max-h-24 opacity-100"
        )}
      >
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
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs" 
                disabled={!hasMasks}
                onClick={handleExportProject}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>

              <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>

              {/* Collapse button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsCollapsed(true)}
                aria-label="Hide dashboard"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button (shown when collapsed) */}
      <div 
        className={cn(
          "fixed top-2 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out",
          isCollapsed ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <Button
          variant="secondary"
          size="sm"
          className="h-12 px-3 rounded-lg shadow-lg border bg-background/95 backdrop-blur hover:bg-accent"
          onClick={() => setIsCollapsed(false)}
          aria-label="Show dashboard"
        >
          <Heart className="h-3 w-3 text-red-500 mr-1.5" />
          <span className="text-xs font-medium">{projectData.name}</span>
          <Separator orientation="vertical" className="h-3 mx-2" />
          <Badge variant={statusInfo.color} className="text-xs h-5 px-1.5">
            {statusInfo.text}
          </Badge>
          <ChevronDown className="h-3 w-3 ml-1.5" />
        </Button>
      </div>
    </>
  );
}
