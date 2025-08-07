// Show loading state when loading background tasks
"use client";

import { RefreshCw } from "lucide-react";

// Type for loading state
import { LoadingStage } from "@/types/project(test)";

export const LoadingProject = ({ loadingStage }: { loadingStage: LoadingStage }) => {
  let defaultMessage = "Loading...";

  switch (loadingStage) {
    case "project":
      defaultMessage = "Loading project data...";
      break;
    case "mask":
      defaultMessage = "Loading segmentation masks...";
      break;
    case "job":
      defaultMessage = "Loading job data...";
      break;
    default:
      // Should not reach here, but just in case
      break;
  }

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center space-x-2">
        <RefreshCw className="text-foreground h-4 w-4 animate-spin" />
        <span className="text-foreground text-sm">{defaultMessage}</span>
      </div>
    </div>
  );
};
