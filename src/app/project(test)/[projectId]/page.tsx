"use client";

// Core React and Next.js imports
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

// Custom components
import { NoProjectFound } from "@/components/project(test)/noProjectFound";

// Custom utilities
import { projectApi } from "@/lib/api";

// Type definitions
import * as ProjectTypes from "@/types/project(test)";
import { set } from "react-hook-form";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] =
    useState<ProjectTypes.ProjectData | null>(null); // Project data as fetched from the API

  // 1. Fetch project data from backend
  useEffect(() => {
    if (!projectId) {
      return;
    }

    setLoading(true);
    projectApi
      .getProjectInfo(projectId)
      .then((project) => {
        // Handle project data
        setProjectData(project);
      })
      .catch((error: unknown) => {
        setError("Failed to fetch project data.");
        console.error("Error fetching project:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  // Missing projectId handling
  if (!projectId) return <NoProjectFound error="Project ID is missing." />;
  // Loading state
  if (loading) return <div>Loading...</div>;
  // Error state
  if (error) return <NoProjectFound error={error} />;

  return (
    <div> Project ID: {projectData ? projectData.projectId : projectId}</div>
  );
}
