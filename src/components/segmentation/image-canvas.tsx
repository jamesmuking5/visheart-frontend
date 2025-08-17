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
  isUndoRedoOperation = false,
  onMaskUpdate,
  currentFrame,
  currentSlice,
  onFrameChange,
  onSliceChange,
  width,
  height,
  activeLabel,
  tool,
  brushSize,
  opacity,
  hardness,
}: ImageCanvasProps) {
  // Browser state management for manual segmentation
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [drawingPoints, setDrawingPoints] = useState<number[] | null>(null);
  
  // Local browser state using editable key format
  const [localMasks, setLocalMasks] = useState<Record<string, Uint8Array>>({});
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  
  // Refs for performance
  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);

  // Memoized values from project data
  const { totalFrames, totalSlices } = useMemo(() => ({
    totalFrames: projectData.dimensions?.frames || 1,
    totalSlices: projectData.dimensions?.slices || 1,
  }), [projectData.dimensions]);

  // Combined state management - merges backend + local changes
  const getCombinedMasks = useCallback(() => {
    // Priority: Local changes override backend data
    return { ...decodedMasks, ...localMasks };
  }, [decodedMasks, localMasks]);

  // Image loading with VisHeart API patterns
  useEffect(() => {
    if (!projectData.projectId) return;

    setImageStatus("loading");
    const img = new window.Image();
    
    // VisHeart API pattern with session credentials
    img.crossOrigin = "use-credentials";
    img.src = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects/${projectData.projectId}/images/frame_${currentFrame}_slice_${currentSlice}.jpeg`;
     
    const timeoutId = setTimeout(() => {
      setImageStatus("error");
    }, PERFORMANCE_CONSTANTS?.IMAGE_LOAD_TIMEOUT_MS || 10000);

    img.onload = () => {
      clearTimeout(timeoutId);
      setImage(img);
      setImageStatus("loaded");
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      console.warn(`[ImageCanvas] Failed to load image for frame ${currentFrame}, slice ${currentSlice}`);
      setImageStatus("error");
    };

    return () => clearTimeout(timeoutId);
  }, [projectData.projectId, currentFrame, currentSlice]);

  // Clear local state during undo/redo operations
  useEffect(() => {
    if (isUndoRedoOperation) {
      console.log('[ImageCanvas] Undo/Redo operation - clearing local state');
      setLocalMasks({});
      setPendingChanges(new Set());
    }
  }, [isUndoRedoOperation]);

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

  // Manual segmentation with editable masks
  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current || !drawingPoints) return;
    
    isDrawing.current = false;

    try {
      const editableMaskKey = `editable_frame_${currentFrame}_slice_${currentSlice}_${activeLabel}`;
      const combinedMasks = getCombinedMasks();
      
      // Get existing mask or create new empty one
      const existingMask = combinedMasks[editableMaskKey];
      const newMask = existingMask ? new Uint8Array(existingMask) : new Uint8Array(height * width);
      const labelValue = tool === "eraser" ? 0 : 1;
      
      // Apply brush stroke to mask
      drawBrushStroke(newMask, width, height, drawingPoints, brushSize, labelValue);
      
      // Update local state
      setLocalMasks(prev => ({
        ...prev,
        [editableMaskKey]: newMask
      }));
      
      setPendingChanges(prev => new Set(prev).add(editableMaskKey));
      
      // Update parent component
      const updatedMasks = { ...combinedMasks, [editableMaskKey]: newMask };
      onMaskUpdate(updatedMasks, tool as 'brush' | 'eraser');
      
    } catch (error) {
      console.error('[ImageCanvas] Error during brush stroke:', error);
    } finally {
      setDrawingPoints(null);
    }
  }, [
    drawingPoints, currentFrame, currentSlice, activeLabel, 
    width, height, tool, brushSize, drawBrushStroke, 
    onMaskUpdate, getCombinedMasks, localMasks
  ]);

  // Save function becomes straightforward - no key conversion needed
  const savePendingChanges = useCallback(async () => {
    if (pendingChanges.size === 0) {
      return { success: true, message: 'No changes to save' };
    }

    try {
      // No key conversion needed - local keys ARE editable keys
      const masksToSave = Array.from(pendingChanges).reduce((acc, editableKey) => {
        if (localMasks[editableKey]) {
          acc[editableKey] = localMasks[editableKey];
        }
        return acc;
      }, {} as Record<string, Uint8Array>);

      // VisHeart API pattern with session credentials
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/segmentation/${projectData.projectId}/editable-masks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // VisHeart session-based auth
        body: JSON.stringify({
          masks: Object.entries(masksToSave).map(([key, data]) => ({
            key,
            data: Array.from(data), // Convert Uint8Array for JSON
            frame: currentFrame,
            slice: currentSlice,
            label: activeLabel,
            isMedSAMOutput: false // Explicitly mark as editable
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Clear pending changes after successful save
        setPendingChanges(new Set());
        console.log(`[ImageCanvas] Successfully saved ${Object.keys(masksToSave).length} editable masks to backend`);
        return { success: true, count: Object.keys(masksToSave).length };
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('[ImageCanvas] Failed to save editable masks:', error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error) 
      };
    }
  }, [pendingChanges, localMasks, projectData.projectId, currentFrame, currentSlice, activeLabel]);

  // Direct mask redering - create ImageData directly from mask data for each label
  const allMaskElements = useMemo(() => {
    const combinedMasks = getCombinedMasks();
    const maskElements: Array<{ label: string; image: HTMLImageElement; color: string }> = [];
    
    // Create direct visualization for each anatomical label
    Object.entries(LABEL_COLORS).forEach(([label, color]) => {
      const editableMaskKey = `editable_frame_${currentFrame}_slice_${currentSlice}_${label}`;
      const maskData = combinedMasks[editableMaskKey];
      
      if (!maskData || maskData.every(val => val === 0)) {
        console.log(`[ImageCanvas] No mask data for ${label} at frame ${currentFrame}, slice ${currentSlice}`);
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
  }, [getCombinedMasks, currentFrame, currentSlice, width, height, opacity]);

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

      {/* Pending changes indicator */}
      {pendingChanges.size > 0 && (
        <div className={cn(
          "mb-2 px-3 py-1 text-sm rounded-md",
          "bg-yellow-100 dark:bg-yellow-900",
          "text-yellow-800 dark:text-yellow-200",
          "border border-yellow-200 dark:border-yellow-700",
          "flex items-center gap-2"
        )}>
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          {pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''} in browser state
        </div>
      )}

      {/* Canvas */}
      <div className="border-4 border-muted-foreground rounded-lg overflow-hidden relative">
        {imageStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="text-sm text-muted-foreground">Loading image...</div>
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

      {/* Image Status Indicator */}
      {imageStatus === "error" && (
        <div className={cn(
          "mt-2 text-sm text-destructive",
          "flex items-center gap-2"
        )}>
          Failed to load image for Frame {currentFrame + 1}, Slice {currentSlice + 1}
        </div>
      )}
    </div>
  );
}