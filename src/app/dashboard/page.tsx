"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  ShowForUser,
  ShowForAdmin,
  ShowForGuest,
} from "@/components/RoleGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  Download,
  FolderOpen,
  Heart,
  BarChart3,
  Users,
  Settings,
  Shield,
  Upload,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Database,
  Cpu,
  HardDrive,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { projectApi, segmentationApi, adminApi, statusApi } from "@/lib/api";

interface Project {
  projectId: string;
  name: string;
  description: string;
  isSaved: boolean;
  filesize: number;
  filetype: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Job {
  jobId: string;
  projectId: string;
  status: string;
  message: string;
  createdAt: string;
}

interface UserStats {
  projectCount: number;
  totalFileSize: number;
  completedSegmentations: number;
  pendingJobs: number;
}

interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  pendingJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export default function DashboardPage() {
  const { user, loading, error } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [gpuStatus, setGpuStatus] = useState<"online" | "offline" | "unknown">(
    "unknown"
  );

  // Fetch user projects
  const fetchProjects = async () => {
    try {
      const response = await projectApi.getProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Fetch user jobs
  const fetchJobs = async () => {
    try {
      const response = await segmentationApi.getUserJobs();
      setRecentJobs(response.jobs?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  // Fetch GPU status
  const fetchGpuStatus = async () => {
    try {
      const response = await statusApi.getGpuStatus();
      setGpuStatus(response.status === "online" ? "online" : "offline");
    } catch (error) {
      setGpuStatus("offline");
    }
  };

  // Fetch system stats (admin only)
  const fetchSystemStats = async () => {
    try {
      const response = await adminApi.getAllJobsStatus();
      setSystemStats({
        totalUsers: 0, // You may need to add this endpoint
        totalProjects: 0, // You may need to add this endpoint
        pendingJobs: response.stats.pending,
        completedJobs: response.stats.completed,
        failedJobs: response.stats.failed,
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
    }
  };

  // Calculate user stats
  useEffect(() => {
    if (projects.length > 0 || recentJobs.length > 0) {
      const completedSegmentations = recentJobs.filter(
        (job) => job.status === "completed"
      ).length;
      const pendingJobsCount = recentJobs.filter(
        (job) => job.status === "pending"
      ).length;
      const totalFileSize = projects.reduce(
        (sum, project) => sum + project.filesize,
        0
      );

      setUserStats({
        projectCount: projects.length,
        totalFileSize,
        completedSegmentations,
        pendingJobs: pendingJobsCount,
      });
    }
  }, [projects, recentJobs]);

  // Handle project actions
  const handleStartSegmentation = async (projectId: string) => {
    try {
      setIsLoadingData(true);
      const response = await segmentationApi.startSegmentation(projectId);
      console.log("Segmentation started:", response);
      // Refresh jobs after starting segmentation
      await fetchJobs();
    } catch (error) {
      console.error("Error starting segmentation:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExportProject = async (projectId: string) => {
    try {
      const blob = await segmentationApi.exportProjectData(projectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${projectId}-export.nii.gz`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting project:", error);
    }
  };

  const handleSaveProject = async (projectId: string, isSaved: boolean) => {
    try {
      await projectApi.saveProject(projectId, isSaved);
      // Refresh projects after saving
      await fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  // Refresh all data
  const refreshDashboard = async () => {
    if (user) {
      setIsLoadingData(true);
      await Promise.all([fetchProjects(), fetchJobs(), fetchGpuStatus()]);

      if (user.role === "admin") {
        await fetchSystemStats();
      }

      setIsLoadingData(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoadingData(true);
        await Promise.all([fetchProjects(), fetchJobs(), fetchGpuStatus()]);

        if (user.role === "admin") {
          await fetchSystemStats();
        }

        setIsLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
        };
      case "pending":
        return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" };
      case "processing":
      case "in_progress":
        return { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-100" };
      case "failed":
        return { icon: XCircle, color: "text-red-600", bg: "bg-red-100" };
      default:
        return { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  // Get role icon
  const getRoleIcon = () => {
    switch (user?.role) {
      case "admin":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "user":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "guest":
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tight">
              VisHeart Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {getRoleIcon()}
            <span>Welcome back, {user.username}</span>
            <Badge variant="outline" className="ml-2">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
        </div>

        {/* GPU Status Indicator */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDashboard}
            disabled={isLoadingData}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoadingData ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                gpuStatus === "online"
                  ? "bg-green-500"
                  : gpuStatus === "offline"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              GPU {gpuStatus === "unknown" ? "Checking..." : gpuStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Guest Mode Alert */}
      <ShowForGuest fallback={null}>
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You're in guest mode. Your projects and work won't be permanently
            saved.
            <Button
              variant="link"
              className="p-0 ml-2 h-auto text-orange-800 underline"
            >
              Upgrade to full account
            </Button>
          </AlertDescription>
        </Alert>
      </ShowForGuest>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
          <ShowForAdmin
            fallback={
              <TabsTrigger value="admin" disabled>
                Admin
              </TabsTrigger>
            }
          >
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </ShowForAdmin>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.projectCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(userStats?.totalFileSize || 0)} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.completedSegmentations || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Segmentations done
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Jobs
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.pendingJobs || 0}
                </div>
                <p className="text-xs text-muted-foreground">In queue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  GPU Status
                </CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    gpuStatus === "online" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {gpuStatus.charAt(0).toUpperCase() + gpuStatus.slice(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processing server
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              <ShowForUser fallback={null}>
                <Link href="/upload">
                  <Button className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Project
                  </Button>
                </Link>
              </ShowForUser>

              <ShowForUser fallback={null}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to projects tab
                    const tabsElement = document.querySelector(
                      '[data-state="active"][value="projects"]'
                    );
                    if (tabsElement) {
                      (tabsElement as HTMLElement).click();
                    }
                  }}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Segmentation
                </Button>
              </ShowForUser>

              <ShowForUser fallback={null}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to segmentation tab
                    const tabsElement = document.querySelector(
                      '[data-state="active"][value="segmentation"]'
                    );
                    if (tabsElement) {
                      (tabsElement as HTMLElement).click();
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </ShowForUser>

              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest uploaded projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.projectId}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(project.filesize)} •{" "}
                          {project.filetype}
                        </p>
                      </div>
                    </div>
                    <Badge variant={project.isSaved ? "default" : "secondary"}>
                      {project.isSaved ? "Saved" : "Temp"}
                    </Badge>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No projects yet. Upload your first project to get started.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Latest segmentation tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentJobs.map((job) => {
                  const statusDisplay = getStatusDisplay(job.status);
                  const StatusIcon = statusDisplay.icon;

                  return (
                    <div
                      key={job.jobId}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${statusDisplay.bg}`}>
                          <StatusIcon
                            className={`h-3 w-3 ${statusDisplay.color}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Job {job.jobId.slice(-8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {job.message}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusDisplay.color}>
                        {job.status}
                      </Badge>
                    </div>
                  );
                })}
                {recentJobs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No segmentation jobs yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Projects</h2>
              <p className="text-muted-foreground">
                Manage your cardiac imaging projects
              </p>
            </div>
            <ShowForUser fallback={null}>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Project
              </Button>
            </ShowForUser>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.projectId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <ShowForUser
                      fallback={
                        <Badge
                          variant={project.isSaved ? "default" : "secondary"}
                        >
                          {project.isSaved ? "Saved" : "Temp"}
                        </Badge>
                      }
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleSaveProject(project.projectId, !project.isSaved)
                        }
                        className="h-auto p-1"
                      >
                        <Badge
                          variant={project.isSaved ? "default" : "secondary"}
                          className="cursor-pointer hover:opacity-80"
                        >
                          {project.isSaved ? "Saved" : "Temp"}
                        </Badge>
                      </Button>
                    </ShowForUser>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <p className="font-medium">
                        {formatFileSize(project.filesize)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{project.filetype}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dimensions:</span>
                      <p className="font-medium">
                        {project.dimensions.width}x{project.dimensions.height}x
                        {project.dimensions.depth}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStartSegmentation(project.projectId)}
                      disabled={isLoadingData}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Segment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleExportProject(project.projectId)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Segmentation Tab */}
        <TabsContent value="segmentation" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">AI Segmentation</h2>
            <p className="text-muted-foreground">
              Manage your cardiac segmentation tasks
            </p>
          </div>

          {/* Segmentation content would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Segmentation Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Segmentation management interface coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        <ShowForAdmin fallback={null}>
          <TabsContent value="admin" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">System Administration</h2>
              <p className="text-muted-foreground">
                Monitor and manage the VisHeart system
              </p>
            </div>

            {/* System Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStats?.totalUsers || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    System Projects
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStats?.totalProjects || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Jobs
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStats?.pendingJobs || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Failed Jobs
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {systemStats?.failedJobs || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
                <CardDescription>
                  Administrative tools and controls
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  System Projects
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Job Queue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </ShowForAdmin>
      </Tabs>
    </div>
  );
}
