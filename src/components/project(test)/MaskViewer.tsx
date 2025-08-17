"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const maskKeys = useMemo(() => (decodedMasks ? Object.keys(decodedMasks) : []), [decodedMasks]);
  const totalSlices = projectDimensions?.slices || 1;

  // Initialize with first mask if available
  useEffect(() => {
    if (maskKeys.length > 0 && !selectedMask) {
      setSelectedMask(maskKeys[0]);
    }
  }, [maskKeys, selectedMask]);

  // Render mask on canvas
  useEffect(() => {
    if (!decodedMasks || !selectedMask || !projectDimensions || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = projectDimensions;
    // Step 1: Try inverting canvas dimensions
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
          {maskKeys.length} mask(s) available • {projectDimensions?.width}×{projectDimensions?.height}
          {totalSlices > 1 && ` • ${totalSlices} slices`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mask Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Mask:</label>
          <div className="flex flex-wrap gap-2">
            {maskKeys.map((maskKey) => (
              <Button key={maskKey} variant={selectedMask === maskKey ? "default" : "outline"} size="sm" onClick={() => setSelectedMask(maskKey)}>
                {maskKey}
              </Button>
            ))}
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
        {selectedMask && decodedMasks[selectedMask] && (
          <div className="text-sm text-muted-foreground">
            <p>
              Selected: <span className="font-mono">{selectedMask}</span>
            </p>
            <p>Data size: {decodedMasks[selectedMask].length.toLocaleString()} pixels</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
