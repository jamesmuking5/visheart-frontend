"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import {
  useGpuStatus,
  useUserProjects,
  useUserJobs,
  useUserStats,
} from "@/lib/dashboard-hooks";
import { ShowForUser, ShowForGuest } from "@/components/RoleGuard";
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
  AlertCircle,
  Brain,
  Download,
  FolderOpen,
  Heart,
  Upload,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Cpu,
  User,
  UserCheck,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { projectApi, segmentationApi } from "@/lib/api";

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to get status icon and color
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

// Helper function to get role icon
const getRoleIcon = (role: string | undefined) => {
  switch (role) {
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

export default function DashboardPage() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const {
    projects,
    isLoading: projectsLoading,
    refresh: refreshProjects,
  } = useUserProjects();
  const {
    recentJobs,
    isLoading: jobsLoading,
    refresh: refreshJobs,
  } = useUserJobs();
  const {
    gpuStatus,
    isLoading: gpuLoading,
    refresh: refreshGpuStatus,
  } = useGpuStatus();
  const userStats = useUserStats(projects, recentJobs);

  const isLoadingData = projectsLoading || jobsLoading || gpuLoading;

  const refreshDashboard = async () => {
    if (user) {
      await Promise.all([refreshProjects(), refreshJobs(), refreshGpuStatus()]);
    }
  };

  // Handle project actions
  const handleStartSegmentation = async (projectId: string) => {
    try {
      const response = await segmentationApi.startSegmentation(projectId);
      console.log("Segmentation started:", response);
      await refreshJobs();
    } catch (error) {
      console.error("Error starting segmentation:", error);
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
      await refreshProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error: {authError}</AlertDescription>
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
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tight">
              VisHeart Dashboard
            </h1>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            {getRoleIcon(user.role)}
            <span>
              Welcome back,{" "}
              {user.role === "guest" ? "Guest User" : user.username}.
            </span>
            <Badge variant="outline" className="ml-2">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
        </div>

        {/* GPU Status Indicator */}
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDashboard}
            disabled={isLoadingData}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <div className="flex items-center gap-2">
            {/* GPU Status Indicator: Green=Online, Yellow=Checking, Red=Offline/Timeout */}
            <div
              className={`h-3 w-3 rounded-full ${
                gpuStatus === "online"
                  ? "bg-green-500"
                  : gpuStatus === "offline"
                    ? "bg-red-500"
                    : gpuStatus === "timeout"
                      ? "bg-red-500"
                      : "bg-yellow-500"
              }`}
            />
            <span className="text-muted-foreground text-sm">
              {gpuLoading
                ? "GPU Checking..."
                : `GPU ${
                    gpuStatus === "unknown"
                      ? "Unknown"
                      : gpuStatus === "timeout"
                        ? "Timeout"
                        : gpuStatus === "online"
                          ? "Online"
                          : "Offline"
                  }`}
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
              className="ml-2 h-auto p-0 text-orange-800 underline"
            >
              Upgrade to full account
            </Button>
          </AlertDescription>
        </Alert>
      </ShowForGuest>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <FolderOpen className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.projectCount || 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(userStats?.totalFileSize || 0)} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Brain className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.completedSegmentations || 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  Segmentations done
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Jobs
                </CardTitle>
                <Clock className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.pendingJobs || 0}
                </div>
                <p className="text-muted-foreground text-xs">In queue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  GPU Status
                </CardTitle>
                <Cpu className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    gpuStatus === "online"
                      ? "text-green-600"
                      : gpuStatus === "timeout"
                        ? "text-red-600"
                        : gpuStatus === "offline"
                          ? "text-red-600"
                          : "text-yellow-600"
                  }`}
                >
                  {gpuStatus === "timeout"
                    ? "Timeout"
                    : gpuStatus.charAt(0).toUpperCase() + gpuStatus.slice(1)}
                </div>
                <p className="text-muted-foreground text-xs">
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
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <ShowForUser fallback={null}>
                <Link href="/upload">
                  <Button className="w-full justify-start">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Project
                  </Button>
                </Link>
              </ShowForUser>

              <ShowForUser fallback={null}>
                <Link href="/projects">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="mr-2 h-4 w-4" />
                    Start Segmentation
                  </Button>
                </Link>
              </ShowForUser>

              <ShowForUser fallback={null}>
                <Link href="/results">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Results
                  </Button>
                </Link>
              </ShowForUser>

              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>

              <ShowForUser fallback={null}>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </ShowForUser>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest uploaded projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.projectId}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{project.name}</p>
                        <p className="text-muted-foreground text-xs">
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
                  <p className="text-muted-foreground py-4 text-center text-sm">
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
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-1 ${statusDisplay.bg}`}>
                          <StatusIcon
                            className={`h-3 w-3 ${statusDisplay.color}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Job {job.jobId.slice(-8)}
                          </p>
                          <p className="text-muted-foreground text-xs">
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
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No segmentation jobs yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Projects</h2>
              <p className="text-muted-foreground">
                Manage your cardiac imaging projects
              </p>
            </div>
            <ShowForUser fallback={null}>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Project
              </Button>
            </ShowForUser>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      <span
                        className="text-muted-foreground"
                        title="In the representation of width * height * slices * frames"
                      >
                        Dimensions:
                      </span>
                      <p className="font-medium">
                        {(() => {
                          let dimensionStringRepresentation = `${project.dimensions.width}x${project.dimensions.height}`;
                          if (project.dimensions.slices)
                            dimensionStringRepresentation += `x${project.dimensions.slices}`;
                          if (project.dimensions.frames)
                            dimensionStringRepresentation += `x${project.dimensions.frames}`;
                          return dimensionStringRepresentation;
                        })()}
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
                      <Play className="mr-1 h-3 w-3" />
                      Segment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleExportProject(project.projectId)}
                    >
                      <Download className="mr-1 h-3 w-3" />
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

          {/* Segmentation Jobs Display */}
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Segmentation Jobs</CardTitle>
                <CardDescription>
                  Track your ongoing segmentation tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentJobs
                  .filter(
                    (job) =>
                      job.status === "processing" || job.status === "pending",
                  )
                  .map((job) => {
                    const statusDisplay = getStatusDisplay(job.status);
                    const StatusIcon = statusDisplay.icon;

                    return (
                      <div
                        key={job.jobId}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-2 ${statusDisplay.bg}`}
                          >
                            <StatusIcon
                              className={`h-4 w-4 ${statusDisplay.color}`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Job {job.jobId.slice(-8)}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {job.message}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={statusDisplay.color}
                        >
                          {job.status}
                        </Badge>
                      </div>
                    );
                  })}
                {recentJobs.filter(
                  (job) =>
                    job.status === "processing" || job.status === "pending",
                ).length === 0 && (
                  <div className="py-8 text-center">
                    <Brain className="text-muted-foreground/50 mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No Active Jobs
                    </h3>
                    <p className="text-muted-foreground">
                      Start a segmentation task from your projects to see active
                      jobs here.
                    </p>
                    <ShowForUser fallback={null}>
                      <Link href="/projects">
                        <Button className="mt-4">
                          <Brain className="mr-2 h-4 w-4" />
                          Start Segmentation
                        </Button>
                      </Link>
                    </ShowForUser>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Jobs History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
                <CardDescription>
                  Your completed segmentation tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentJobs
                  .filter((job) => job.status === "completed")
                  .slice(0, 3)
                  .map((job) => {
                    const statusDisplay = getStatusDisplay(job.status);
                    const StatusIcon = statusDisplay.icon;

                    return (
                      <div
                        key={job.jobId}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-2 ${statusDisplay.bg}`}
                          >
                            <StatusIcon
                              className={`h-4 w-4 ${statusDisplay.color}`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Job {job.jobId.slice(-8)}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {job.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={statusDisplay.color}
                          >
                            {job.status}
                          </Badge>
                          <ShowForUser fallback={null}>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </ShowForUser>
                        </div>
                      </div>
                    );
                  })}
                {recentJobs.filter((job) => job.status === "completed")
                  .length === 0 && (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No completed segmentations yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
