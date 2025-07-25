"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projectApi, segmentationApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Play, Scissors, Heart, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
}

export default function ProjectSegmentationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingSegmentation, setIsStartingSegmentation] = useState(false);
  const [segmentationStatus, setSegmentationStatus] = useState<string | null>(null);

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

  const handleStartAISegmentation = async () => {
    if (!projectId) return;

    try {
      setIsStartingSegmentation(true);
      setSegmentationStatus(null);
      
      const response = await segmentationApi.startSegmentation(projectId);
      
      if (response.uuid) {
        setSegmentationStatus(`AI Segmentation started successfully! Job ID: ${response.uuid}`);
        // You might want to redirect to results page or show job status
        setTimeout(() => {
          router.push(`/project/${projectId}/results`);
        }, 2000);
      } else {
        setSegmentationStatus('Failed to start AI segmentation');
      }
    } catch (err: unknown) {
      console.error('Error starting segmentation:', err);
      let errorMessage = 'Failed to start segmentation';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      setSegmentationStatus(errorMessage);
    } finally {
      setIsStartingSegmentation(false);
    }
  };

  const handleStartManualSegmentation = () => {
    // Navigate to the existing cardiac segmentation tool or create a new one
    router.push('/cardiac-segmentation');
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
                onClick={() => router.push(`/project/${projectId}`)}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Segmentation</h1>
            </div>
            <p className="text-muted-foreground">
              {project.name} • Project ID: {projectId}
            </p>
          </div>
          {project.isSaved && (
            <Badge variant="secondary">Saved</Badge>
          )}
        </div>

        {/* Status Alert */}
        {segmentationStatus && (
          <Alert className={segmentationStatus.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {segmentationStatus.includes('successfully') ? (
              <Heart className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={segmentationStatus.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
              {segmentationStatus}
            </AlertDescription>
          </Alert>
        )}

        {/* Segmentation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Segmentation Card */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">AI Segmentation</CardTitle>
              <CardDescription>
                Automatically segment the cardiac structures using our AI model (YOLO + MedSAM)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Fully automated process</p>
                <p>✓ Fast and accurate results</p>
                <p>✓ No manual input required</p>
                <p>✓ Perfect for initial analysis</p>
              </div>
              <Button 
                onClick={handleStartAISegmentation}
                disabled={isStartingSegmentation}
                className="w-full"
                size="lg"
              >
                {isStartingSegmentation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting AI Segmentation...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start AI Segmentation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Segmentation Card */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Scissors className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Manual Segmentation</CardTitle>
              <CardDescription>
                Manually segment regions with interactive tools for precise control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Full control over segmentation</p>
                <p>✓ Interactive brush and eraser tools</p>
                <p>✓ Perfect for refinement</p>
                <p>✓ Can edit AI results</p>
              </div>
              <Button 
                onClick={handleStartManualSegmentation}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Scissors className="mr-2 h-4 w-4" />
                Start Manual Segmentation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Project Info Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-muted-foreground">File Type</h4>
                <p className="font-mono">{project.filetype.toUpperCase()}</p>
              </div>
              {project.dimensions && (
                <div>
                  <h4 className="font-medium text-muted-foreground">Dimensions</h4>
                  <p className="font-mono">
                    {project.dimensions.width} × {project.dimensions.height} × {project.dimensions.depth}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-muted-foreground">File Size</h4>
                <p className="font-mono">
                  {(project.filesize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
