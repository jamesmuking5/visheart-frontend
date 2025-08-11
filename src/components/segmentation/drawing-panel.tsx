"use client";

import React from "react"; 
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Undo2, 
  Redo2, 
  Trash2, 
  Brush, 
  Eraser, 
  MousePointer2, 
  Type, 
  Square, 
  Circle, 
  Ruler, 
  Search, 
  Move 
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface DrawingPanelProps {
  tool: string;
  setTool: (tool: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  hardness: "soft" | "medium" | "hard";
  setHardness: (h: "soft" | "medium" | "hard") => void; 
  activeLabel: string;
  setActiveLabel: (label: string) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canClear: boolean;
}

const LABEL_COLORS = {
  'lvc': '#ef4444', // Red
  'rv': '#3b82f6',  // Blue  
  'myo': '#22c55e'  // Green
};

const LABEL_NAMES = {
  'lvc': 'Left Ventricle Cavity',
  'rv': 'Right Ventricle',
  'myo': 'Myocardium'
};

export function DrawingPanel({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  opacity,
  setOpacity,
  hardness,
  setHardness,
  activeLabel,
  setActiveLabel,
  handleUndo,
  handleRedo,
  handleClear,
  canUndo,
  canRedo,
  canClear,
}: DrawingPanelProps) {  

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Label Selection */}
      <div>
        <div className="text-lg font-semibold mb-4 text-foreground">Active Label</div>
        <div className="flex gap-2 justify-center">
          <ToggleGroup
            type="single"
            value={activeLabel}
            onValueChange={(value: string) => value && setActiveLabel(value)}
            aria-label="Anatomical Label"
            className="flex rounded-lg border border-border overflow-hidden w-full"
          >
            {Object.entries(LABEL_COLORS).map(([key, color]) => (
              <ToggleGroupItem
                key={key}
                value={key}
                aria-label={LABEL_NAMES[key as keyof typeof LABEL_NAMES]}
                variant="outline"
                className={`
                  flex-1 flex items-center justify-center px-4 py-2
                  font-semibold
                  data-[state=on]:bg-opacity-20
                  data-[state=on]:border-current
                  border-r border-border last:border-r-0
                  focus:z-10
                `}
                style={{ 
                  color: activeLabel === key ? color : undefined,
                  backgroundColor: activeLabel === key ? `${color}20` : undefined,
                  borderColor: activeLabel === key ? color : undefined
                }}
              >
                <span 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                  style={{ backgroundColor: color }} 
                />
                {key.toUpperCase()}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      
      {/* Tool Selection - Enhanced with all tools */}
      <div>
        <div className="text-lg font-semibold mb-4 text-foreground">Drawing Tools</div>
        <div className="flex justify-center w-full">
          <ToggleGroup
            type="single"
            value={tool}
            onValueChange={(value: string) => value && setTool(value)}
            aria-label="Tool"
            className="grid grid-cols-3 gap-2 mb-6 max-w-xl"
          >
            {/* Row 1: Selection, Brush, Eraser */}
            <ToggleGroupItem
              value="select"
              aria-label="Select"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <MousePointer2 style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Select</span>
            </ToggleGroupItem>
            
            <ToggleGroupItem
              value="brush"
              aria-label="Brush"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <Brush style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Brush</span>
            </ToggleGroupItem>
            
            <ToggleGroupItem
              value="eraser"
              aria-label="Eraser"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <Eraser style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Eraser</span>
            </ToggleGroupItem>

            {/* Row 2: Label, Rectangle, Circle */}
            <ToggleGroupItem
              value="label"
              aria-label="Label"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <Type style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Label</span>
            </ToggleGroupItem>
            
            <ToggleGroupItem
              value="rectangle"
              aria-label="Rectangle"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <Square style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Rectangle</span>
            </ToggleGroupItem>
            
            <ToggleGroupItem
              value="circle"
              aria-label="Circle"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <Circle style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Circle</span>
            </ToggleGroupItem>

            {/* Row 3: Measure, Zoom, Pan */}
            <ToggleGroupItem
              value="measure"
              aria-label="Measure"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <Ruler style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Measure</span>
            </ToggleGroupItem>
            
            <ToggleGroupItem
              value="zoom"
              aria-label="Zoom"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <Search style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Zoom</span>
            </ToggleGroupItem>
            
            <ToggleGroupItem
              value="pan"
              aria-label="Pan"
              className={`
                h-20 w-20 flex flex-col items-center justify-center rounded-lg
                border-2 border-border
                transition-colors
                hover:bg-primary/10
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg data-[state=on]:border-primary
                data-[state=off]:text-foreground
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              <Move style={{ width: "22px", height: "22px" }} className="mb-1" />
              <span className="text-sm">Pan</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Enhanced Brush Settings Box */}
      <div className="bg-muted rounded-xl p-5 shadow-inner mb-4">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Brush Settings</h3>
        
        {/* Size */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Brush Size
            </label>
            <span className="text-sm font-medium text-foreground mb-2 block">
              {brushSize}px
            </span>
          </div>
          <Slider
            value={[brushSize]}
            onValueChange={(v) => setBrushSize(v[0])}
            min={1}
            max={50}
            step={1}
            className="[&>span:first-child]:border [&>span:first-child]:border-border"
          />
        </div>

        {/* Opacity */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Opacity
            </label>
            <span className="text-sm font-medium text-foreground mb-2 block">
              {`${Math.round((opacity ?? 1) * 100)}%`}
            </span>
          </div>
          <Slider
            value={[typeof opacity === "number" ? opacity * 100 : 100]}
            onValueChange={(v) => setOpacity((v[0] ?? 100) / 100)}
            min={0}
            max={100}
            step={1}
            className="[&>span:first-child]:border [&>span:first-child]:border-border"
          />
        </div>

        {/* Enhanced Hardness */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">Brush Hardness</label>
          <ToggleGroup
            type="single"
            value={hardness}
            onValueChange={(v: string) => v && setHardness(v as "soft" | "medium" | "hard")}
            className="flex justify-center border border-border rounded-xl overflow-hidden w-full"
            aria-label="Brush Hardness"
          >
            <ToggleGroupItem
              value="soft"
              className={`
                flex-1 py-3 text-sm font-semibold transition-colors
                bg-transparent
                hover:bg-primary/20
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
                data-[state=off]:text-foreground
                border-0
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              Soft
            </ToggleGroupItem>
            <ToggleGroupItem
              value="medium"
              className={`
                flex-1 py-3 text-sm font-semibold transition-colors
                bg-transparent
                hover:bg-primary/20
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
                data-[state=off]:text-foreground
                border-0
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              Medium
            </ToggleGroupItem>
            <ToggleGroupItem
              value="hard"
              className={`
                flex-1 py-3 text-sm font-semibold transition-colors
                bg-transparent
                hover:bg-primary/20
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
                data-[state=off]:text-foreground
                border-0
                focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring
              `}
            >
              Hard
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Enhanced Actions */}
      <div>
        <div className="text-lg font-semibold mb-4 text-foreground">Actions</div>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="w-full justify-start"
          >
            <Undo2 className="w-5 h-5" />
            <span className="ml-2">Undo</span>
            <span className="text-xs text-muted-foreground ml-auto">Ctrl+Z</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="w-full justify-start"
          >
            <Redo2 className="w-5 h-5" />
            <span className="ml-2">Redo</span>
            <span className="text-xs text-muted-foreground ml-auto">Ctrl+Y</span>
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={!canClear}
            title="Clear All (Del)"
            className="w-full justify-start"
          >
            <Trash2 className="w-5 h-5" />
            <span className="ml-2">Clear All</span>
            <span className="text-xs text-muted-foreground ml-auto">Del</span>
          </Button>
        </div>
      </div>

      {/* Tool Tips */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Tool Tips</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• <strong>Select:</strong> Move and select objects</div>
          <div>• <strong>Brush:</strong> Paint segmentation masks</div>
          <div>• <strong>Eraser:</strong> Remove mask pixels</div>
          <div>• <strong>Shapes:</strong> Draw geometric annotations</div>
          <div>• <strong>Measure:</strong> Calculate distances</div>
          <div>• <strong>Zoom/Pan:</strong> Navigate the canvas</div>
        </div>
      </div>
    </div>
  );
}