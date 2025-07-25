"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Download, Heart, FileText, Database } from 'lucide-react';

interface ProjectInfo {
  projectId: string;
  name: string;
  description: string;
  isSaved: boolean;
}

export default function ProjectExportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

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

  const handleExportNifti = async () => {
    if (!projectId) return;

    try {
      setIsExporting(true);
      setExportStatus('Preparing NIfTI export...');

      // Call the export API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/segmentation/export-project-data/${projectId}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.exportPackageUrl) {
          setExportStatus('Export ready! Starting download...');
          
          // Create a temporary link to download the file
          const link = document.createElement('a');
          link.href = data.exportPackageUrl;
          link.download = `${project?.name || 'project'}_segmentation.tar.gz`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setExportStatus('Download started successfully!');
        } else {
          setExportStatus('Export failed: ' + (data.message || 'Unknown error'));
        }
      } else {
        const errorData = await response.json();
        setExportStatus('Export failed: ' + (errorData.message || 'Server error'));
      }
    } catch (err: unknown) {
      console.error('Error exporting:', err);
      setExportStatus('Export failed: Network error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!projectId) return;

    try {
      setIsExporting(true);
      setExportStatus('Preparing JSON export...');

      // This would be a different endpoint or parameter for JSON export
      // For now, we'll simulate it
      setExportStatus('JSON export is not yet implemented');
    } catch (err: unknown) {
      console.error('Error exporting JSON:', err);
      setExportStatus('JSON export failed');
    } finally {
      setIsExporting(false);
    }
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
              <h1 className="text-3xl font-bold">Export</h1>
            </div>
            <p className="text-muted-foreground">
              {project.name} • Project ID: {projectId}
            </p>
          </div>
        </div>

        {/* Export Status */}
        {exportStatus && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {isExporting && <Loader2 className="h-4 w-4 animate-spin" />}
                <p className={`text-sm ${exportStatus.includes('failed') ? 'text-red-600' : exportStatus.includes('success') ? 'text-green-600' : 'text-blue-600'}`}>
                  {exportStatus}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NIfTI Export Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">NIfTI Export</CardTitle>
              <CardDescription>
                Export segmentation results as NIfTI files for medical imaging software
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Industry standard medical format</p>
                <p>✓ Compatible with ITK-SNAP, 3D Slicer</p>
                <p>✓ Preserves spatial information</p>
                <p>✓ Includes all segmentation masks</p>
              </div>
              <Button 
                onClick={handleExportNifti}
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export as NIfTI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* JSON Export Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">JSON Export</CardTitle>
              <CardDescription>
                Export raw segmentation data as JSON for custom processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Machine-readable format</p>
                <p>✓ Includes all metadata</p>
                <p>✓ Perfect for custom analysis</p>
                <p>✓ RLE-encoded masks</p>
              </div>
              <Button 
                onClick={handleExportJSON}
                disabled={isExporting}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as JSON
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Export Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <h4 className="font-medium">What&apos;s included in exports:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Original project metadata and dimensions</li>
                <li>All segmentation masks (AI and manual)</li>
                <li>Bounding box coordinates for detected regions</li>
                <li>Class labels and confidence scores</li>
                <li>Frame and slice information</li>
              </ul>
            </div>
            
            <div className="text-sm space-y-2">
              <h4 className="font-medium">File formats:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>NIfTI (.nii.gz):</strong> Compressed NIfTI format with all masks combined</li>
                <li><strong>JSON (.json):</strong> Raw data structure with RLE-encoded masks</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
