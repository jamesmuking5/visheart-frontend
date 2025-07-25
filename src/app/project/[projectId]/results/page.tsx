"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projectApi, segmentationApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Download, Eye, Heart, RefreshCw } from 'lucide-react';

interface ProjectInfo {
  projectId: string;
  name: string;
  description: string;
  isSaved: boolean;
}

interface SegmentationResult {
  _id: string;
  name: string;
  description: string;
  isSaved: boolean;
  isMedSAMOutput: boolean;
  segmentationmaskRLE: boolean;
  frames: Array<{
    frameindex: number;
    frameinferred: boolean;
    slices: Array<{
      sliceindex: number;
      componentboundingboxes: Array<{
        class: string;
        confidence: number;
        x_min: number;
        y_min: number;
        x_max: number;
        y_max: number;
      }>;
      segmentationmasks: Array<{
        class: string;
        segmentationmaskcontents: string;
      }>;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectResultsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [segmentationResults, setSegmentationResults] = useState<SegmentationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch project info and segmentation results in parallel
      const [projectResponse, segmentationResponse] = await Promise.all([
        projectApi.getProjectInfo(projectId),
        segmentationApi.getSegmentationResults(projectId)
      ]);
      
      if (projectResponse.success && projectResponse.project) {
        setProject(projectResponse.project);
      } else {
        setError(projectResponse.message || 'Project not found');
        return;
      }

      if (segmentationResponse.segmentations) {
        setSegmentationResults(segmentationResponse.segmentations);
      } else {
        setSegmentationResults([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      let errorMessage = 'Failed to load project data';
      
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

  useEffect(() => {
    const fetchDataEffect = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch project info and segmentation results in parallel
        const [projectResponse, segmentationResponse] = await Promise.all([
          projectApi.getProjectInfo(projectId),
          segmentationApi.getSegmentationResults(projectId)
        ]);
        
        if (projectResponse.success && projectResponse.project) {
          setProject(projectResponse.project);
        } else {
          setError(projectResponse.message || 'Project not found');
          return;
        }

        if (segmentationResponse.segmentations) {
          setSegmentationResults(segmentationResponse.segmentations);
        } else {
          setSegmentationResults([]);
        }
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        let errorMessage = 'Failed to load project data';
        
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

    fetchDataEffect();
  }, [projectId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleExportResults = () => {
    router.push(`/project/${projectId}/export`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSegmentationStats = (result: SegmentationResult) => {
    const totalFrames = result.frames.length;
    const totalSlices = result.frames.reduce((sum, frame) => sum + frame.slices.length, 0);
    const totalMasks = result.frames.reduce((sum, frame) => 
      sum + frame.slices.reduce((sliceSum, slice) => sliceSum + slice.segmentationmasks.length, 0), 0
    );
    
    return { totalFrames, totalSlices, totalMasks };
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading results...</p>
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
              Failed to Load Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'The requested project could not be found.'}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
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
              <h1 className="text-3xl font-bold">Results</h1>
            </div>
            <p className="text-muted-foreground">
              {project.name} • Project ID: {projectId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            {segmentationResults.length > 0 && (
              <Button onClick={handleExportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {segmentationResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/20">
              <Eye className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-semibold">No Results Yet</h3>
              <p className="text-muted-foreground">
                No segmentation results found for this project. Start a segmentation to see results here.
              </p>
            </div>
            <Button 
              className="mt-4"
              onClick={() => router.push(`/project/${projectId}/segmentation`)}
            >
              Start Segmentation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {segmentationResults.map((result) => {
              const stats = getSegmentationStats(result);
              
              return (
                <Card key={result._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{result.name}</CardTitle>
                          <div className="flex gap-1">
                            {result.isSaved && (
                              <Badge variant="secondary">Saved</Badge>
                            )}
                            <Badge variant={result.isMedSAMOutput ? "default" : "outline"}>
                              {result.isMedSAMOutput ? "AI Generated" : "Manual/Edited"}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{result.description}</CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Created: {formatDate(result.createdAt)}</p>
                        {result.updatedAt !== result.createdAt && (
                          <p>Updated: {formatDate(result.updatedAt)}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-muted-foreground">Frames</h4>
                        <p className="font-mono text-lg">{stats.totalFrames}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground">Slices</h4>
                        <p className="font-mono text-lg">{stats.totalSlices}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground">Masks</h4>
                        <p className="font-mono text-lg">{stats.totalMasks}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground">Format</h4>
                        <p className="font-mono">{result.segmentationmaskRLE ? "RLE" : "Binary"}</p>
                      </div>
                    </div>
                    
                    {/* Preview first few masks */}
                    {result.frames.length > 0 && result.frames[0].slices.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          Detected Classes (Frame 1, Slice 1):
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {result.frames[0].slices[0].segmentationmasks.map((mask, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {mask.class}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
