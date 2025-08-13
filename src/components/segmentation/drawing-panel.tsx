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
import { cn } from "@/lib/utils";

// Import shared types and constants
import type { 
  DrawingPanelProps, 
  AnatomicalLabel,
  DrawingTool,
  BrushHardness 
} from "@/types/segmentation";
import { 
  LABEL_COLORS, 
  LABEL_NAMES,
  DRAWING_TOOLS,
  BRUSH_HARDNESS
} from "@/types/segmentation";

// Memoized tool configuration
const TOOL_CONFIG: Record<DrawingTool, { icon: React.ComponentType<any>; label: string; shortcut?: string }> = {
  select: { icon: MousePointer2, label: 'Select' },
  brush: { icon: Brush, label: 'Brush', shortcut: 'B' },
  eraser: { icon: Eraser, label: 'Eraser', shortcut: 'E' },
  label: { icon: Type, label: 'Label' },
  rectangle: { icon: Square, label: 'Rectangle' },
  circle: { icon: Circle, label: 'Circle' },
  measure: { icon: Ruler, label: 'Measure' },
  zoom: { icon: Search, label: 'Zoom' },
  pan: { icon: Move, label: 'Pan' },
} as const;

// Memoized tool grid layout
const TOOL_GRID_LAYOUT: DrawingTool[][] = [
  ['select', 'brush', 'eraser'],
  ['label', 'rectangle', 'circle'],
  ['measure', 'zoom', 'pan']
];

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

  // Memoized label selection handler
  const handleLabelChange = React.useCallback((value: string) => {
    if (value && value in LABEL_COLORS) {
      setActiveLabel(value as AnatomicalLabel);
    }
  }, [setActiveLabel]);

  // Memoized tool selection handler
  const handleToolChange = React.useCallback((value: string) => {
    if (value && DRAWING_TOOLS.includes(value as DrawingTool)) {
      setTool(value as DrawingTool);
    }
  }, [setTool]);

  // Memoized hardness handler
  const handleHardnessChange = React.useCallback((value: string) => {
    if (value && BRUSH_HARDNESS.includes(value as BrushHardness)) {
      setHardness(value as BrushHardness);
    }
  }, [setHardness]);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Label Selection */}
      <div>
        <div className="text-lg font-semibold mb-4 text-foreground">Active Label</div>
        <ToggleGroup
          type="single"
          value={activeLabel}
          onValueChange={handleLabelChange}
          aria-label="Anatomical Label"
          className="flex rounded-lg border border-border overflow-hidden w-full"
        >
          {Object.entries(LABEL_COLORS).map(([key, color]) => (
            <ToggleGroupItem
              key={key}
              value={key}
              aria-label={LABEL_NAMES[key as AnatomicalLabel]}
              variant="outline" 
              className={cn(
                "flex-1 flex items-center justify-center px-4 py-2",
                "font-semibold transition-colors",
                "data-[state=on]:bg-opacity-20 data-[state=on]:border-current",
                "border-r border-border last:border-r-0",
                "focus:z-10"
              )}
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
      
      {/* Tool Selection with Grid Layout */}
      <div>
        <div className="text-lg font-semibold mb-4 text-foreground">Drawing Tools</div>
        <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
          {TOOL_GRID_LAYOUT.flat().map((toolKey) => {
            const config = TOOL_CONFIG[toolKey];
            const IconComponent = config.icon;
            
            return (
              <button
                key={toolKey}
                onClick={() => setTool(toolKey)}
                aria-label={`${config.label}${config.shortcut ? ` (${config.shortcut})` : ''}`}
                className={cn(
                  "h-20 w-20 flex flex-col items-center justify-center rounded-lg",
                  "border-2 border-border transition-colors",
                  "hover:bg-primary/10",
                  "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring",
                  tool === toolKey 
                    ? "bg-primary text-primary-foreground shadow-lg border-primary" 
                    : "text-foreground"
                )}
              >
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brush Settings - Only show for relevant tools */}
      {(tool === 'brush' || tool === 'eraser') && (
        <div className="bg-muted rounded-xl p-5 shadow-inner">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Brush Settings</h3>
          
          {/* Size */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Brush Size
              </label>
              <span className="text-sm font-medium text-foreground">
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Opacity
              </label>
              <span className="text-sm font-medium text-foreground">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <Slider
              value={[opacity * 100]}
              onValueChange={(v) => setOpacity(v[0] / 100)}
              min={10}
              max={100}
              step={1}
              className="[&>span:first-child]:border [&>span:first-child]:border-border"
            />
          </div>

          {/* Hardness */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Brush Hardness
            </label>
            <ToggleGroup
              type="single"
              value={hardness}
              onValueChange={handleHardnessChange}
              className="flex rounded-xl border border-border overflow-hidden w-full"
              aria-label="Brush Hardness"
            >
              {BRUSH_HARDNESS.map((level) => (
                <ToggleGroupItem
                  key={level}
                  value={level}
                  className={cn(
                    "flex-1 py-3 text-sm font-semibold transition-colors",
                    "bg-transparent hover:bg-primary/20",
                    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                    "data-[state=off]:text-foreground border-0",
                    "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      )}

      {/* Actions */}
      <div>
        <div className="text-lg font-semibold mb-4 text-foreground">Actions</div>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={handleUndo}
            disabled={!canUndo}
            className="w-full justify-start"
            aria-label="Undo last action (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Undo
            <span className="text-xs text-muted-foreground ml-auto">Ctrl+Z</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRedo}
            disabled={!canRedo}
            className="w-full justify-start"
            aria-label="Redo last action (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4 mr-2" />
            Redo
            <span className="text-xs text-muted-foreground ml-auto">Ctrl+Y</span>
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={!canClear}
            className="w-full justify-start"
            aria-label="Clear current mask (Delete)"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Current
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