"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { projectApi, segmentationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, ArrowLeft } from "lucide-react";

// Types
import { ProjectInfo } from "@/types/project";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [medSamMask, setMedSamMask] = useState<any[] | null>([]);
  const [editableMask, setEditableMask] = useState<any[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // Fetch project information
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectApi.getProjectInfo(projectId);

        if (response.success && response.project) {
          setProject(response.project);

          // Fetch segmentation masks and break to MedSAM output mask and editable mask
          const masksResponse =
            await segmentationApi.getSegmentationResults(projectId);
          if (masksResponse.success) {
            // TODO: HANDLE MASK (BREAK INTO MEDSAM AND EDITABLE MASK)
            console.log("Masks response:", masksResponse);
          } else {
            // If no masks, ask if want to start segmentation (check if mask is null)
            console.warn("No segmentation masks found for this project.");
          }
        } else {
          setError(response.message || "Project not found");
        }
      } catch (err: unknown) {
        console.error("Error fetching project:", err);
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

    fetchProject();
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
    const handleStartSegmentation = () => {
      try {
        segmentationApi.startSegmentation(projectId);
      } catch (error) {
        console.error("Error starting segmentation:", error);
      }
    };
    return (
      <div>
        <p>No mask found, press button below to start segmentation.</p>
        <Button onClick={handleStartSegmentation} variant="primary">
          Start Segmentation
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Project Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error || "The requested project could not be found."}
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <pre>{JSON.stringify(project)}</pre>
      <p>{`Error: ${error}`}</p>
      {medSamMask.length === 0 && editableMask.length === 0 ? (
        <RequestSegmentationButton />
      ) : null}
    </>
  );
}
