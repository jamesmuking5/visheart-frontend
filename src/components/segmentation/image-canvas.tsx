"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Import shared types and constants
import type { ImageCanvasProps, AnatomicalLabel, BrushHardness } from "@/types/segmentation";
import { 
  LABEL_COLORS, 
  HARDNESS_TO_BLUR, 
  createMaskKey,
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
        onValueChange={(v) => onFrameChange(v[0])}
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
        onValueChange={(v) => onSliceChange(v[0])}
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

// Memoized Canvas Container Component
const CanvasContainer = memo(({ 
  imageStatus,
  stageRef,
  width,
  height,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  image,
  currentMaskOverlays,
  opacity,
  isDrawing,
  drawingPoints,
  tool,
  activeLabel,
  brushSize,
  hardness
}: {
  imageStatus: "loading" | "loaded" | "error";
  stageRef: React.RefObject<any>;
  width: number;
  height: number;
  handleMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
  handleMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
  handleMouseUp: () => void;
  image: HTMLImageElement | null;
  currentMaskOverlays: Array<{ key: string; overlay: HTMLCanvasElement; color: string }>;
  opacity: number;
  isDrawing: boolean;
  drawingPoints: number[] | null;
  tool: string;
  activeLabel: AnatomicalLabel;
  brushSize: number;
  hardness: BrushHardness;
}) => (
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
        
        {/* Mask Overlays */}
        {currentMaskOverlays.map((overlay) => (
          <KonvaImage
            key={overlay.key}
            image={overlay.overlay}
            width={width}
            height={height}
            opacity={opacity}
          />
        ))}
        
        {/* Current Drawing Preview */}
        {isDrawing && drawingPoints && (
          <Line
            points={drawingPoints}
            stroke={tool === "eraser" ? "#000" : LABEL_COLORS[activeLabel]}
            strokeWidth={brushSize}
            opacity={0.8}
            shadowBlur={HARDNESS_TO_BLUR[hardness]}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={tool === "eraser" ? "destination-out" : "source-over"}
          />
        )}
      </Layer>
    </Stage>
  </div>
));

CanvasContainer.displayName = 'CanvasContainer';

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
  
  // Local browser state for instant feedback
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

  // Utility function to transpose mask data from height×width to width×height
  const transposeMaskData = useCallback((maskData: Uint8Array, originalWidth: number, originalHeight: number): Uint8Array => {
    const transposedMask = new Uint8Array(maskData.length);
    
    for (let y = 0; y < originalHeight; y++) {
      for (let x = 0; x < originalWidth; x++) {
        const originalIndex = y * originalWidth + x;
        const transposedIndex = x * originalHeight + y;
        transposedMask[transposedIndex] = maskData[originalIndex];
      }
    }
    
    return transposedMask;
  }, []);

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

  // Update handleMouseUp to use the correct key format for new edits
  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current || !drawingPoints) return;
    
    isDrawing.current = false;

    try {
      // Use standard mask key format for new local edits
      const maskKey = createMaskKey(currentFrame, currentSlice, activeLabel);
      const combinedMasks = getCombinedMasks();
      
      // Check for existing mask in decoded format first
      const decodedMaskKeys = [
        `medSamOutput_frame_${currentFrame}_slice_${currentSlice}_${activeLabel}`,
        `editable_frame_${currentFrame}_slice_${currentSlice}_${activeLabel}`,
      ];
      
      let existingMask: Uint8Array | undefined;
      
      // Look for existing mask in local edits first, then decoded masks
      if (combinedMasks[maskKey]) {
        existingMask = combinedMasks[maskKey];
      } else {
        // Check decoded mask formats and transpose if found
        for (const decodedKey of decodedMaskKeys) {
          if (combinedMasks[decodedKey]) {
            // Transpose the decoded mask from height×width to width×height
            existingMask = transposeMaskData(combinedMasks[decodedKey], height, width);
            console.log(`[ImageCanvas] Transposed existing mask from ${decodedKey}`);
            break;
          }
        }
      }
      
      // Create new mask based on existing or create empty
      const newMask = existingMask ? new Uint8Array(existingMask) : new Uint8Array(width * height);
      const labelValue = tool === "eraser" ? 0 : 1;
      
      // Apply brush stroke to mask
      drawBrushStroke(newMask, width, height, drawingPoints, brushSize, labelValue);
      
      // Store in local browser state using standard key format
      setLocalMasks(prev => ({
        ...prev,
        [maskKey]: newMask
      }));
      
      // Track pending changes for save indicator
      setPendingChanges(prev => new Set(prev).add(maskKey));
      
      // Update parent component state with combined masks
      const updatedMasks = { ...combinedMasks, [maskKey]: newMask };
      onMaskUpdate(
        updatedMasks, 
        tool as 'brush' | 'eraser', 
        `${tool} stroke (size: ${brushSize}, hardness: ${hardness})`
      );
      
      console.log(`[ImageCanvas] Applied ${tool} stroke to browser state:`, maskKey);
      
    } catch (error) {
      console.error('[ImageCanvas] Error during brush stroke:', error);
    } finally {
      setDrawingPoints(null);
    }
  }, [
    drawingPoints, currentFrame, currentSlice, activeLabel, 
    width, height, tool, brushSize, hardness, drawBrushStroke, 
    onMaskUpdate, getCombinedMasks, transposeMaskData
  ]);

  // Explicit save function for parent component to call
  const savePendingChanges = useCallback(async () => {
    if (pendingChanges.size === 0) {
      return { success: true, message: 'No changes to save' };
    }

    try {
      // Prepare masks for saving
      const masksToSave = Array.from(pendingChanges).reduce((acc, maskKey) => {
        if (localMasks[maskKey]) {
          acc[maskKey] = localMasks[maskKey];
        }
        return acc;
      }, {} as Record<string, Uint8Array>);

      // VisHeart API pattern with session credentials
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/segmentation/${projectData.projectId}/masks`, {
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
            label: activeLabel
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
        console.log(`[ImageCanvas] Successfully saved ${Object.keys(masksToSave).length} masks to backend`);
        return { success: true, count: Object.keys(masksToSave).length };
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('[ImageCanvas] Failed to save masks:', error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error) 
      };
    }
  }, [pendingChanges, localMasks, projectData.projectId, currentFrame, currentSlice, activeLabel]);

  // Expose save function to parent component
  useEffect(() => {
    // Pass save function to parent via onMaskUpdate callback extension
    if (typeof onMaskUpdate === 'function') {
      (onMaskUpdate as any).savePendingChanges = savePendingChanges;
    }
  }, [savePendingChanges, onMaskUpdate]);

  // Optimized mask overlay creation with dimension correction
  const createMaskOverlay = useCallback((maskData: Uint8Array, color: string, needsTranspose: boolean = false) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return canvas;

    // Transpose mask data if it comes from decoded format
    const processedMask = needsTranspose ? transposeMaskData(maskData, height, width) : maskData;

    const imgData = ctx.createImageData(width, height);
    const [r, g, b] = [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16)
    ];
    
    const data = imgData.data;
    for (let i = 0; i < processedMask.length; i++) {
      if (processedMask[i] > 0) {
        const pixelIndex = i * 4;
        data[pixelIndex] = r;
        data[pixelIndex + 1] = g;
        data[pixelIndex + 2] = b;
        data[pixelIndex + 3] = Math.round(255 * opacity);
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }, [width, height, opacity, transposeMaskData]);

  // Mask overlays using combined state with proper dimension handling
  const currentMaskOverlays = useMemo(() => {
    const combinedMasks = getCombinedMasks();
    
    console.log('[ImageCanvas] Combined masks available:', Object.keys(combinedMasks));
    console.log('[ImageCanvas] Looking for frame:', currentFrame, 'slice:', currentSlice);
    
    return Object.entries(LABEL_COLORS).map(([label, color]) => {
      // ✅ FIXED: Try multiple key formats to find existing masks
      const possibleKeys = [
        { key: createMaskKey(currentFrame, currentSlice, label as AnatomicalLabel), needsTranspose: false }, // Local edits - correct format
        { key: `medSamOutput_frame_${currentFrame}_slice_${currentSlice}_${label}`, needsTranspose: true }, // Decoded format - needs transpose
        { key: `editable_frame_${currentFrame}_slice_${currentSlice}_${label}`, needsTranspose: true }, // Decoded format - needs transpose
      ];
      
      // Find the first matching mask key
      let maskData: Uint8Array | undefined;
      let foundKey: string | undefined;
      let needsTranspose = false;
      
      for (const { key, needsTranspose: transpose } of possibleKeys) {
        if (combinedMasks[key]) {
          maskData = combinedMasks[key];
          foundKey = key;
          needsTranspose = transpose;
          break;
        }
      }
      
      if (!maskData || !foundKey) {
        console.log(`[ImageCanvas] No mask found for label ${label} at frame ${currentFrame}, slice ${currentSlice}`);
        console.log(`[ImageCanvas] Tried keys:`, possibleKeys.map(p => p.key));
        return null;
      }
      
      console.log(`[ImageCanvas] Found mask for ${label} with key:`, foundKey);
      console.log(`[ImageCanvas] Mask data length:`, maskData.length, 'non-zero pixels:', Array.from(maskData).filter(v => v > 0).length);
      console.log(`[ImageCanvas] Needs transpose:`, needsTranspose);
      
      return {
        key: foundKey,
        overlay: createMaskOverlay(maskData, color, needsTranspose),
        color
      };
    }).filter(Boolean) as Array<{ key: string; overlay: HTMLCanvasElement; color: string }>;
  }, [currentFrame, currentSlice, getCombinedMasks, createMaskOverlay]);

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

      {/* Canvas Container */}
      <CanvasContainer
        imageStatus={imageStatus}
        stageRef={stageRef}
        width={width}
        height={height}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        image={image}
        currentMaskOverlays={currentMaskOverlays}
        opacity={opacity}
        isDrawing={isDrawing.current}
        drawingPoints={drawingPoints}
        tool={tool}
        activeLabel={activeLabel}
        brushSize={brushSize}
        hardness={hardness}
      />

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