"use client";

// Core React and Next.js imports
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

// Custom components
import { NoProjectFound } from "@/components/project(test)/NoProjectFound";
import { ErrorProject } from "@/components/project(test)/ErrorProject";
import { ShowProjectData } from "@/components/project(test)/ShowProjectData";
import { LoadingProject } from "@/components/project(test)/LoadingProject";

// Custom utilities
import { projectApi, segmentationApi } from "@/lib/api";
import { decodeSegmentationMasks } from "@/lib/decode-RLE(test)";

// Type definitions
import * as ProjectTypes from "@/types/project(test)";

// Type for Loading
import { LoadingStage } from "@/types/project(test)";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState<LoadingStage>("idle"); // Page loading

  // General state variables
  const [error, setError] = useState<string | null>(null); // Page error state

  // 1. Fetch project data from backend
  const [projectData, setProjectData] = useState<ProjectTypes.ProjectData | null>(null); // Project data as fetched from the API
  useEffect(() => {
    setLoading("project"); // Set loading state for project data

    // Check if projectId is available
    if (!projectId) {
      setProjectData(null);
      setError("Project ID is missing.");
      setLoading("done");
      return;
    }

    // Fetch project data using the projectId
    projectApi
      .getProjectInfo(projectId)
      .then((response) => {
        // If backend cannot find project, set error state, end loading
        if (!response.success) {
          setError(response.message);
          setLoading("done");
          return;
        }

        // Handle project data
        setProjectData(response.project);
        console.log("Verifying project data:", response.project);
      })
      .catch((error: unknown) => {
        setError("Failed to fetch project data.");
        console.error("Error fetching project:", error);
      })
      .finally(() => {
        // Simulate a delay for loading state (todo)
        setTimeout(() => {
          setLoading("idle");
        }, 500);
      });
  }, [projectId]);

  // 2. If projectId exists, check if segmentation masks exist (useEffect relies on projectData)
  // If masks exist, fetch and decode right away
  const [hasMasks, setHasMasks] = useState<boolean>(false); // State to track if masks exist, if not, check jobs
  const [undecodedMasks, setUndecodedMasks] = useState<ProjectTypes.BaseSegmentationMask[] | null>(null); //
  const [segmentationError, setSegmentationError] = useState<string | null>(null);
  const decodedMasks = useRef<Record<string, Uint8Array> | null>(null); // Decoded masks state

  useEffect(() => {
    setLoading("mask"); // Set loading state for segmentation masks

    // If there is an error fetching project data, do not proceed with fetching masks
    if (error || !projectId) {
      setLoading("done");
      return;
    }

    // Fetch segmentation masks for the project
    segmentationApi
      .getSegmentationResults(projectId)
      .then((response) => {
        // Handle segmentation masks (todo: decode them)
        console.log("Segmentation masks response:", response);
        console.log("Decoded masks ref:", decodedMasks.current);

        // If masks not found in backend, set mask error state, but not project/page error
        if (!response.success) {
          setHasMasks(false);
          setSegmentationError(response.message);
          decodedMasks.current = null; // Reset decoded masks
          console.warn("No masks found:", response.message);
          return;
        }
        setHasMasks(true);

        // Set into undecoded masks state, then start decoding
        setUndecodedMasks(response.segmentations);
        console.log("Undecoded masks:", response.segmentations);

        // Decode the masks
        decodedMasks.current = decodeSegmentationMasks(response.segmentations, projectData?.dimensions?.width || 0, projectData?.dimensions?.height || 0).masks; // Store in ref
        console.log("Decoded masks:", decodedMasks.current);
      })
      .catch((error: unknown) => {
        setSegmentationError("Failed to fetch segmentation masks.");
        console.error("Error fetching segmentation masks:", error);
      })
      .finally(() => {
        // Simulate a delay for loading state (todo)
        setTimeout(() => {
          setLoading("done");
        }, 500);
      });
  }, [projectData, projectId, error]);

  // 3.

  // Missing projectId handling (to do)
  if (!projectId) return <NoProjectFound message="Project ID is missing." />;
  // Loading state (to do)
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;
  // Error states (project, masks, jobs)
  if (error) return <ErrorProject error={error} />;
  // Todo: if no masks, check jobs, and if no jobs, show start segmentation button
  // if (segmentationError) return <ErrorProject error={segmentationError} />;

  if (projectData) console.log(projectData.projectId);
  if (decodedMasks.current) console.log("Decoded masks in state:", Object.keys(decodedMasks.current).length);
  return projectData ? <ShowProjectData project={projectData} hasMasks={hasMasks} /> : null;
}
