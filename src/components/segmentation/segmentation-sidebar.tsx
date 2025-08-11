// src/components/segmentation/segmentation-sidebar.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Layers, Brush, BarChart2, History, LayoutGrid, Settings, Save, Undo2, Redo2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectData } from "@/types/project(test)";
import { DrawingPanel } from './drawing-panel';
import { HistoryPanel } from './history-panel';

interface SegmentationSidebarProps {
  projectData: ProjectData;
  decodedMasks: Record<string, Uint8Array>;
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
  hasUnsavedChanges: boolean;
  onSave: () => void;
  currentFrame: number;
  currentSlice: number;
  totalFrames: number;
  totalSlices: number;
  onFrameChange?: (frame: number) => void;
  onSliceChange?: (slice: number) => void;
  // History Props
  historyData: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: number;
    frameSlice?: string;
    checkpointNumber?: number;
  }>;
  currentHistoryStep?: number;
  onHistoryStepChange?: (step: number) => void;
  onHistoryClear?: () => void;
  onHistoryExport?: () => void;
  onHistoryCheckpoint?: () => void;
}

const NAV_ITEMS = [
  { key: 'masks', icon: <Layers className="w-5 h-5" />, label: 'Masks' },
  { key: 'brush', icon: <Brush className="w-5 h-5" />, label: 'Brush' },
  { key: 'stats', icon: <BarChart2 className="w-5 h-5" />, label: 'Stats' },
  { key: 'history', icon: <History className="w-5 h-5" />, label: 'History' },
  { key: 'compare', icon: <LayoutGrid className="w-5 h-5" />, label: 'Compare' },
  { key: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
];

// Masks Panel Component
function MasksPanel({
  decodedMasks,
  currentFrame,
  currentSlice,
  activeLabel,
  setActiveLabel
}: {
  decodedMasks: Record<string, Uint8Array>;
  currentFrame: number;
  currentSlice: number;
  activeLabel: string;
  setActiveLabel: (label: string) => void;
}) {
  const LABEL_COLORS = {
    'lvc': '#ef4444', // Red
    'rv': '#3b82f6',  // Blue  
    'myo': '#22c55e'  // Green
  };

  const currentMasks = Object.entries(decodedMasks).filter(([key]) =>
    key.includes(`_${currentFrame}_${currentSlice}_`)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Segmentation Masks</h2>
      
      {/* Current Frame/Slice Info */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground mb-2">
          Frame {currentFrame + 1}, Slice {currentSlice + 1}
        </div>
        <div className="text-xs text-muted-foreground">
          {currentMasks.length} mask(s) available
        </div>
      </div>

      {/* Available Masks */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Available Masks</h3>
        {currentMasks.length > 0 ? (
          currentMasks.map(([maskKey, maskData]) => {
            const label = maskKey.split('_').pop() || 'Unknown';
            const color = LABEL_COLORS[label as keyof typeof LABEL_COLORS] || '#gray';
            const filledPixels = maskData.filter(pixel => pixel > 0).length;
            const isActive = activeLabel === label;

            return (
              <div 
                key={maskKey} 
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  isActive ? "bg-primary/10 border-primary/30" : "bg-background border-border hover:bg-muted/50"
                )}
                onClick={() => setActiveLabel(label)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{label.toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground">
                      {filledPixels.toLocaleString()} pixels
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            No masks found for current frame/slice
          </div>
        )}
      </div>

      {/* Mask Actions */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Mask Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full text-xs">
            Import Mask
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs">
            Export Current
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs">
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}

// Stats Panel Component
function StatsPanel({
  decodedMasks,
  currentFrame,
  currentSlice,
  projectData
}: {
  decodedMasks: Record<string, Uint8Array>;
  currentFrame: number;
  currentSlice: number;
  projectData: ProjectData;
}) {
  const currentMasks = Object.entries(decodedMasks).filter(([key]) =>
    key.includes(`_${currentFrame}_${currentSlice}_`)
  );

  const calculateMaskStats = (mask: Uint8Array) => {
    const totalPixels = mask.length;
    const filledPixels = mask.filter(pixel => pixel > 0).length;
    const percentage = totalPixels > 0 ? (filledPixels / totalPixels) * 100 : 0;
    return { totalPixels, filledPixels, percentage };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Statistics</h2>
      
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Frame {currentFrame + 1}, Slice {currentSlice + 1}
        </div>
        
        {currentMasks.length > 0 ? (
          currentMasks.map(([maskKey, maskData]) => {
            const stats = calculateMaskStats(maskData);
            const label = maskKey.split('_').pop() || 'Unknown';
            
            return (
              <div key={maskKey} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm uppercase">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {stats.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.filledPixels.toLocaleString()} / {stats.totalPixels.toLocaleString()} pixels
                </div>
                <div className="w-full bg-background rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full bg-primary" 
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            No masks found for current frame/slice
          </div>
        )}
      </div>

      {/* Overall Project Stats */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Project Info</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>Dimensions: {projectData.dimensions?.width || 0} × {projectData.dimensions?.height || 0}</div>
          <div>Total Frames: {projectData.dimensions?.frames || 0}</div>
          <div>Total Slices: {projectData.dimensions?.slices || 0}</div>
          <div>Total Masks: {Object.keys(decodedMasks).length}</div>
        </div>
      </div>
    </div>
  );
}

// Compare Panel Component
function ComparePanel({
  decodedMasks,
  currentFrame,
  currentSlice
}: {
  decodedMasks: Record<string, Uint8Array>;
  currentFrame: number;
  currentSlice: number;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Compare Masks</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl mb-2">🔍</div>
          <div className="text-sm font-medium">Comparison Tools</div>
          <div className="text-xs text-muted-foreground mt-1">
            Compare different segmentation results
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full text-xs">
            AI vs Manual
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs">
            Frame Comparison
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs">
            Overlay Mode
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Comparison Metrics</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>Dice Coefficient: Coming Soon</div>
            <div>IoU Score: Coming Soon</div>
            <div>Pixel Accuracy: Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Panel Component
function SettingsPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Display</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Show Grid</span>
              <input type="checkbox" className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Show Rulers</span>
              <input type="checkbox" className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Show Labels</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-2">Performance</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hardware Acceleration</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auto-save</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-2">Export</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Export Settings
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs">
              Reset to Default
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SegmentationSidebar({
  projectData,
  decodedMasks,
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
  hasUnsavedChanges,
  onSave,
  currentFrame,
  currentSlice,
  totalFrames,
  totalSlices,
  onFrameChange,
  onSliceChange,
  // History Props
  historyData,
  currentHistoryStep = 0,
  onHistoryStepChange,
  onHistoryClear,
  onHistoryExport,
  onHistoryCheckpoint
}: SegmentationSidebarProps) {
  const [activeTab, setActiveTab] = useState('brush');

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar)] rounded-xl border border-[var(--sidebar-border)] shadow-sm">
      {/* Top Navigation Bar - Icons Only */}
      <div className="flex items-center justify-center gap-3 px-2 py-2 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-primary)] rounded-t-xl">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            className={cn(
              "flex items-center justify-center p-2 rounded-lg transition-all hover:scale-105",
              activeTab === item.key
                ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] shadow-sm"
                : "hover:bg-primary/20 text-[var(--sidebar-foreground)]"
            )}
            onClick={() => setActiveTab(item.key)}
            aria-label={item.label}
            title={item.label}
            type="button"
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {activeTab === 'masks' && (
          <MasksPanel
            decodedMasks={decodedMasks}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
            activeLabel={activeLabel}
            setActiveLabel={setActiveLabel}
          />
        )}

        {activeTab === 'brush' && (
          <DrawingPanel
            tool={tool}
            setTool={setTool}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            opacity={opacity}
            setOpacity={setOpacity}
            hardness={hardness}
            setHardness={setHardness}
            activeLabel={activeLabel}
            setActiveLabel={setActiveLabel}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            handleClear={handleClear}
            canUndo={canUndo}
            canRedo={canRedo}
            canClear={canClear}
          />
        )}

        {activeTab === 'stats' && (
          <StatsPanel
            decodedMasks={decodedMasks}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
            projectData={projectData}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPanel
            onClear={onHistoryClear}
            onExport={onHistoryExport}
            onCheckpoint={onHistoryCheckpoint}
            onHistoryStepChange={onHistoryStepChange}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
            currentHistoryStep={currentHistoryStep}
            historyData={historyData}
          />
        )}

        {activeTab === 'compare' && (
          <ComparePanel
            decodedMasks={decodedMasks}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
          />
        )}

        {activeTab === 'settings' && <SettingsPanel />}
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-[var(--sidebar-border)]">
        <Button 
          onClick={onSave}
          disabled={!hasUnsavedChanges}
          className="w-full"
          variant={hasUnsavedChanges ? "default" : "secondary"}
        >
          <Save className="h-4 w-4 mr-2" />
          {hasUnsavedChanges ? "Save Changes" : "No Changes"}
        </Button>
      </div>
    </div>
  );
}