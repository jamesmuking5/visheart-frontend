/**
 * DebugMRIViewer Component
 *
 * A comprehensive debug component for viewing MRI images from tar files with instant navigation.
 * This component handles the complete workflow from tar file fetching to image display with
 * preloading optimization for seamless user experience.
 *
 * Key Features:
 * - Fetches and extracts MRI images from presigned tar URLs
 * - Stores images in IndexedDB for persistent caching
 * - Preloads all images into memory for instant switching
 * - Provides frame/slice navigation with keyboard shortcuts
 * - Interactive zoom and pan functionality for detailed viewing
 * - Handles filename pattern: projectid_filehash_frame_slice.jpg
 * - Memory management with proper URL cleanup
 * - Debug information and progress tracking
 *
 * Navigation Controls:
 * - Arrow keys: ← → for frames, ↑ ↓ for slices
 * - Zoom controls: + - keys for zoom in/out, 0 to reset
 * - Mouse interactions: wheel to zoom, drag to pan
 * - Input fields: Direct frame/slice number entry
 * - Navigation buttons: Click-based prev/next controls
 *
 * Viewing Features:
 * - Large 600px image display area for detailed examination
 * - Smooth zoom (0.1x to 5x) with mouse wheel or keyboard
 * - Click and drag panning for exploring zoomed images
 * - Optional zoom/pan preservation when switching images
 * - Scrollbar interference prevention during zoom operations
 * - Visual zoom indicator overlay
 *
 * User Preferences:
 * - Checkbox to reset frame when slice changes
 * - Checkbox to preserve zoom/pan across image navigation
 * - Configurable navigation behavior for optimal workflow
 *
 * Performance Optimizations:
 * - URL caching prevents duplicate object URLs for same blob
 * - Memory preloading eliminates loading delays
 * - Batch processing with progress tracking
 * - Conditional console logging based on environment
 *
 * @param projectId - The unique identifier for the project containing MRI images
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { tarImageCache } from "@/lib/tar-image-cache";
import { projectApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, RefreshCw, Image as ImageIcon, AlertCircle, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

interface DebugMRIViewerProps {
  projectId: string;
}

export function DebugMRIViewer({ projectId }: DebugMRIViewerProps) {
  // Loading and error states - manage component lifecycle and error handling
  const [isLoading, setIsLoading] = useState<boolean>(false); // Overall loading state for tar extraction
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Flag to track if component is fully loaded
  const [error, setError] = useState<string | null>(null); // Error message display for user feedback

  // Image data and navigation - core image viewing functionality
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null); // URL for displaying current image
  const [currentFrame, setCurrentFrame] = useState<number>(0); // Currently selected frame index (0-based)
  const [currentSlice, setCurrentSlice] = useState<number>(0); // Currently selected slice index (0-based)
  const [availableFrames, setAvailableFrames] = useState<number[]>([]); // Array of available frame numbers
  const [availableSlices, setAvailableSlices] = useState<number[]>([]); // Array of available slice numbers

  // Cache stats - monitor performance and storage usage
  const [cacheSize, setCacheSize] = useState<number>(0); // Total number of cached images
  const [totalImages, setTotalImages] = useState<number>(0); // Total images available in tar file

  // Preloaded images for instant switching - memory optimization for smooth UX
  const [preloadedImages, setPreloadedImages] = useState<Record<string, string>>({}); // Map of image keys to blob URLs
  const [isPreloading, setIsPreloading] = useState<boolean>(false); // Preloading operation status
  const [preloadProgress, setPreloadProgress] = useState<{ loaded: number; total: number }>({ loaded: 0, total: 0 }); // Progress tracking

  // Navigation behavior control
  const [resetFrameOnSliceChange, setResetFrameOnSliceChange] = useState<boolean>(false); // Reset frame to 0 when slice changes
  const [preserveZoomPan, setPreserveZoomPan] = useState<boolean>(true); // Preserve zoom and pan when switching images

  // Ref for image container to attach native event listeners
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Image zoom and pan controls
  const [zoom, setZoom] = useState<number>(1); // Current zoom level (1 = 100%)
  const [panX, setPanX] = useState<number>(0); // Pan offset X in pixels
  const [panY, setPanY] = useState<number>(0); // Pan offset Y in pixels
  const [isPanning, setIsPanning] = useState<boolean>(false); // Track if user is currently panning
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null); // Last mouse position for panning

  // Initialize tar image cache - setup component on mount
  useEffect(() => {
    const initializeCache = async () => {
      try {
        if (process.env.NEXT_PUBLIC_ENV === "development") {
          console.log("[DebugMRIViewer] Initializing tar image cache...");
        }
        await tarImageCache.init();
        if (process.env.NEXT_PUBLIC_ENV === "development") {
          console.log("[DebugMRIViewer] Tar image cache initialized successfully");
        }
        setIsInitialized(true);

        // Check if we already have images for this project
        const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
        if (frames.length > 0 && slices.length > 0) {
          // Initialize navigation with first available frame/slice combination
          setAvailableFrames(frames);
          setAvailableSlices(slices);
          setCurrentFrame(frames[0]);
          setCurrentSlice(slices[0]);
          setTotalImages(frames.length * slices.length);
          if (process.env.NEXT_PUBLIC_ENV === "development") {
            console.log(`[DebugMRIViewer] Found cached images: ${frames.length} frames, ${slices.length} slices`);
          }
        }

        // Update cache size for debug information
        const size = await tarImageCache.getCacheSize();
        setCacheSize(size);
      } catch (err) {
        // Handle initialization errors gracefully
        console.error("[DebugMRIViewer] Failed to initialize cache:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize image cache";
        setError(`Cache initialization failed: ${errorMessage}`);
        setIsInitialized(false);
      }
    };

    initializeCache();
  }, [projectId]); // Re-initialize when project changes

  // Load current image when frame/slice changes - core image display logic
  const loadCurrentImage = useCallback(async () => {
    if (!isInitialized) return; // Wait for initialization to complete

    try {
      const imageKey = `${projectId}_f${currentFrame}_s${currentSlice}`;

      // Check if image is already preloaded in memory for instant display
      if (preloadedImages[imageKey]) {
        setCurrentImageUrl(preloadedImages[imageKey]);
        return;
      }

      // Fallback to loading from IndexedDB cache (slower but more reliable)
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

  // Preload all images for instant switching - performance optimization
  const preloadAllImages = useCallback(async () => {
    if (!isInitialized || availableFrames.length === 0 || availableSlices.length === 0) {
      return; // Skip preloading if data not ready
    }

    setIsPreloading(true);
    const totalToPreload = availableFrames.length * availableSlices.length;
    setPreloadProgress({ loaded: 0, total: totalToPreload });

    if (process.env.NEXT_PUBLIC_ENV === "development") {
      console.log(`[DebugMRIViewer] Starting preload of ${totalToPreload} images...`);
    }

    const imageUrls: Record<string, string> = {};
    let loadedCount = 0;

    try {
      // Preload all combinations of frames and slices for instant switching
      for (const frame of availableFrames) {
        for (const slice of availableSlices) {
          const imageKey = `${projectId}_f${frame}_s${slice}`;

          try {
            // Load image URL from cache and store in memory map
            const imageUrl = await tarImageCache.getImageURL(projectId, frame, slice);
            if (imageUrl) {
              imageUrls[imageKey] = imageUrl;
            }
          } catch (err) {
            console.warn(`[DebugMRIViewer] Failed to preload image ${imageKey}:`, err);
          }

          loadedCount++;
          setPreloadProgress({ loaded: loadedCount, total: totalToPreload }); // Update progress for UI feedback
        }
      }

      // Store all preloaded images in state for instant access
      setPreloadedImages(imageUrls);
      if (process.env.NEXT_PUBLIC_ENV === "development") {
        console.log(`[DebugMRIViewer] Preloaded ${Object.keys(imageUrls).length}/${totalToPreload} images`);
      }
    } catch (err) {
      console.error("[DebugMRIViewer] Preloading failed:", err);
    } finally {
      setIsPreloading(false); // Complete preloading operation
    }
  }, [isInitialized, availableFrames, availableSlices, projectId]);

  // Trigger preloading when frames and slices are available - automatic optimization
  useEffect(() => {
    if (availableFrames.length > 0 && availableSlices.length > 0 && Object.keys(preloadedImages).length === 0) {
      if (process.env.NEXT_PUBLIC_ENV === "development") {
        console.log("[DebugMRIViewer] Triggering preload...");
      }
      // Small delay to allow UI to stabilize before heavy preloading operation
      setTimeout(() => {
        preloadAllImages();
      }, 100);
    }
  }, [availableFrames, availableSlices, preloadedImages, preloadAllImages]);

  // Load image whenever navigation changes
  useEffect(() => {
    loadCurrentImage();
  }, [loadCurrentImage]); // Dependency ensures image updates when frame/slice changes

  // Fetch and extract images from tar file - main data loading function
  const fetchTarImages = async () => {
    if (!isInitialized) {
      setError("Cache not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("[DebugMRIViewer] Starting tar fetch and extraction...");
      // Fetch tar file from server and extract all images to IndexedDB
      const result = await tarImageCache.fetchAndExtractProjectImages(projectId, projectApi.getProjectPresignedUrl);

      if (result.success) {
        console.log(`[DebugMRIViewer] Successfully extracted ${result.extractedImages}/${result.totalImages} images`);

        // Refresh available frames and slices after successful extraction
        const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
        setAvailableFrames(frames);
        setAvailableSlices(slices);

        // Set initial frame and slice to first available combination
        if (frames.length > 0 && slices.length > 0) {
          setCurrentFrame(frames[0]);
          setCurrentSlice(slices[0]);
        }

        // Update UI state with extraction results
        setTotalImages(result.extractedImages);
        setCacheSize(result.cacheSize);

        if (result.errors.length > 0) {
          console.warn("[DebugMRIViewer] Extraction completed with errors:", result.errors);
        }
      } else {
        setError(`Failed to extract images: ${result.errors.join(", ")}`);
      }

      // Log debug info for troubleshooting
      const debugInfo = tarImageCache.getDebugInfo();
      console.log("[DebugMRIViewer] Debug info:", debugInfo);
    } catch (err) {
      console.error("[DebugMRIViewer] Tar fetch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tar file");
    } finally {
      setIsLoading(false); // Always clear loading state
    }
  };

  // Clear cache for current project - cleanup function
  const clearCache = async () => {
    if (!isInitialized) {
      setError("Cache not initialized. Please refresh the page.");
      return;
    }

    try {
      // Clear cache and cleanup all associated URLs
      await tarImageCache.clearProjectCache(projectId);

      // Reset all component state to initial values
      setAvailableFrames([]);
      setAvailableSlices([]);
      setCurrentFrame(0);
      setCurrentSlice(0);
      setTotalImages(0);
      setPreloadedImages({});
      setCurrentImageUrl(null);
      setPreloadProgress({ loaded: 0, total: 0 });

      // Update cache size after cleanup
      const size = await tarImageCache.getCacheSize();
      setCacheSize(size);

      console.log("[DebugMRIViewer] Cache cleared for project:", projectId);
    } catch (err) {
      console.error("[DebugMRIViewer] Failed to clear cache:", err);
      setError("Failed to clear cache");
    }
  };

  // Retry initialization - error recovery function
  const retryInitialization = async () => {
    setError(null);
    setIsInitialized(false);

    try {
      console.log("[DebugMRIViewer] Retrying cache initialization...");
      await tarImageCache.init();
      console.log("[DebugMRIViewer] Retry successful");
      setIsInitialized(true);

      // Check for existing images after successful retry
      const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
      if (frames.length > 0 && slices.length > 0) {
        // Restore navigation state if images are available
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

  // Input handlers for direct frame/slice selection
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

      // Reset frame to first available frame if checkbox is enabled
      if (resetFrameOnSliceChange && availableFrames.length > 0) {
        setCurrentFrame(availableFrames[0]);
      }
    }
  };

  // Navigation functions for button controls
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
    let newSlice: number | null = null;

    if (direction === "prev" && currentIndex > 0) {
      newSlice = availableSlices[currentIndex - 1];
    } else if (direction === "next" && currentIndex < availableSlices.length - 1) {
      newSlice = availableSlices[currentIndex + 1];
    }

    if (newSlice !== null) {
      setCurrentSlice(newSlice);

      // Reset frame to first available frame if checkbox is enabled
      if (resetFrameOnSliceChange && availableFrames.length > 0) {
        setCurrentFrame(availableFrames[0]);
      }
    }
  };

  // Image zoom and pan control functions for enhanced viewing
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5)); // Max zoom 5x with 20% increments
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1)); // Min zoom 0.1x with 20% decrements
  };

  const handleZoomReset = () => {
    setZoom(1); // Reset to 100% zoom
    setPanX(0); // Reset horizontal pan
    setPanY(0); // Reset vertical pan
  };

  // Mouse event handlers for pan functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left mouse button only
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault(); // Prevent text selection
      e.stopPropagation(); // Prevent event bubbling
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && lastPanPoint) {
      // Calculate mouse movement delta
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;

      // Update pan position based on movement
      setPanX((prev) => prev + deltaX);
      setPanY((prev) => prev + deltaY);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault(); // Prevent any default behavior during panning
      e.stopPropagation(); // Prevent event bubbling
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false); // Stop panning
    setLastPanPoint(null); // Clear last pan point
  };

  // Mouse wheel zoom handler with enhanced scroll prevention
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // 10% zoom steps
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta))); // Apply zoom limits
  }, []);

  const handleMouseEnter = useCallback(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
  }, [handleWheel]);

  const handleMouseLeave = useCallback(() => {
    window.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Reset zoom and pan when image changes - now conditional based on user preference
  useEffect(() => {
    if (!preserveZoomPan) {
      setZoom(1);
      setPanX(0);
      setPanY(0);
    }
  }, [currentFrame, currentSlice, preserveZoomPan]);

  // Keyboard navigation - enhance user experience with arrow key controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (totalImages === 0) return; // Only handle keys when images are available

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault(); // Prevent default browser behavior
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
        case "=":
        case "+":
          event.preventDefault();
          handleZoomIn();
          break;
        case "-":
          event.preventDefault();
          handleZoomOut();
          break;
        case "0":
          event.preventDefault();
          handleZoomReset();
          break;
      }
    };

    // Attach global keyboard event listener
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [totalImages, availableFrames, availableSlices, currentFrame, currentSlice]);

  return (
    <TooltipProvider>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={fetchTarImages} disabled={!isInitialized || isLoading} className="flex items-center gap-2">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isLoading ? "Fetching..." : "Fetch TAR"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download and extract TAR images</TooltipContent>
            </Tooltip>

            {totalImages > 0 && Object.keys(preloadedImages).length === 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={preloadAllImages} disabled={!isInitialized || isPreloading} variant="outline" className="flex items-center gap-2">
                    {isPreloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {isPreloading ? "Preloading..." : "Preload All"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preload images for faster navigation</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={clearCache} disabled={!isInitialized || totalImages === 0} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Clear Cache
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear cached images</TooltipContent>
            </Tooltip>
          </div>

          {/* Image Navigation Controls */}
          {totalImages > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Image Navigation</h4>
                <div className="text-xs text-muted-foreground">← → frames | ↑ ↓ slices | + - 0 zoom</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Frame Control */}
                <div className="space-y-2">
                  <Label htmlFor="frame-input">Frame</Label>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => navigateFrame("prev")} disabled={availableFrames.indexOf(currentFrame) <= 0}>
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Previous frame</TooltipContent>
                    </Tooltip>
                    <Input
                      id="frame-input"
                      type="number"
                      value={currentFrame}
                      onChange={(e) => handleFrameChange(e.target.value)}
                      min={Math.min(...availableFrames)}
                      max={Math.max(...availableFrames)}
                      className="flex-1"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => navigateFrame("next")} disabled={availableFrames.indexOf(currentFrame) >= availableFrames.length - 1}>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Next frame</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm text-muted-foreground">Available: {availableFrames.join(", ")}</div>
                </div>

                {/* Slice Control */}
                <div className="space-y-2">
                  <Label htmlFor="slice-input">Slice</Label>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => navigateSlice("prev")} disabled={availableSlices.indexOf(currentSlice) <= 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Previous slice</TooltipContent>
                    </Tooltip>
                    <Input
                      id="slice-input"
                      type="number"
                      value={currentSlice}
                      onChange={(e) => handleSliceChange(e.target.value)}
                      min={Math.min(...availableSlices)}
                      max={Math.max(...availableSlices)}
                      className="flex-1"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => navigateSlice("next")} disabled={availableSlices.indexOf(currentSlice) >= availableSlices.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Next slice</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm text-muted-foreground">Available: {availableSlices.join(", ")}</div>
                </div>
              </div>

              {/* Navigation Behavior Settings */}
              <div className="space-y-2 p-3 bg-muted/20 rounded">
                <div className="flex items-center space-x-2">
                  <Checkbox id="reset-frame-checkbox" checked={resetFrameOnSliceChange} onCheckedChange={(checked) => setResetFrameOnSliceChange(!!checked)} />
                  <Label htmlFor="reset-frame-checkbox" className="text-sm cursor-pointer">
                    Reset frame on slice change
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="preserve-zoom-checkbox" checked={preserveZoomPan} onCheckedChange={(checked) => setPreserveZoomPan(!!checked)} />
                  <Label htmlFor="preserve-zoom-checkbox" className="text-sm cursor-pointer">
                    Preserve zoom and pan when switching images
                  </Label>
                </div>
              </div>

              {/* Zoom and Pan Controls */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">View Controls</h4>
                  <div className="text-xs text-muted-foreground">Wheel/Drag to zoom/pan, + - 0 keys</div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.1}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom out</TooltipContent>
                  </Tooltip>
                  <div className="flex-1 text-center text-sm font-medium">{Math.round(zoom * 100)}%</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 5}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom in</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleZoomReset}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset zoom/pan</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {/* Image Display */}
          <div className="border rounded-lg bg-muted/20">
            {currentImageUrl ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-4 text-sm text-muted-foreground border-b">
                  <span>
                    Frame: {currentFrame}, Slice: {currentSlice}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Zoom: {Math.round(zoom * 100)}%</span>
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

                {/* Image Container with Zoom and Pan */}
                <div
                  ref={imageContainerRef}
                  className="relative w-full h-[600px] overflow-hidden cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={() => {
                    handleMouseUp();
                    handleMouseLeave();
                  }}
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none", // webkit browsers
                    touchAction: "none", // Prevent default touch behaviors
                    overscrollBehavior: "none", // Prevent scroll chaining
                    scrollBehavior: "auto", // Override smooth scroll
                    overflowX: "hidden", // Ensure no horizontal scroll
                    overflowY: "hidden", // Ensure no vertical scroll
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                      transformOrigin: "center",
                      transition: isPanning ? "none" : "transform 0.1s ease-out",
                    }}
                  >
                    <Image
                      src={currentImageUrl}
                      alt={`MRI Frame ${currentFrame}, Slice ${currentSlice}`}
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="max-w-full max-h-full object-contain w-auto h-auto"
                      style={{
                        imageRendering: "crisp-edges",
                        pointerEvents: "none", // Prevent image from interfering with mouse events
                      }}
                      unoptimized
                      draggable={false}
                    />
                  </div>

                  {/* Zoom indicator overlay */}
                  {zoom !== 1 && <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">{Math.round(zoom * 100)}%</div>}

                  {/* Pan indicator */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Move className="h-3 w-3" /> Pan
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Click and drag to pan</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ) : totalImages > 0 ? (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>
                    No image found for Frame {currentFrame}, Slice {currentSlice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click "Fetch TAR" to load MRI images</p>
                </div>
              </div>
            )}
          </div>

          {/* Debug Info */}
          {process.env.NEXT_PUBLIC_ENV === "development" && (
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
    </TooltipProvider>
  );
}
