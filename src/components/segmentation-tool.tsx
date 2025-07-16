"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Redo2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrawnLine {
  tool: 'brush' | 'eraser';
  points: number[];
  strokeWidth: number;
}

interface SegmentationToolProps {
  imageUrl: string;
  width: number;
  height: number;
}

export function SegmentationTool({ imageUrl, width, height }: SegmentationToolProps) {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(10);
  
  // History state for undo/redo
  const [history, setHistory] = useState<DrawnLine[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  const isDrawing = useRef(false);
  const [image] = useImage(imageUrl);

  const currentLines = history[historyStep];

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const newHistory = history.slice(0, historyStep + 1);
    const lastLineState = newHistory[newHistory.length - 1] || [];
    const newLine = { tool, points: [pos.x, pos.y], strokeWidth: brushSize };

    setHistory([...newHistory, [...lastLineState, newLine]]);
    setHistoryStep(newHistory.length);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    const lastHistoryState = history[history.length - 1];
    const lastLine = lastHistoryState[lastHistoryState.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Directly update the last history entry
    const newHistory = [...history];
    newHistory[newHistory.length - 1] = [...lastHistoryState];
    setHistory(newHistory);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  // Touch event handlers
  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const newHistory = history.slice(0, historyStep + 1);
    const lastLineState = newHistory[newHistory.length - 1] || [];
    const newLine = { tool, points: [pos.x, pos.y], strokeWidth: brushSize };

    setHistory([...newHistory, [...lastLineState, newLine]]);
    setHistoryStep(newHistory.length);
  };

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    const lastHistoryState = history[history.length - 1];
    const lastLine = lastHistoryState[lastHistoryState.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Directly update the last history entry
    const newHistory = [...history];
    newHistory[newHistory.length - 1] = [...lastHistoryState];
    setHistory(newHistory);
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
  };

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
    }
  }, [historyStep]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
    }
  }, [historyStep, history.length]);

  const handleClear = () => {
    setHistory([[]]);
    setHistoryStep(0);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Toolbar for controls */}
      <div className="flex items-center space-x-2 sm:space-x-4 mb-4 p-3 bg-muted rounded-lg shadow-md flex-wrap justify-center">
        <label className="text-foreground text-sm sm:text-base">Tool:</label>
        <button
          onClick={() => setTool('brush')}
          className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded ${tool === 'brush' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
        >
          Brush
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded ${tool === 'eraser' ? 'bg-destructive text-destructive-foreground' : 'bg-card'}`}
        >
          Eraser
        </button>
        <label htmlFor="brushSize" className="text-foreground text-sm sm:text-base">Size:</label>
        <input
          id="brushSize"
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="cursor-pointer w-20 sm:w-auto"
        />
        <span className="w-8 text-center text-sm sm:text-base">{brushSize}</span>
        
        {/* Undo/Redo Buttons */}
        <Button variant="secondary" size="sm" onClick={handleUndo} disabled={historyStep === 0}>
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>
        <Button variant="secondary" size="sm" onClick={handleRedo} disabled={historyStep === history.length - 1}>
          <Redo2 className="h-4 w-4" />
          Redo
        </Button>

        <button onClick={handleClear} className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded bg-secondary text-secondary-foreground">
          Clear
        </button>
      </div>

      {/* Konva Canvas */}
      <div className="border-4 border-muted-foreground rounded-lg overflow-hidden">
        <Stage
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Layer>
            <KonvaImage image={image} width={width} height={height} />
          </Layer>
          <Layer>
            {currentLines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === 'brush' ? '#df4b4b' : '#000000'}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}