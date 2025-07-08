"use client";

import { useState, useEffect, useCallback } from "react";
import { projectApi, segmentationApi, adminApi, statusApi } from "@/lib/api";
import { Project, Job, SystemStats, UserStats } from "@/types/dashboard";

export function useGpuStatus() {
  const [gpuStatus, setGpuStatus] = useState<"online" | "offline" | "unknown">(
    "unknown",
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchGpuStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await statusApi.getGpuStatus();
      // Handle the new response format from GPU status route
      setGpuStatus(response.status === "online" ? "online" : "offline");
    } catch (error) {
      console.error("Error fetching GPU status:", error);
      setGpuStatus("offline");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGpuStatus();
  }, [fetchGpuStatus]);

  return { gpuStatus, isLoading, refresh: fetchGpuStatus };
}

export function useUserProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await projectApi.getProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, refresh: fetchProjects };
}

export function useUserJobs() {
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await segmentationApi.getUserJobs();
      setRecentJobs(response.jobs?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setRecentJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { recentJobs, isLoading, refresh: fetchJobs };
}

export function useSystemStats(isAdmin: boolean) {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemStats = useCallback(async () => {
    if (!isAdmin) {
      setSystemStats(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await adminApi.getAllJobsStatus();
      // Assuming you have other endpoints for totalUsers and totalProjects
      setSystemStats({
        totalUsers: 0,
        totalProjects: 0,
        pendingJobs: response.stats.pending,
        completedJobs: response.stats.completed,
        failedJobs: response.stats.failed,
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
      setSystemStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchSystemStats();
  }, [fetchSystemStats]);

  return { systemStats, isLoading, refresh: fetchSystemStats };
}

export function useUserStats(projects: Project[], recentJobs: Job[]) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (projects.length > 0 || recentJobs.length > 0) {
      const completedSegmentations = recentJobs.filter(
        (job) => job.status === "completed",
      ).length;
      const pendingJobsCount = recentJobs.filter(
        (job) => job.status === "pending",
      ).length;
      const totalFileSize = projects.reduce(
        (sum, project) => sum + project.filesize,
        0,
      );

      setUserStats({
        projectCount: projects.length,
        totalFileSize,
        completedSegmentations,
        pendingJobs: pendingJobsCount,
      });
    }
  }, [projects, recentJobs]);

  return userStats;
}
