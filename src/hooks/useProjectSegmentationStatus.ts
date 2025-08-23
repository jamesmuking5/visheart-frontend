"use client";

import { useState, useEffect, useCallback } from "react";
import { segmentationApi } from "@/lib/api";
import { Project } from "@/types/dashboard";

export interface ProjectSegmentationStatus {
  projectId: string;
  hasMasks: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to efficiently check segmentation status for multiple projects
 * Uses lightweight API calls to determine if projects have segmentation masks
 */
export function useProjectSegmentationStatus(projects: Project[]) {
  const [statuses, setStatuses] = useState<Record<string, ProjectSegmentationStatus>>({});
  
  const checkProjectSegmentation = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const response = await segmentationApi.getSegmentationResults(projectId);
      // If response is successful and has segmentations, it has masks
      return response.success && Array.isArray(response.segmentations) && response.segmentations.length > 0;
    } catch (error) {
      console.error(`Error checking segmentation for project ${projectId}:`, error);
      return false;
    }
  }, []);

  const checkAllProjects = useCallback(async () => {
    if (!projects || projects.length === 0) return;

    // Initialize loading states
    const initialStatuses: Record<string, ProjectSegmentationStatus> = {};
    projects.forEach(project => {
      initialStatuses[project.projectId] = {
        projectId: project.projectId,
        hasMasks: false,
        loading: true,
        error: null,
      };
    });
    setStatuses(initialStatuses);

    // Check each project's segmentation status
    const checkPromises = projects.map(async (project) => {
      try {
        const hasMasks = await checkProjectSegmentation(project.projectId);
        return {
          projectId: project.projectId,
          hasMasks,
          loading: false,
          error: null,
        };
      } catch (error) {
        return {
          projectId: project.projectId,
          hasMasks: false,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to check segmentation status",
        };
      }
    });

    // Wait for all checks to complete and update statuses
    const results = await Promise.all(checkPromises);
    
    const updatedStatuses: Record<string, ProjectSegmentationStatus> = {};
    results.forEach(result => {
      updatedStatuses[result.projectId] = result;
    });
    
    setStatuses(updatedStatuses);
  }, [projects, checkProjectSegmentation]);

  useEffect(() => {
    checkAllProjects();
  }, [checkAllProjects]);

  return {
    statuses,
    refresh: checkAllProjects,
    isLoading: Object.values(statuses).some(status => status.loading),
  };
}

/**
 * Simplified hook for checking a single project's segmentation status
 */
export function useProjectSegmentationStatusSingle(projectId: string | null) {
  const [status, setStatus] = useState<ProjectSegmentationStatus>({
    projectId: projectId || "",
    hasMasks: false,
    loading: !!projectId,
    error: null,
  });

  const checkSegmentation = useCallback(async (id: string) => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await segmentationApi.getSegmentationResults(id);
      const hasMasks = response.success && Array.isArray(response.segmentations) && response.segmentations.length > 0;
      
      setStatus({
        projectId: id,
        hasMasks,
        loading: false,
        error: null,
      });
    } catch (error) {
      setStatus({
        projectId: id,
        hasMasks: false,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to check segmentation status",
      });
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      checkSegmentation(projectId);
    }
  }, [projectId, checkSegmentation]);

  return {
    ...status,
    refresh: () => projectId && checkSegmentation(projectId),
  };
}
