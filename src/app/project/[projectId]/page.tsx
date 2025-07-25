"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, Download, Scissors, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProjectInfo {
  projectId: string;
  name: string;
  description: string;
  isSaved: boolean;
  filesize: number;
  filetype: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  voxelsize?: {
    x: number;
    y: number;
    z: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectApi.getProjectInfo(projectId);
        
        if (response.success && response.project) {
          setProject(response.project);
        } else {
          setError(response.message || 'Project not found');
        }
      } catch (err: unknown) {
        console.error('Error fetching project:', err);
        let errorMessage = 'Failed to load project';
        
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosError = err as { response?: { data?: { message?: string } } };
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Project Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'The requested project could not be found.'}
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["user", "admin", "guest"]}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.isSaved && (
                <Badge variant="secondary">Saved</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Project ID: {projectId}
            </p>
          </div>
        </div>

        {/* Project Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">File Type</h4>
                <p className="font-mono text-sm">{project.filetype.toUpperCase()}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">File Size</h4>
                <p className="font-mono text-sm">{formatFileSize(project.filesize)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                <p className="text-sm">{formatDate(project.createdAt)}</p>
              </div>
              {project.dimensions && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Dimensions</h4>
                  <p className="font-mono text-sm">
                    {project.dimensions.width} × {project.dimensions.height} × {project.dimensions.depth}
                  </p>
                </div>
              )}
              {project.voxelsize && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Voxel Size</h4>
                  <p className="font-mono text-sm">
                    {project.voxelsize.x} × {project.voxelsize.y} × {project.voxelsize.z}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                <p className="text-sm">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Segmentation Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href={`/project/${projectId}/segmentation`}>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Scissors className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Segmentation</CardTitle>
                <CardDescription>
                  Start AI or manual segmentation on this project
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          {/* Results Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href={`/project/${projectId}/results`}>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Results</CardTitle>
                <CardDescription>
                  View and manage segmentation results
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          {/* Export Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href={`/project/${projectId}/export`}>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Export</CardTitle>
                <CardDescription>
                  Export segmentation data in various formats
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
