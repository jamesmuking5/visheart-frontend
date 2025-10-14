"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Box, Download, RefreshCw, AlertCircle, CheckCircle, XCircle, Database } from "lucide-react";

export function ReconstructionDebugCard() {
  const {
    hasReconstructions,
    reconstructionMetadata,
    reconstructionCacheReady,
    reconstructionCacheError,
    getReconstructionGLB,
    preloadReconstructionModels,
    clearReconstructionCache,
    refreshReconstructions
  } = useProject();

  const [selectedFrame, setSelectedFrame] = useState(0);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load first frame on mount
  useEffect(() => {
    if (hasReconstructions && reconstructionCacheReady && selectedFrame === 0) {
      loadModel(0);
    }
  }, [hasReconstructions, reconstructionCacheReady]);

  const loadModel = async (frame: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = await getReconstructionGLB(frame);
      if (url) {
        setModelUrl(url);
        setSelectedFrame(frame);
        console.log(`[Debug] Loaded GLB for frame ${frame}:`, url);
      } else {
        setError(`Failed to load GLB for frame ${frame}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreload = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await preloadReconstructionModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preload models");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await clearReconstructionCache();
      setModelUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear cache");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await refreshReconstructions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasReconstructions) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Reconstruction Debug (No Models)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-lg bg-muted/50 flex items-center justify-center">
              <Box className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">No 4D Reconstruction</h3>
              <p className="text-sm text-muted-foreground">Create a reconstruction to see debug info</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-amber-600" />
            <span className="text-amber-900 dark:text-amber-100">Reconstruction Debug</span>
            <Badge variant="outline" className="ml-2 border-amber-500 text-amber-700">
              TEMPORARY
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Row */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
          <div className="flex items-center gap-2">
            {reconstructionCacheReady ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : reconstructionCacheError ? (
              <XCircle className="h-4 w-4 text-red-600" />
            ) : (
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            )}
            <span className="text-sm font-medium">
              Cache Status: {reconstructionCacheReady ? "Ready" : reconstructionCacheError ? "Error" : "Loading..."}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePreload} disabled={isLoading || reconstructionCacheReady}>
              <Download className="h-3 w-3 mr-1" />
              Preload
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearCache} disabled={isLoading}>
              <Database className="h-3 w-3 mr-1" />
              Clear Cache
            </Button>
          </div>
        </div>

        {/* Metadata */}
        {reconstructionMetadata && (
          <div className="p-3 rounded-lg bg-background/50 space-y-2">
            <h4 className="font-semibold text-sm">Metadata:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <p className="truncate">{reconstructionMetadata.reconstructionId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="truncate">{reconstructionMetadata.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Format:</span>
                <p>{reconstructionMetadata.meshFormat || "GLB"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">File Size:</span>
                <p>{reconstructionMetadata.meshFileSize ? `${(reconstructionMetadata.meshFileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Has Download URL:</span>
                <p>{reconstructionMetadata.downloadUrl ? " Yes" : " No"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p>{new Date(reconstructionMetadata.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(error || reconstructionCacheError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || reconstructionCacheError}</AlertDescription>
          </Alert>
        )}

        {/* Frame Selector */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Load Frame:</h4>
          <ScrollArea className="h-24">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 30 }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={selectedFrame === i && modelUrl ? "default" : "outline"}
                  onClick={() => loadModel(i)}
                  disabled={isLoading}
                  className="h-8"
                >
                  {i}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Model URL Display */}
        {modelUrl && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                Frame {selectedFrame} Loaded
              </span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="font-mono text-xs break-all text-green-800 dark:text-green-200">
              {modelUrl.substring(0, 100)}...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
