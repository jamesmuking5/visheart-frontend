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
      return;
    }

    // Fetch project data using the projectId
    projectApi
      .getProjectInfo(projectId)
      .then((response) => {
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
  const [decodedMasks, setDecodedMasks] = useState<ProjectTypes.BaseSegmentationMask[] | null>(null);
  const [segmentationError, setSegmentationError] = useState<string | null>(null);

  useEffect(() => {
    setLoading("mask"); // Set loading state for segmentation masks

    if (!projectId) {
      setDecodedMasks(null);
      setSegmentationError("Project ID is missing.");
      return;
    }

    // Fetch segmentation masks for the project
    segmentationApi
      .getSegmentationResults(projectId)
      .then((response) => {
        // Handle segmentation masks (todo: decode them)
        setDecodedMasks(response.masks);
        console.log("Segmentation masks fetched:", response.masks);
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
  }, [projectData, projectId]);

  // Missing projectId handling (to do)
  if (!projectId) return <NoProjectFound message="Project ID is missing." />;
  // Loading state (to do)
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;
  // Error states (project, masks, jobs)
  if (error) return <ErrorProject error={error} />;
  if (segmentationError) return <ErrorProject error={segmentationError} />;

  if (projectData) console.log(projectData.projectId);
  return projectData ? <ShowProjectData project={projectData} /> : null;
}
