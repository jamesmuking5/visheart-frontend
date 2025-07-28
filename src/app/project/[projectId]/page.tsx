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
  const [maskFound, setMaskFound] = useState(false); // if prior segmentation done
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

          // Fetch segmentation masks and separate to MedSAM output mask and editable mask
          const masksResponse =
            await segmentationApi.getSegmentationResults(projectId);
          if (masksResponse.success) {
            setMaskFound(true);

            // Separate masks based on isMedSAMOutput flag
            const aiMasks = masksResponse.segmentations.filter(
              (mask: any) => mask.isMedSAMOutput === true,
            );
            const manualMasks = masksResponse.segmentations.filter(
              (mask: any) => mask.isMedSAMOutput === false,
            );

            setMedSamMask(aiMasks);
            setEditableMask(manualMasks);
          } else {
            // If no masks, check for job first. If no job means no segmentation started, ask if want
            await 
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
    if (!maskFound) return null;
    // Function to handle starting segmentation
    const handleStartSegmentation = async () => {
      try {
        const response = await segmentationApi.startSegmentation(projectId);
        if (response)
          console.log("Segmentation started successfully:", response);
      } catch (error) {
        console.error("Error starting segmentation:", error);
      }
    };
    // Render button to start segmentation
    return (
      <div>
        <p>No mask found, press button below to start segmentation.</p>
        <Button onClick={handleStartSegmentation} variant="secondary">
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
          <summary className="cursor-pointer bg-gray-50 p-3 font-semibold">
            Project Info (Click to expand)
          </summary>
          <pre className="overflow-auto p-4 text-sm whitespace-pre-wrap">
            {JSON.stringify(project, null, 2)}
          </pre>
        </details>

        <p className="text-red-600">{`Error: ${error}`}</p>

        <RequestSegmentationButton />

        {medSamMask && medSamMask.length > 0 && (
          <details className="rounded-md border">
            <summary className="cursor-pointer bg-blue-50 p-3 font-semibold">
              AI Masks ({medSamMask.length}) (Click to expand)
            </summary>
            <pre className="max-h-96 overflow-auto p-4 text-sm whitespace-pre-wrap">
              {JSON.stringify(medSamMask, null, 2)}
            </pre>
          </details>
        )}

        {editableMask && editableMask.length > 0 && (
          <details className="rounded-md border">
            <summary className="cursor-pointer bg-green-50 p-3 font-semibold">
              Editable Masks ({editableMask.length}) (Click to expand)
            </summary>
            <pre className="max-h-96 overflow-auto p-4 text-sm whitespace-pre-wrap">
              {JSON.stringify(editableMask, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </>
  );
}
