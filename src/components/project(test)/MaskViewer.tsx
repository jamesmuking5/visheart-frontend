"use client";
// Debug component to view masks
// Remove in production

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

interface MaskViewerProps {
  decodedMasks: Record<string, Uint8Array> | null;
  projectDimensions?: {
    width: number;
    height: number;
    slices?: number;
    frames?: number;
  };
}

export function MaskViewer({ decodedMasks, projectDimensions }: MaskViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedMask, setSelectedMask] = useState<string>("");
  const [showMask, setShowMask] = useState<boolean>(true);
  const [currentSlice, setCurrentSlice] = useState<number>(0);

  // New state for structured selection
  const [selectedFrame, setSelectedFrame] = useState<string>("");
  const [selectedSliceNum, setSelectedSliceNum] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  const maskKeys = useMemo(() => (decodedMasks ? Object.keys(decodedMasks) : []), [decodedMasks]);
  const totalSlices = projectDimensions?.slices || 1;

  // Parse mask names and organize by frame, slice, and class
  const parsedMasks = useMemo(() => {
    const parsed = maskKeys
      .map((maskKey) => {
        // Parse editable_frame_n_slice_n_class pattern
        const match = maskKey.match(/^editable_frame_(\d+)_slice_(\d+)_(.+)$/);
        if (match) {
          return {
            fullName: maskKey,
            frame: match[1],
            slice: match[2],
            class: match[3],
          };
        }
        return null;
      })
      .filter(Boolean);

    // Group by frame, slice, and class for dropdown options
    const frames = [...new Set(parsed.map((p) => p!.frame))].sort((a, b) => parseInt(a) - parseInt(b));
    const slices = [...new Set(parsed.map((p) => p!.slice))].sort((a, b) => parseInt(a) - parseInt(b));
    const classes = [...new Set(parsed.map((p) => p!.class))].sort();

    return {
      parsed,
      frames,
      slices,
      classes,
    };
  }, [maskKeys]);

  // Get current mask based on selections
  const currentMask = useMemo(() => {
    if (!selectedFrame || !selectedSliceNum || !selectedClass) return null;
    return parsedMasks.parsed.find((p) => p!.frame === selectedFrame && p!.slice === selectedSliceNum && p!.class === selectedClass);
  }, [selectedFrame, selectedSliceNum, selectedClass, parsedMasks.parsed]);

  // Update selectedMask when structured selection changes
  useEffect(() => {
    if (currentMask) {
      setSelectedMask(currentMask.fullName);
    }
  }, [currentMask]);

  // Initialize with first available options
  useEffect(() => {
    if (parsedMasks.frames.length > 0 && !selectedFrame) {
      setSelectedFrame(parsedMasks.frames[0]);
    }
    if (parsedMasks.slices.length > 0 && !selectedSliceNum) {
      setSelectedSliceNum(parsedMasks.slices[0]);
    }
    if (parsedMasks.classes.length > 0 && !selectedClass) {
      setSelectedClass(parsedMasks.classes[0]);
    }
  }, [parsedMasks.frames, parsedMasks.slices, parsedMasks.classes, selectedFrame, selectedSliceNum, selectedClass]);

  // Render mask on canvas
  useEffect(() => {
    if (!decodedMasks || !selectedMask || !projectDimensions || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = projectDimensions;
    // Step 1: Try inverting canvas dimensions (as masks are stored in inverted format from backend)
    canvas.width = height; // INVERTED
    canvas.height = width; // INVERTED

    // Clear canvas
    ctx.clearRect(0, 0, height, width); // Updated to match canvas dims

    if (!showMask) return;

    const maskData = decodedMasks[selectedMask];
    if (!maskData) return;

    // Create image data for the mask (with inverted dimensions)
    const imageData = ctx.createImageData(height, width); // INVERTED
    const data = imageData.data;

    // Calculate offset for current slice if multi-slice
    const sliceOffset = currentSlice * width * height;

    // Convert mask data to RGBA (keeping same data indexing for now)
    for (let i = 0; i < width * height; i++) {
      const maskIndex = sliceOffset + i;
      const pixelValue = maskIndex < maskData.length ? maskData[maskIndex] : 0;
      const dataIndex = i * 4;

      if (pixelValue > 0) {
        // Show mask in semi-transparent red
        data[dataIndex] = 255; // R
        data[dataIndex + 1] = 0; // G
        data[dataIndex + 2] = 0; // B
        data[dataIndex + 3] = 128; // A (semi-transparent)
      } else {
        // Transparent for background
        data[dataIndex] = 0;
        data[dataIndex + 1] = 0;
        data[dataIndex + 2] = 0;
        data[dataIndex + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [decodedMasks, selectedMask, projectDimensions, showMask, currentSlice]);

  if (!decodedMasks || maskKeys.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mask Viewer</CardTitle>
          <CardDescription>No masks available to display</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mask Viewer</span>
          <Button variant="outline" size="sm" onClick={() => setShowMask(!showMask)} className="flex items-center gap-2">
            {showMask ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showMask ? "Hide" : "Show"}
          </Button>
        </CardTitle>
        <CardDescription>
          {maskKeys.length} mask(s) available • {parsedMasks.frames.length} frames • {parsedMasks.slices.length} slices • {parsedMasks.classes.length} classes
          {projectDimensions && ` • ${projectDimensions.width}×${projectDimensions.height}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Structured Mask Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Frame:</label>
            <Select value={selectedFrame} onValueChange={setSelectedFrame}>
              <SelectTrigger>
                <SelectValue placeholder="Select frame" />
              </SelectTrigger>
              <SelectContent>
                {parsedMasks.frames.map((frame) => (
                  <SelectItem key={frame} value={frame}>
                    Frame {frame}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slice:</label>
            <Select value={selectedSliceNum} onValueChange={setSelectedSliceNum}>
              <SelectTrigger>
                <SelectValue placeholder="Select slice" />
              </SelectTrigger>
              <SelectContent>
                {parsedMasks.slices.map((slice) => (
                  <SelectItem key={slice} value={slice}>
                    Slice {slice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Class:</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {parsedMasks.classes.map((classType) => (
                  <SelectItem key={classType} value={classType}>
                    {classType.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Slice Navigation (if multi-slice) */}
        {totalSlices > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentSlice(Math.max(0, currentSlice - 1))} disabled={currentSlice === 0}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Badge variant="secondary">
              Slice {currentSlice + 1} of {totalSlices}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setCurrentSlice(Math.min(totalSlices - 1, currentSlice + 1))} disabled={currentSlice === totalSlices - 1}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Canvas Display */}
        <div className="flex justify-center">
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <canvas ref={canvasRef} className="max-w-full h-auto border border-gray-200 dark:border-gray-700" style={{ imageRendering: "pixelated" }} />
          </div>
        </div>

        {/* Mask Info */}
        {currentMask && selectedMask && decodedMasks[selectedMask] && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Selected: <span className="font-mono">{selectedMask}</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              <p>
                Frame: <span className="font-medium">{selectedFrame}</span>
              </p>
              <p>
                Slice: <span className="font-medium">{selectedSliceNum}</span>
              </p>
              <p>
                Class: <span className="font-medium">{selectedClass.toUpperCase()}</span>
              </p>
            </div>
            <p>Data size: {decodedMasks[selectedMask].length.toLocaleString()} pixels</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
