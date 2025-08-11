"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { Slider } from "@/components/ui/slider";
import type { ProjectData } from "@/types/project(test)";

interface ImageCanvasProps {
  projectData: ProjectData;
  decodedMasks: Record<string, Uint8Array>;
  onMaskUpdate: (masks: Record<string, Uint8Array>) => void;
  currentFrame: number;
  currentSlice: number;
  onFrameChange: (frame: number) => void;
  onSliceChange: (slice: number) => void;
  width: number;
  height: number;
  activeLabel: string;
  tool: string;
  brushSize: number;
  opacity: number;
  hardness: "soft" | "medium" | "hard";
}

const LABEL_COLORS = {
  'lvc': '#ef4444', // Red
  'rv': '#3b82f6',  // Blue  
  'myo': '#22c55e'  // Green
};

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
  tool,
  brushSize,
  opacity,
  hardness,
}: ImageCanvasProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");
  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);
  
  // OPTIMIZED: Single drawing line instead of accumulating multiple lines
  const [drawingPoints, setDrawingPoints] = useState<number[] | null>(null);

  // OPTIMIZED: Better hardness implementation with visual feedback
  const hardnessToBlur = {
    soft: 15,
    medium: 7,
    hard: 0,
  };

  // Load background image using project data pattern
  useEffect(() => {
    setImageStatus("loading");
    const img = new window.Image();
    img.src = `${projectData.baseImageUrl || '/images'}/${projectData.projectId}/frame_${currentFrame}_slice_${currentSlice}.png`;
    
    img.onload = () => {
      setImage(img);
      setImageStatus("loaded");
    };
    
    img.onerror = () => {
      console.warn("Failed to load image:", img.src);
      setImageStatus("error");
    };
  }, [projectData, currentFrame, currentSlice]);

  // OPTIMIZED: Efficient pointer position calculation
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    return pointer || null;
  }, []);

  // OPTIMIZED: Immediate drawing start with single line tracking
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (tool === "select" || e.evt.button !== 0) return;
    
    isDrawing.current = true;
    const pos = getRelativePointerPosition();
    if (!pos) return;
    
    setDrawingPoints([pos.x, pos.y]);
  }, [tool, getRelativePointerPosition]);

  // OPTIMIZED: Real-time line updates without state accumulation
  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || tool === "select") return;
    
    const point = getRelativePointerPosition();
    if (!point) return;
    
    setDrawingPoints(prev => prev ? [...prev, point.x, point.y] : [point.x, point.y]);
  }, [tool, getRelativePointerPosition]);

  // OPTIMIZED: Enhanced Bresenham's algorithm with better brush handling
  const drawBrushStroke = useCallback((
    mask: Uint8Array, 
    maskWidth: number, 
    maskHeight: number, 
    points: number[], 
    size: number, 
    labelValue: number
  ) => {
    // Process line segments with improved algorithm
    for (let i = 2; i < points.length; i += 2) {
      const x0 = Math.round(points[i - 2]);
      const y0 = Math.round(points[i - 1]);
      const x1 = Math.round(points[i]);
      const y1 = Math.round(points[i + 1]);
      
      // Bresenham's line algorithm
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      let x = x0;
      let y = y0;
      
      const radius = size / 2;
      const radiusSquared = radius * radius;
      
      while (true) {
        // OPTIMIZED: Circular brush with bounds checking
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

  // OPTIMIZED: Immediate mask application with better memory management
  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current || !drawingPoints) return;
    
    isDrawing.current = false;

    // Pass action type to history
    const newMasks = { ...decodedMasks };
    const maskKey = `mask_${currentFrame}_${currentSlice}_${activeLabel}`;
    
    if (!newMasks[maskKey]) {
      newMasks[maskKey] = new Uint8Array(width * height);
    }
    
    const mask = new Uint8Array(newMasks[maskKey]);
    const labelValue = tool === "eraser" ? 0 : 1;
    drawBrushStroke(mask, width, height, drawingPoints, brushSize, labelValue);
    
    newMasks[maskKey] = mask;
    
    // Pass action type for proper history tracking
    onMaskUpdate(newMasks, tool as 'brush' | 'eraser', `${tool} action with size ${brushSize}`);
    setDrawingPoints(null);
  }, [
    drawingPoints, decodedMasks, currentFrame, currentSlice, activeLabel, 
    width, height, tool, brushSize, drawBrushStroke, onMaskUpdate
  ]);
  
  // OPTIMIZED: Efficient mask overlay creation with caching potential
  const createMaskOverlay = useCallback((maskData: Uint8Array, color: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      const imgData = ctx.createImageData(width, height);
      const [r, g, b] = [
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16)
      ];
      
      // OPTIMIZED: Efficient pixel painting
      const data = imgData.data;
      for (let i = 0; i < maskData.length; i++) {
        if (maskData[i] > 0) {
          const pixelIndex = i * 4;
          data[pixelIndex] = r;
          data[pixelIndex + 1] = g;
          data[pixelIndex + 2] = b;
          data[pixelIndex + 3] = Math.round(255 * opacity);
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
    }
    return canvas;
  }, [width, height, opacity]);

  const totalFrames = projectData.dimensions?.frames || 1;
  const totalSlices = projectData.dimensions?.slices || 1;

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Frame and Slice Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-4 p-4 bg-muted rounded-lg shadow-md">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-foreground">
            Frame: {currentFrame + 1} / {totalFrames}
          </label>
          <Slider
            value={[currentFrame]}
            onValueChange={(v) => onFrameChange(v[0])}
            min={0}
            max={totalFrames - 1}
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
            max={totalSlices - 1}
            step={1}
            disabled={totalSlices <= 1}
            className="[&>span:first-child]:border [&>span:first-child]:border-border"
          />
        </div>
      </div>

      {/* OPTIMIZED: Canvas with better event handling */}
      <div className="border-4 border-muted-foreground rounded-lg overflow-hidden">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {/* Background medical image */}
            {imageStatus === "loaded" && image && (
              <KonvaImage image={image} width={width} height={height} />
            )}
            
            {/* Render mask overlays efficiently */}
            {Object.entries(LABEL_COLORS).map(([label, color]) => {
              const maskKey = `mask_${currentFrame}_${currentSlice}_${label}`;
              const maskData = decodedMasks[maskKey];
              
              if (!maskData) return null;
              
              return (
                <KonvaImage
                  key={maskKey}
                  image={createMaskOverlay(maskData, color)}
                  width={width}
                  height={height}
                  opacity={opacity}
                />
              );
            })}
            
            {/* Current drawing with enhanced visual feedback */}
            {isDrawing.current && drawingPoints && (
              <Line
                points={drawingPoints}
                stroke={tool === "eraser" ? "#000" : LABEL_COLORS[activeLabel as keyof typeof LABEL_COLORS] || "#00f"}
                strokeWidth={brushSize}
                opacity={0.8}
                shadowBlur={hardnessToBlur[hardness]}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={tool === "eraser" ? "destination-out" : "source-over"}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}