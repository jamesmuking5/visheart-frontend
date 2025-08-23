"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Stage, Layer, Line, Image as KonvaImage, Rect } from "react-konva";
import { Play } from "lucide-react";
import type { KonvaEventObject } from "konva/lib/Node";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { decodeSegmentationMasks } from "@/lib/decode-RLE(test)";
import { cn } from "@/lib/utils";

// Import shared types and constants
import type { ImageCanvasProps, AnatomicalLabel } from "@/types/segmentation";
import { 
  LABEL_COLORS, 
  LABEL_NAMES,
  HARDNESS_TO_BLUR, 
  PERFORMANCE_CONSTANTS 
} from "@/types/segmentation";

// Import tar cache for background images
import { tarImageCache } from "@/lib/tar-image-cache";
import { useProject } from "@/context/ProjectContext";
import { segmentationApi } from "@/lib/api";

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
}: ImageCanvasProps) {
  // Get image loading method from ProjectContext
  const { getMRIImage, getMRIImageFilename, tarCacheReady, tarCacheError } = useProject();

  // Browser state management for manual segmentation
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [drawingPoints, setDrawingPoints] = useState<number[] | null>(null);
  const [imageLoadMethod, setImageLoadMethod] = useState<"tar" | "api" | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true); // Track if this is the first image load
  
  // Bounding box state for manual segmentation
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [finalBoundingBox, setFinalBoundingBox] = useState<number[] | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<AnatomicalLabel>(activeLabel);
  const [visibleLabelSet, setVisibleLabelSet] = useState<Set<AnatomicalLabel>>(new Set([activeLabel]));

  // Refs for performance
  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);

  // Memoized values from project data
  const { totalFrames, totalSlices } = useMemo(() => ({
    totalFrames: projectData.dimensions?.frames || 1,
    totalSlices: projectData.dimensions?.slices || 1,
  }), [projectData.dimensions]);

  // Sync selected label and visibleLabelSet when tool changes or active label changes
  useEffect(() => {
    if (tool === "rectangle") {
      setSelectedLabel(activeLabel);
      setVisibleLabelSet(new Set([activeLabel]));
    }
  }, [activeLabel, tool]);

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
      if (tarCacheReady && !tarCacheError) {
        try {
          console.log(`[ImageCanvas] Attempting to load from tar cache: frame ${currentFrame}, slice ${currentSlice}`);
          const imageUrl = await getMRIImage(currentFrame, currentSlice);
          
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
        console.log(`[ImageCanvas] Tar cache not ready yet (${tarCacheReady}), falling back to API`);
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
  }, [projectData.projectId, currentFrame, currentSlice, tarCacheReady, tarCacheError, isInitialLoad, getMRIImage]);

  // Additional effect to reload image when tar cache becomes ready (for initial load)
  useEffect(() => {
    if (tarCacheReady && imageStatus === "loading" && !image) {
      console.log(`[ImageCanvas] Tar cache became ready, triggering image reload`);
    }
  }, [tarCacheReady, imageStatus, image]);

  // Optimized drawing handlers with useCallback
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    return stage.getPointerPosition();
  }, []);

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;
    
    const pos = getRelativePointerPosition();
    if (!pos) return;
    
    if (tool === "rectangle") {
      // Start drawing rectangle
      setIsDrawingRect(true);
      setRectStart({ x: pos.x, y: pos.y });
      setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      setFinalBoundingBox(null);
    } else if (tool !== "select") {
      // Existing brush/eraser logic
      isDrawing.current = true;
      setDrawingPoints([pos.x, pos.y]);
    }
  }, [tool, getRelativePointerPosition]);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const point = getRelativePointerPosition();
    if (!point) return;
    
    if (tool === "rectangle" && isDrawingRect && rectStart) {
      // Update rectangle dimensions
      const width = point.x - rectStart.x;
      const height = point.y - rectStart.y;
      setCurrentRect({
        x: width >= 0 ? rectStart.x : point.x,
        y: height >= 0 ? rectStart.y : point.y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
    } else if (!isDrawing.current || tool === "select" || tool === "rectangle") {
      return;
    } else {
      // Existing brush/eraser logic
      setDrawingPoints(prev => prev ? [...prev, point.x, point.y] : [point.x, point.y]);
    }
  }, [tool, getRelativePointerPosition, isDrawingRect, rectStart]);

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
    if (tool === "rectangle" && isDrawingRect && currentRect) {
      // Finalize rectangle - convert to bounding box format [x_min, y_min, x_max, y_max]
      const bbox = [
        Math.round(currentRect.x),
        Math.round(currentRect.y),
        Math.round(currentRect.x + currentRect.width),
        Math.round(currentRect.y + currentRect.height)
      ];
      setFinalBoundingBox(bbox);
      setIsDrawingRect(false);
      console.log('Bounding box created:', bbox);
      return;
    }
    
    // Existing brush/eraser logic
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
    tool, isDrawingRect, currentRect,
    drawingPoints, currentFrame, currentSlice, activeLabel, 
    width, height, brushSize, drawBrushStroke, 
    onMaskUpdate, decodedMasks
  ]);

  // Manual segmentation function
  const startManualSegmentation = useCallback(async (selectedLabel: AnatomicalLabel) => {
    if (!finalBoundingBox || !projectData.projectId) {
      console.error('No bounding box or project ID available');
      alert('No bounding box or project ID available');
      return;
    }

    // Validate bounding box coordinates
    if (finalBoundingBox.length !== 4) {
      console.error('Invalid bounding box format:', finalBoundingBox);
      alert('Invalid bounding box format');
      return;
    }

    // Ensure coordinates are positive and within bounds
    const [x_min, y_min, x_max, y_max] = finalBoundingBox;
    if (x_min < 0 || y_min < 0 || x_max <= x_min || y_max <= y_min) {
      console.error('Invalid bounding box coordinates:', finalBoundingBox);
      alert('Invalid bounding box coordinates');
      return;
    }

    try {
      console.log('Starting manual segmentation with:');
      console.log('- Project ID:', projectData.projectId);
      console.log('- Bounding box:', finalBoundingBox);
      console.log('- Current frame:', currentFrame);
      console.log('- Current slice:', currentSlice);
      console.log('- Selected label:', selectedLabel);
      
      // Get the actual filename from the tar cache
      let imageName: string;
      
      if (tarCacheReady) {
        const actualFilename = await getMRIImageFilename(currentFrame, currentSlice);
        if (actualFilename) {
          imageName = actualFilename;
          console.log('- Using actual filename from tar cache:', imageName);
        } else {
          // Fallback to constructed filename
          imageName = `image_frame${currentFrame}_slice${currentSlice}.jpg`;
          console.log('- Tar cache filename not found, using fallback:', imageName);
        }
      } else {
        // Fallback to constructed filename when tar cache isn't ready
        imageName = `image_frame${currentFrame}_slice${currentSlice}.jpg`;
        console.log('- Tar cache not ready, using fallback filename:', imageName);
      }
      
      const requestData = {
        image_name: imageName,
        bbox: finalBoundingBox,
        segmentationName: `Manual ${LABEL_NAMES[selectedLabel]} - Frame ${currentFrame + 1}, Slice ${currentSlice + 1}`,
        segmentationDescription: `User-drawn bounding box segmentation for ${LABEL_NAMES[selectedLabel]}`
      };
      
      console.log('Request data:', requestData);
      
      const response = await segmentationApi.startManualSegmentation(
        projectData.projectId,
        requestData
      );
      
      console.log('Manual segmentation response:', response);

      // Defensive check for response and segmentations
      if (!response || !Array.isArray(response.segmentations) || response.segmentations.length === 0) {
        console.error("Manual segmentation API returned undefined or missing segmentations:", response);
        alert('No segmentation results returned from server');
        return;
      } 

      // Decode the new mask(s)
      const newMasks = response.segmentations;

      if (projectData?.dimensions) {
        const decodedResult = decodeSegmentationMasks(
          newMasks,
          projectData.dimensions.width,
          projectData.dimensions.height
        );

        console.log('Decoded new masks:', Object.keys(decodedResult.masks));

          // Remap manual mask key to selected anatomical label if needed
          const frame = currentFrame;
          const slice = currentSlice;
          const manualKey = `editable_frame_${frame}_slice_${slice}_manual`;
          const labelKey = `editable_frame_${frame}_slice_${slice}_${selectedLabel}`;
          let masksToUpdate = { ...decodedResult.masks };
          if (manualKey in masksToUpdate) {
            masksToUpdate[labelKey] = masksToUpdate[manualKey];
            delete masksToUpdate[manualKey];
          }
          // Merge with existing masks
          onMaskUpdate({ ...decodedMasks, ...masksToUpdate }, undefined);

        // Clear the bounding box after successful submission
        setFinalBoundingBox(null);
        setCurrentRect(null);

        alert('Manual segmentation completed successfully!');
      } else {
        console.error('Project dimensions not available for decoding');
        alert('Project dimensions not available for decoding masks');
      }
      
    } catch (error: any) {
      console.error('Error starting manual segmentation:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.detail?.detail || error.message || 'Unknown error occurred';
      alert(`Error starting manual segmentation: ${errorMessage}\n\nCheck console for more details.`);
    }
    
  }, [finalBoundingBox, projectData.projectId, currentFrame, currentSlice, tarCacheReady, getMRIImageFilename]);

  // Direct mask rendering - create ImageData directly from decodedMasks for each label
  // Render active mask last so it appears on top
  const allMaskElements = useMemo(() => {
    const maskElements: Array<{ label: string; image: HTMLImageElement; color: string }> = [];
    
    // Helper function to create mask element for a given label
    const createMaskElement = (label: string, color: string) => {
      if (!visibleMasks.has(label as AnatomicalLabel)) return null; // Only show visible masks
      if (tool === "rectangle" && !visibleLabelSet.has(label as AnatomicalLabel)) return null;
if (tool !== "rectangle" && !visibleMasks.has(label as AnatomicalLabel)) return null;
      const editableMaskKey = `editable_frame_${currentFrame}_slice_${currentSlice}_${label}`;
      const maskData = decodedMasks[editableMaskKey];
      
      if (!maskData || maskData.every((val: number) => val === 0)) {
        return null;
      }
      
      const maskWidth = projectData.dimensions?.width || width;
      const maskHeight = projectData.dimensions?.height || height;

      // Direct conversion: mask data to canvas
      const canvas = document.createElement("canvas");
      canvas.width = maskWidth;
      canvas.height = maskHeight;
      const ctx = canvas.getContext("2d")!;

      const imageData = ctx.createImageData(maskWidth, maskHeight);
            const [r, g, b] = [
              parseInt(color.slice(1, 3), 16),
              parseInt(color.slice(3, 5), 16),
              parseInt(color.slice(5, 7), 16)
            ];
            
            const data = imageData.data;
      
      // Simple 1:1 pixel mapping: direct array index to canvas pixel mapping
      for (let i = 0; i < maskData.length && i < (maskWidth * maskHeight); i++) {
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
      
      return {
        label,
        image: img,
        color
      };
    };
    
    // Render all mask layers for the current frame/slice.
    // If tool is 'rectangle', only show the mask for the selected label
    if (tool === "rectangle") {
      Object.entries(LABEL_COLORS).forEach(([label, color]) => {
        if (visibleLabelSet.has(label as AnatomicalLabel)) {
          const maskElement = createMaskElement(label, color);
          if (maskElement) {
            maskElements.push(maskElement);
          }
        }
      });
    } else {
      // Otherwise, show all masks as before
      Object.entries(LABEL_COLORS).forEach(([label, color]) => {
        if (label !== activeLabel) {
          const maskElement = createMaskElement(label, color);
          if (maskElement) {
            maskElements.push(maskElement);
          }
        }
      });
      // Render the active mask last so it appears on top of other masks
      if (LABEL_COLORS[activeLabel]) {
        const activeMaskElement = createMaskElement(activeLabel, LABEL_COLORS[activeLabel]);
        if (activeMaskElement) {
          maskElements.push(activeMaskElement);
        }
      }
    }
    
    console.log(`[ImageCanvas] Total mask elements found: ${maskElements.length}, active mask "${activeLabel}" rendered last`);
    return maskElements;
  }, [decodedMasks, currentFrame, currentSlice, width, height, opacity, visibleMasks, activeLabel, tool, visibleLabelSet]);

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
      <div className="border-4 border-muted-foreground overflow-hidden relative">
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
            {isDrawing.current && drawingPoints && tool !== "rectangle" && (
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
            
            {/* Rectangle Drawing Preview */}
            {tool === "rectangle" && currentRect && (
              <Rect
                x={currentRect.x}
                y={currentRect.y}
                width={currentRect.width}
                height={currentRect.height}
                stroke="#ff0000"
                strokeWidth={2}
                fill="rgba(255, 0, 0, 0.1)"
                dash={[5, 5]}
              />
            )}
            
            {/* Final Bounding Box */}
            {finalBoundingBox && (
              <Rect
                x={finalBoundingBox[0]}
                y={finalBoundingBox[1]}
                width={finalBoundingBox[2] - finalBoundingBox[0]}
                height={finalBoundingBox[3] - finalBoundingBox[1]}
                stroke="#00ff00"
                strokeWidth={3}
                fill="rgba(0, 255, 0, 0.1)"
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
            {!tarCacheReady && tarCacheError && (
              <span className="text-muted-foreground text-xs">(Cache error: {tarCacheError})</span>
            )}
            {!tarCacheReady && !tarCacheError && (
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

      {/* Bounding Box Controls */}
      {tool === "rectangle" && (
        <div className="mt-4 p-4 bg-muted rounded-lg border max-w-md mx-auto">
          <h3 className="text-sm font-medium mb-3">Bounding Box Segmentation</h3>
          {finalBoundingBox ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Bounding Box: [{finalBoundingBox.join(', ')}]
              </p>
              
              {/* Anatomical Label Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Select Anatomical Label for Segmentation:
                </label>
                <Select
                  value={selectedLabel}
                  onValueChange={(value) => {
                    setSelectedLabel(value as AnatomicalLabel);
                    setVisibleLabelSet(new Set([value as AnatomicalLabel]));
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABEL_COLORS).map(([key, color]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: color }} 
                          />
                          {LABEL_NAMES[key as AnatomicalLabel]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => startManualSegmentation(selectedLabel)}
                  className="flex-1 text-sm flex items-center"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Manual Segmentation
                </Button>
                <Button
                  onClick={() => {
                    setFinalBoundingBox(null);
                    setCurrentRect(null);
                  }}
                  variant="outline"
                  className="flex-1 text-sm"
                  size="sm"
                >
                  Clear Box
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Click and drag to draw a bounding box around the region of interest.
              </p>
              
              {/* Pre-select label before drawing */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Pre-select Anatomical Label:
                </label>
                <Select
                  value={selectedLabel}
                  onValueChange={(value) => {
                    setSelectedLabel(value as AnatomicalLabel);
                    setVisibleLabelSet(new Set([value as AnatomicalLabel]));
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABEL_COLORS).map(([key, color]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: color }} 
                          />
                          {LABEL_NAMES[key as AnatomicalLabel]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}