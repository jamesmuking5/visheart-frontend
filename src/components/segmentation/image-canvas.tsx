"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Import shared types and constants
import type { ImageCanvasProps, AnatomicalLabel } from "@/types/segmentation";
import { 
  LABEL_COLORS, 
  HARDNESS_TO_BLUR, 
  PERFORMANCE_CONSTANTS 
} from "@/types/segmentation";

// Import tar cache for background images
import { tarImageCache } from "@/lib/tar-image-cache";

// Memoized Navigation Controls Component
const NavigationControls = memo(({ 
  currentFrame, 
  currentSlice, 
  totalFrames, 
  totalSlices, 
  onFrameChange, 
  onSliceChange 
}: {
  currentFrame: number;
  currentSlice: number;
  totalFrames: number;
  totalSlices: number;
  onFrameChange: (frame: number) => void;
  onSliceChange: (slice: number) => void;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-4 p-4 bg-muted rounded-lg shadow-md">
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-foreground">
        Frame: {currentFrame + 1} / {totalFrames}
      </label>
      <Slider
        value={[currentFrame]}
        onValueChange={(v: number[]) => onFrameChange(v[0])}
        min={0}
        max={Math.max(0, totalFrames - 1)}
        step={1}
        disabled={totalFrames <= 1}
        className="[&>span:first-child]:border [&>span:first-child]:border-border"
      />
    </div>
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-foreground">
        Slice: {currentSlice + 1} / {totalSlices}
      </label>
      <Slider
        value={[currentSlice]}
        onValueChange={(v: number[]) => onSliceChange(v[0])}
        min={0}
        max={Math.max(0, totalSlices - 1)}
        step={1}
        disabled={totalSlices <= 1}
        className="[&>span:first-child]:border [&>span:first-child]:border-border"
      />
    </div>
  </div>
));

NavigationControls.displayName = 'NavigationControls';

export function ImageCanvas({
  projectData,
  decodedMasks,
  onMaskUpdate,
  currentFrame,
  currentSlice,
  onFrameChange,
  onSliceChange,
  width,
  height,
  activeLabel,
  visibleMasks,
  tool,
  brushSize,
  opacity,
  hardness,
  isTarCacheReady = false,
  tarCacheError = null,
}: ImageCanvasProps) {
  // Browser state management for manual segmentation
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [drawingPoints, setDrawingPoints] = useState<number[] | null>(null);
  const [imageLoadMethod, setImageLoadMethod] = useState<"tar" | "api" | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true); // Track if this is the first image load
  
  // Refs for performance
  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);

  // Memoized values from project data
  const { totalFrames, totalSlices } = useMemo(() => ({
    totalFrames: projectData.dimensions?.frames || 1,
    totalSlices: projectData.dimensions?.slices || 1,
  }), [projectData.dimensions]);

  // Enhanced image loading with tar cache + API fallback
  useEffect(() => {
    if (!projectData.projectId) return;

    const loadImageWithFallback = async () => {
      // Only show loading spinner on initial load or when there's no current image
      if (isInitialLoad || !image) {
        setImageStatus("loading");
      }
      
      let imageLoaded = false;

      // Method 1: Try loading from tar cache (if ready and available)
      if (isTarCacheReady && !tarCacheError) {
        try {
          console.log(`[ImageCanvas] Attempting to load from tar cache: frame ${currentFrame}, slice ${currentSlice}`);
          const imageUrl = await tarImageCache.getImageURL(projectData.projectId, currentFrame, currentSlice);
          
          if (imageUrl) {
            const img = new window.Image();
            img.crossOrigin = "anonymous"; // For tar cache images
            img.src = imageUrl;
            
            try {
              await new Promise<void>((resolve, reject) => {
                const timeoutId = setTimeout(() => reject("Tar cache timeout"), 5000);
                
                img.onload = () => {
                  clearTimeout(timeoutId);
                  setImage(img);
                  setImageStatus("loaded");
                  setImageLoadMethod("tar");
                  setIsInitialLoad(false); // Mark initial load as complete
                  imageLoaded = true;
                  console.log(`[ImageCanvas] Successfully loaded from tar cache: frame ${currentFrame}, slice ${currentSlice}`);
                  resolve();
                };
                
                img.onerror = () => {
                  clearTimeout(timeoutId);
                  reject("Failed to load tar image");
                };
              });
            } catch (loadError) {
              console.log(`[ImageCanvas] Tar cache image loading failed:`, loadError);
            }
          } else {
            console.log(`[ImageCanvas] No image URL found in tar cache for frame ${currentFrame}, slice ${currentSlice}`);
          }
        } catch (error) {
          console.log(`[ImageCanvas] Tar cache loading failed, falling back to API:`, error);
        }
      } else if (tarCacheError) {
        console.log(`[ImageCanvas] Skipping tar cache due to error: ${tarCacheError}`);
      } else {
        console.log(`[ImageCanvas] Tar cache not ready yet (${isTarCacheReady}), falling back to API`);
      }

      // Method 2: Fallback to API loading (if tar cache failed or not available)
      if (!imageLoaded) {
        try {
          console.log(`[ImageCanvas] Loading from API: frame ${currentFrame}, slice ${currentSlice}`);
          const img = new window.Image();
          img.crossOrigin = "use-credentials"; // For API images
          img.src = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects/${projectData.projectId}/images/frame_${currentFrame}_slice_${currentSlice}.jpeg`;
          
          await new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => reject("API timeout"), PERFORMANCE_CONSTANTS?.IMAGE_LOAD_TIMEOUT_MS || 10000);
            
            img.onload = () => {
              clearTimeout(timeoutId);
              setImage(img);
              setImageStatus("loaded");
              setImageLoadMethod("api");
              setIsInitialLoad(false); // Mark initial load as complete
              console.log(`[ImageCanvas] Successfully loaded from API: frame ${currentFrame}, slice ${currentSlice}`);
              resolve();
            };
            
            img.onerror = () => {
              clearTimeout(timeoutId);
              reject("API load failed");
            };
          });
        } catch (error) {
          console.error(`[ImageCanvas] Both tar cache and API loading failed:`, error);
          setImageStatus("error");
          setImageLoadMethod(null);
        }
      }
    };

    loadImageWithFallback().catch((error) => {
      console.error(`[ImageCanvas] Image loading error:`, error);
      setImageStatus("error");
      setImageLoadMethod(null);
    });
  }, [projectData.projectId, currentFrame, currentSlice, isTarCacheReady, tarCacheError, isInitialLoad]);

  // Additional effect to reload image when tar cache becomes ready (for initial load)
  useEffect(() => {
    if (isTarCacheReady && imageStatus === "loading" && !image) {
      console.log(`[ImageCanvas] Tar cache became ready, triggering image reload`);
    }
  }, [isTarCacheReady, imageStatus, image]);

  // Optimized drawing handlers with useCallback
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    return stage.getPointerPosition();
  }, []);

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (tool === "select" || e.evt.button !== 0) return;
    
    isDrawing.current = true;
    const pos = getRelativePointerPosition();
    if (!pos) return;
    
    setDrawingPoints([pos.x, pos.y]);
  }, [tool, getRelativePointerPosition]);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || tool === "select") return;
    
    const point = getRelativePointerPosition();
    if (!point) return;
    
    setDrawingPoints(prev => prev ? [...prev, point.x, point.y] : [point.x, point.y]);
  }, [tool, getRelativePointerPosition]);

  // Optimized Bresenham drawing algorithm
  const drawBrushStroke = useCallback((
    mask: Uint8Array, 
    maskWidth: number, 
    maskHeight: number, 
    points: number[], 
    size: number, 
    labelValue: number
  ) => {
    const radius = size / 2;
    const radiusSquared = radius * radius;

    for (let i = 2; i < points.length; i += 2) {
      const x0 = Math.round(points[i - 2]);
      const y0 = Math.round(points[i - 1]);
      const x1 = Math.round(points[i]);
      const y1 = Math.round(points[i + 1]);
      
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      let x = x0;
      let y = y0;
      
      while (true) {
        const minX = Math.max(0, x - Math.floor(radius));
        const maxX = Math.min(maskWidth - 1, x + Math.floor(radius));
        const minY = Math.max(0, y - Math.floor(radius));
        const maxY = Math.min(maskHeight - 1, y + Math.floor(radius));
        
        for (let py = minY; py <= maxY; py++) {
          for (let px = minX; px <= maxX; px++) {
            const dx = px - x;
            const dy = py - y;
            
            if (dx * dx + dy * dy <= radiusSquared) {
              mask[py * maskWidth + px] = labelValue;
            }
          }
        }
        
        if (x === x1 && y === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx) { err += dx; y += sy; }
      }
    }
  }, []);

  // Manual segmentation with editable masks - apply edits directly to decodedMasks
  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current || !drawingPoints) return;
    
    isDrawing.current = false;

    try {
      const editableMaskKey = `editable_frame_${currentFrame}_slice_${currentSlice}_${activeLabel}`;
      
      // Get existing mask or create new empty one
      const existingMask = decodedMasks[editableMaskKey];
      const newMask = existingMask ? new Uint8Array(existingMask) : new Uint8Array(height * width);
      const labelValue = tool === "eraser" ? 0 : 1;
      
      // Apply brush stroke to mask
      drawBrushStroke(newMask, width, height, drawingPoints, brushSize, labelValue);
      
      // Update decodedMasks directly - no local state needed
      const updatedMasks = { ...decodedMasks, [editableMaskKey]: newMask };
      onMaskUpdate(updatedMasks, tool as 'brush' | 'eraser');
      
    } catch (error) {
      console.error('[ImageCanvas] Error during brush stroke:', error);
    } finally {
      setDrawingPoints(null);
    }
  }, [
    drawingPoints, currentFrame, currentSlice, activeLabel, 
    width, height, tool, brushSize, drawBrushStroke, 
    onMaskUpdate, decodedMasks
  ]);

  // Direct mask rendering - create ImageData directly from decodedMasks for each label
  const allMaskElements = useMemo(() => {
    const maskElements: Array<{ label: string; image: HTMLImageElement; color: string }> = [];
    Object.entries(LABEL_COLORS).forEach(([label, color]) => {
      if (!visibleMasks.has(label as AnatomicalLabel)) return; // Only show visible masks
      
      const editableMaskKey = `editable_frame_${currentFrame}_slice_${currentSlice}_${label}`;
      const maskData = decodedMasks[editableMaskKey];
      
      if (!maskData || maskData.every((val: number) => val === 0)) {
        return;
      }
      
      // Direct conversion: mask data to canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      
      const imageData = ctx.createImageData(width, height);
      const [r, g, b] = [
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16)
      ];
      
      const data = imageData.data;
      
      // Simple 1:1 pixel mapping: direct array index to canvas pixel mapping
      for (let i = 0; i < maskData.length && i < (width * height); i++) {
        if (maskData[i] > 0) {
          const pixelIndex = i * 4;
          data[pixelIndex] = r;       // Red
          data[pixelIndex + 1] = g;   // Green
          data[pixelIndex + 2] = b;   // Blue
          data[pixelIndex + 3] = Math.round(255 * opacity); // Alpha
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      const img = new window.Image();
      img.src = canvas.toDataURL();
      
      maskElements.push({
        label,
        image: img,
        color
      });
      
      console.log(`[ImageCanvas] Creating direct mask element for ${label} | frame: ${currentFrame}, slice: ${currentSlice}`);
    });
    
    console.log(`[ImageCanvas] Total mask elements found: ${maskElements.length}`);
    return maskElements;
  }, [decodedMasks, currentFrame, currentSlice, width, height, opacity, visibleMasks]);

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Navigation Controls */}
      <NavigationControls
        currentFrame={currentFrame}
        currentSlice={currentSlice}
        totalFrames={totalFrames}
        totalSlices={totalSlices}
        onFrameChange={onFrameChange}
        onSliceChange={onSliceChange}
      />

      {/* Canvas */}
      <div className="border-4 border-muted-foreground rounded-lg overflow-hidden relative">
        {/* Only show loading spinner on initial load or when there's no current image */}
        {imageStatus === "loading" && isInitialLoad && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading image...
            </div>
          </div>
        )}

        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {/* Background Image */}
            {imageStatus === "loaded" && image && (
              <KonvaImage image={image} width={width} height={height} />
            )}
            
            {/* Display all anatomical labels */}
            {allMaskElements.map((maskElement) => (
              <KonvaImage
                key={`mask-${maskElement.label}`}
                image={maskElement.image}
                width={width}
                height={height}
                opacity={opacity}
              />
            ))}
            
            {/* Current Drawing Preview - highlight active label */}
            {isDrawing.current && drawingPoints && (
              <Line
                points={drawingPoints}
                stroke={tool === "eraser" ? "#000" : LABEL_COLORS[activeLabel]}
                strokeWidth={brushSize}
                opacity={0.8}
                shadowBlur={HARDNESS_TO_BLUR[hardness]}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Image Status Indicators */}
      <div className="mt-2 flex flex-col items-center gap-1">
        {imageStatus === "error" && (
          <div className="text-sm text-destructive flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive"></div>
            Failed to load image for Frame {currentFrame + 1}, Slice {currentSlice + 1}
            {!isTarCacheReady && tarCacheError && (
              <span className="text-muted-foreground text-xs">(Cache error: {tarCacheError})</span>
            )}
            {!isTarCacheReady && !tarCacheError && (
              <span className="text-muted-foreground text-xs">(Cache not ready)</span>
            )}
          </div>
        )}
        
        {imageStatus === "loaded" && imageLoadMethod && (
          <div className="text-xs text-muted-foreground">
            Frame {currentFrame + 1}/{totalFrames}, Slice {currentSlice + 1}/{totalSlices}
          </div>
        )}
      </div>
    </div>
  );
}