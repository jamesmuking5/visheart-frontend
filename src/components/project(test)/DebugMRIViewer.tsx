"use client";

import { useEffect, useState, useCallback } from "react";
import { tarImageCache } from "@/lib/tar-image-cache";
import { projectApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, RefreshCw, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DebugMRIViewerProps {
  projectId: string;
}

export function DebugMRIViewer({ projectId }: DebugMRIViewerProps) {
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Image data and navigation
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [currentSlice, setCurrentSlice] = useState<number>(0);
  const [availableFrames, setAvailableFrames] = useState<number[]>([]);
  const [availableSlices, setAvailableSlices] = useState<number[]>([]);

  // Cache stats
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [totalImages, setTotalImages] = useState<number>(0);

  // Preloaded images for instant switching
  const [preloadedImages, setPreloadedImages] = useState<Record<string, string>>({});
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [preloadProgress, setPreloadProgress] = useState<{ loaded: number; total: number }>({ loaded: 0, total: 0 });

  // Initialize tar image cache
  useEffect(() => {
    const initializeCache = async () => {
      try {
        if (process.env.NEXT_PUBLIC_ENV === 'development') {
          console.log("[DebugMRIViewer] Initializing tar image cache...");
        }
        await tarImageCache.init();
        if (process.env.NEXT_PUBLIC_ENV === 'development') {
          console.log("[DebugMRIViewer] Tar image cache initialized successfully");
        }
        setIsInitialized(true);

        // Check if we already have images for this project
        const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
        if (frames.length > 0 && slices.length > 0) {
          setAvailableFrames(frames);
          setAvailableSlices(slices);
          setCurrentFrame(frames[0]);
          setCurrentSlice(slices[0]);
          setTotalImages(frames.length * slices.length);
          if (process.env.NEXT_PUBLIC_ENV === 'development') {
            console.log(`[DebugMRIViewer] Found cached images: ${frames.length} frames, ${slices.length} slices`);
          }
        }

        const size = await tarImageCache.getCacheSize();
        setCacheSize(size);
      } catch (err) {
        console.error("[DebugMRIViewer] Failed to initialize cache:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize image cache";
        setError(`Cache initialization failed: ${errorMessage}`);
        setIsInitialized(false);
      }
    };

    initializeCache();
  }, [projectId]);

  // Load current image when frame/slice changes
  const loadCurrentImage = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const imageKey = `${projectId}_f${currentFrame}_s${currentSlice}`;

      // Check if image is already preloaded
      if (preloadedImages[imageKey]) {
        setCurrentImageUrl(preloadedImages[imageKey]);
        return;
      }

      // Fallback to loading from cache (slower)
      const imageUrl = await tarImageCache.getImageURL(projectId, currentFrame, currentSlice);
      setCurrentImageUrl(imageUrl);

      if (!imageUrl) {
        console.warn(`[DebugMRIViewer] No image found for frame ${currentFrame}, slice ${currentSlice}`);
      }
    } catch (err) {
      console.error("[DebugMRIViewer] Failed to load image:", err);
      setError("Failed to load image");
    }
  }, [isInitialized, projectId, currentFrame, currentSlice, preloadedImages]);

  // Preload all images for instant switching
  const preloadAllImages = useCallback(async () => {
    if (!isInitialized || availableFrames.length === 0 || availableSlices.length === 0) {
      return;
    }

    setIsPreloading(true);
    const totalToPreload = availableFrames.length * availableSlices.length;
    setPreloadProgress({ loaded: 0, total: totalToPreload });

    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log(`[DebugMRIViewer] Starting preload of ${totalToPreload} images...`);
    }

    const imageUrls: Record<string, string> = {};
    let loadedCount = 0;

    try {
      // Preload all combinations of frames and slices
      for (const frame of availableFrames) {
        for (const slice of availableSlices) {
          const imageKey = `${projectId}_f${frame}_s${slice}`;

          try {
            const imageUrl = await tarImageCache.getImageURL(projectId, frame, slice);
            if (imageUrl) {
              imageUrls[imageKey] = imageUrl;
            }
          } catch (err) {
            console.warn(`[DebugMRIViewer] Failed to preload image ${imageKey}:`, err);
          }

          loadedCount++;
          setPreloadProgress({ loaded: loadedCount, total: totalToPreload });
        }
      }

      setPreloadedImages(imageUrls);
      if (process.env.NEXT_PUBLIC_ENV === 'development') {
        console.log(`[DebugMRIViewer] Preloaded ${Object.keys(imageUrls).length}/${totalToPreload} images`);
      }
    } catch (err) {
      console.error("[DebugMRIViewer] Preloading failed:", err);
    } finally {
      setIsPreloading(false);
    }
  }, [isInitialized, availableFrames, availableSlices, projectId]);

  // Trigger preloading when frames and slices are available
  useEffect(() => {
    if (availableFrames.length > 0 && availableSlices.length > 0 && Object.keys(preloadedImages).length === 0) {
      if (process.env.NEXT_PUBLIC_ENV === 'development') {
        console.log("[DebugMRIViewer] Triggering preload...");
      }
      setTimeout(() => {
        preloadAllImages();
      }, 100);
    }
  }, [availableFrames, availableSlices, preloadedImages, preloadAllImages]);

  useEffect(() => {
    loadCurrentImage();
  }, [loadCurrentImage]);

  // Fetch and extract images from tar file
  const fetchTarImages = async () => {
    if (!isInitialized) {
      setError("Cache not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("[DebugMRIViewer] Starting tar fetch and extraction...");
      const result = await tarImageCache.fetchAndExtractProjectImages(projectId, projectApi.getProjectPresignedUrl);

      if (result.success) {
        console.log(`[DebugMRIViewer] Successfully extracted ${result.extractedImages}/${result.totalImages} images`);

        // Refresh available frames and slices
        const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
        setAvailableFrames(frames);
        setAvailableSlices(slices);

        // Set initial frame and slice
        if (frames.length > 0 && slices.length > 0) {
          setCurrentFrame(frames[0]);
          setCurrentSlice(slices[0]);
        }

        setTotalImages(result.extractedImages);
        setCacheSize(result.cacheSize);

        if (result.errors.length > 0) {
          console.warn("[DebugMRIViewer] Extraction completed with errors:", result.errors);
        }
      } else {
        setError(`Failed to extract images: ${result.errors.join(", ")}`);
      }

      // Log debug info
      const debugInfo = tarImageCache.getDebugInfo();
      console.log("[DebugMRIViewer] Debug info:", debugInfo);
    } catch (err) {
      console.error("[DebugMRIViewer] Tar fetch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tar file");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cache for current project
  const clearCache = async () => {
    if (!isInitialized) {
      setError("Cache not initialized. Please refresh the page.");
      return;
    }

    try {
      // Clear cache (this will handle URL cleanup)
      await tarImageCache.clearProjectCache(projectId);

      // Reset state
      setAvailableFrames([]);
      setAvailableSlices([]);
      setCurrentFrame(0);
      setCurrentSlice(0);
      setTotalImages(0);
      setPreloadedImages({});
      setCurrentImageUrl(null);
      setPreloadProgress({ loaded: 0, total: 0 });

      const size = await tarImageCache.getCacheSize();
      setCacheSize(size);

      console.log("[DebugMRIViewer] Cache cleared for project:", projectId);
    } catch (err) {
      console.error("[DebugMRIViewer] Failed to clear cache:", err);
      setError("Failed to clear cache");
    }
  };

  // Retry initialization
  const retryInitialization = async () => {
    setError(null);
    setIsInitialized(false);

    try {
      console.log("[DebugMRIViewer] Retrying cache initialization...");
      await tarImageCache.init();
      console.log("[DebugMRIViewer] Retry successful");
      setIsInitialized(true);

      // Check for existing images
      const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
      if (frames.length > 0 && slices.length > 0) {
        setAvailableFrames(frames);
        setAvailableSlices(slices);
        setCurrentFrame(frames[0]);
        setCurrentSlice(slices[0]);
        setTotalImages(frames.length * slices.length);
      }

      const size = await tarImageCache.getCacheSize();
      setCacheSize(size);
    } catch (err) {
      console.error("[DebugMRIViewer] Retry failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Retry failed";
      setError(`Retry failed: ${errorMessage}`);
    }
  };

  const handleFrameChange = (value: string) => {
    const frame = parseInt(value, 10);
    if (!isNaN(frame) && availableFrames.includes(frame)) {
      setCurrentFrame(frame);
    }
  };

  const handleSliceChange = (value: string) => {
    const slice = parseInt(value, 10);
    if (!isNaN(slice) && availableSlices.includes(slice)) {
      setCurrentSlice(slice);
    }
  };

  const navigateFrame = (direction: "prev" | "next") => {
    const currentIndex = availableFrames.indexOf(currentFrame);
    if (direction === "prev" && currentIndex > 0) {
      setCurrentFrame(availableFrames[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < availableFrames.length - 1) {
      setCurrentFrame(availableFrames[currentIndex + 1]);
    }
  };

  const navigateSlice = (direction: "prev" | "next") => {
    const currentIndex = availableSlices.indexOf(currentSlice);
    if (direction === "prev" && currentIndex > 0) {
      setCurrentSlice(availableSlices[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < availableSlices.length - 1) {
      setCurrentSlice(availableSlices[currentIndex + 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (totalImages === 0) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          navigateFrame("prev");
          break;
        case "ArrowRight":
          event.preventDefault();
          navigateFrame("next");
          break;
        case "ArrowUp":
          event.preventDefault();
          navigateSlice("prev");
          break;
        case "ArrowDown":
          event.preventDefault();
          navigateSlice("next");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [totalImages, availableFrames, availableSlices, currentFrame, currentSlice]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Debug MRI Image Viewer
        </CardTitle>
        <CardDescription>Load and view MRI images from tar file for project {projectId}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {!isInitialized && (
                <Button variant="outline" size="sm" onClick={retryInitialization} className="ml-2">
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Cache Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={isInitialized ? "default" : "destructive"}>Status: {isInitialized ? "Ready" : "Not Initialized"}</Badge>
          <Badge variant="secondary">Images: {totalImages}</Badge>
          <Badge variant="secondary">Frames: {availableFrames.length}</Badge>
          <Badge variant="secondary">Slices: {availableSlices.length}</Badge>
          <Badge variant="secondary">Cache Size: {(cacheSize / (1024 * 1024)).toFixed(2)} MB</Badge>
          {isPreloading && (
            <Badge variant="outline">
              Preloading: {preloadProgress.loaded}/{preloadProgress.total}
            </Badge>
          )}
          {Object.keys(preloadedImages).length > 0 && !isPreloading && <Badge variant="default">Preloaded: {Object.keys(preloadedImages).length}</Badge>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={fetchTarImages} disabled={!isInitialized || isLoading} className="flex items-center gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isLoading ? "Fetching..." : "Fetch TAR Images"}
          </Button>

          {totalImages > 0 && Object.keys(preloadedImages).length === 0 && (
            <Button onClick={preloadAllImages} disabled={!isInitialized || isPreloading} variant="outline" className="flex items-center gap-2">
              {isPreloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isPreloading ? "Preloading..." : "Preload All Images"}
            </Button>
          )}

          <Button variant="outline" onClick={clearCache} disabled={!isInitialized || totalImages === 0} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Clear Cache
          </Button>
        </div>

        {/* Image Navigation Controls */}
        {totalImages > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Image Navigation</h4>
              <div className="text-xs text-muted-foreground">Use ← → for frames, ↑ ↓ for slices</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Frame Control */}
              <div className="space-y-2">
                <Label htmlFor="frame-input">Frame</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateFrame("prev")} disabled={availableFrames.indexOf(currentFrame) <= 0}>
                    ←
                  </Button>
                  <Input
                    id="frame-input"
                    type="number"
                    value={currentFrame}
                    onChange={(e) => handleFrameChange(e.target.value)}
                    min={Math.min(...availableFrames)}
                    max={Math.max(...availableFrames)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => navigateFrame("next")} disabled={availableFrames.indexOf(currentFrame) >= availableFrames.length - 1}>
                    →
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">Available: {availableFrames.join(", ")}</div>
              </div>

              {/* Slice Control */}
              <div className="space-y-2">
                <Label htmlFor="slice-input">Slice</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateSlice("prev")} disabled={availableSlices.indexOf(currentSlice) <= 0}>
                    ←
                  </Button>
                  <Input
                    id="slice-input"
                    type="number"
                    value={currentSlice}
                    onChange={(e) => handleSliceChange(e.target.value)}
                    min={Math.min(...availableSlices)}
                    max={Math.max(...availableSlices)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => navigateSlice("next")} disabled={availableSlices.indexOf(currentSlice) >= availableSlices.length - 1}>
                    →
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">Available: {availableSlices.join(", ")}</div>
              </div>
            </div>
          </div>
        )}

        {/* Image Display */}
        <div className="border rounded-lg p-4 bg-muted/20">
          {currentImageUrl ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  Frame: {currentFrame}, Slice: {currentSlice}
                </span>
                <div className="flex items-center gap-2">
                  <span>
                    Image: {projectId}_f{currentFrame}_s{currentSlice}
                  </span>
                  {preloadedImages[`${projectId}_f${currentFrame}_s${currentSlice}`] && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      ⚡ Preloaded
                    </Badge>
                  )}
                </div>
              </div>
              <img
                src={currentImageUrl}
                alt={`MRI Frame ${currentFrame}, Slice ${currentSlice}`}
                className="max-w-full max-h-96 mx-auto object-contain border rounded"
                style={{ imageRendering: "crisp-edges" }}
              />
            </div>
          ) : totalImages > 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>
                  No image found for Frame {currentFrame}, Slice {currentSlice}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Click "Fetch TAR Images" to load MRI images</p>
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {process.env.NEXT_PUBLIC_ENV === 'development' && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">Debug Info</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify(
                {
                  projectId,
                  isInitialized,
                  currentFrame,
                  currentSlice,
                  availableFrames,
                  availableSlices,
                  totalImages,
                  cacheSize,
                  currentImageUrl: currentImageUrl ? "Present" : "None",
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
