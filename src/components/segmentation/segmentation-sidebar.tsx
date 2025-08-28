"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Brush, BarChart2, History, LayoutGrid, Settings, Save, Undo2, Redo2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import shared types and constants
import type { SegmentationSidebarProps, AnatomicalLabel } from "@/types/segmentation";
import { LABEL_COLORS, LABEL_NAMES } from "@/types/segmentation";
import { DrawingPanel } from './drawing-panel';
import { HistoryPanel } from './history-panel';

// Navigation configuration with proper typing
const NAV_ITEMS = [
  { key: 'masks', icon: Layers, label: 'Masks' },
  { key: 'brush', icon: Brush, label: 'Brush' },
  { key: 'stats', icon: BarChart2, label: 'Stats' },
  { key: 'history', icon: History, label: 'History' },
  { key: 'compare', icon: LayoutGrid, label: 'Compare' },
  { key: 'settings', icon: Settings, label: 'Settings' },
] as const;

type TabKey = typeof NAV_ITEMS[number]['key'];

// Masks Panel Component with proper typing
const MasksPanel = React.memo(({
  decodedMasks,
  currentFrame,
  currentSlice,
  activeLabel,
  setActiveLabel,
  visibleMasks,
  setVisibleMasks
}: {
  decodedMasks: Record<string, Uint8Array>;
  currentFrame: number;
  currentSlice: number;
  activeLabel: AnatomicalLabel;
  setActiveLabel: (label: AnatomicalLabel) => void;
  visibleMasks: Set<AnatomicalLabel>;
  setVisibleMasks: (masks: Set<AnatomicalLabel>) => void;
}) => {
  // Memoized current masks calculation
  const currentMasks = useMemo(() => {
    const maskMap: Record<string, [string, Uint8Array]> = {};

    Object.entries(decodedMasks).forEach(([key, maskData]) => {
      if (
        key.startsWith("editable_") && 
        key.includes(`_frame_${currentFrame}_slice_${currentSlice}_`)
      ) {
        const label = key.split("_").pop() || "unknown";
        maskMap[label] = [key, maskData];
      }
    });

    return Object.values(maskMap);
  }, [decodedMasks, currentFrame, currentSlice]);

  // Memoized label click handler
  const handleLabelClick = useCallback((label: string) => {
    if (label in LABEL_COLORS) {
      setActiveLabel(label as AnatomicalLabel);
    }
  }, [setActiveLabel]);

  const toggleMaskVisibility = useCallback((label: AnatomicalLabel) => {
    const newVisibleMasks = new Set(visibleMasks);
    if (newVisibleMasks.has(label)) {
      newVisibleMasks.delete(label);
    } else {
      newVisibleMasks.add(label);
    }
    setVisibleMasks(newVisibleMasks);
  }, [visibleMasks, setVisibleMasks]);

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
            const label = maskKey.split('_').pop() || 'unknown';
            const anatomicalLabel = label as AnatomicalLabel;
            const color = LABEL_COLORS[anatomicalLabel] || '#gray';
            const labelName = LABEL_NAMES[anatomicalLabel] || label.toUpperCase();
            const filledPixels = maskData.filter(pixel => pixel > 0).length;
            const isActive = activeLabel === label;
            const isVisible = visibleMasks.has(anatomicalLabel);

            return (
              <div 
                key={maskKey} 
                className={cn(
                  "p-3 rounded-lg border flex items-center gap-3 transition-all cursor-pointer",
                  isActive ? "bg-primary/10 border-primary/30" : "bg-background border-border hover:bg-muted/50"
                )}
                onClick={() => handleLabelClick(label)} 
                tabIndex={0}
                role="button"
                aria-label={`Select ${labelName} as active mask`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleLabelClick(label); }}
              >
                {/* Radio button for active mask */}
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    isActive 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  {isActive && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                </span>

                {/* Mask info */}
                <div className="flex-1">
                  <div className="font-medium text-sm">{labelName}</div>
                  <div className="text-xs text-muted-foreground">{filledPixels.toLocaleString()} pixels</div>
                </div>

                {/* Mask color indicator */}
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                
                {/* Eye icon for visibility toggle */}
                <button
                  onClick={e => { e.stopPropagation(); toggleMaskVisibility(anatomicalLabel); }}
                  className={cn(
                    "p-1 rounded hover:bg-muted",
                    isVisible ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-label={`${isVisible ? 'Hide' : 'Show'} ${labelName} mask`}
                  tabIndex={0}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
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
});

MasksPanel.displayName = 'MasksPanel';

// Stats Panel Component with memoization
const StatsPanel = React.memo(({
  decodedMasks,
  currentFrame,
  currentSlice,
  projectData
}: {
  decodedMasks: Record<string, Uint8Array>;
  currentFrame: number;
  currentSlice: number;
  projectData: any; // Using ProjectData from shared types
}) => {
  // Memoized current masks and stats calculation
  const { currentMasks, projectStats } = useMemo(() => {
    const masks = Object.entries(decodedMasks).filter(
      ([key]) =>
        key.startsWith("editable_") &&
        key.includes(`_frame_${currentFrame}_slice_${currentSlice}_`)
    );

    const stats = {
      totalMasks: Object.keys(decodedMasks).filter((k) =>
        k.startsWith("editable_")
      ).length,
      width: projectData.dimensions?.width || 0,
      height: projectData.dimensions?.height || 0,
      frames: projectData.dimensions?.frames || 0,
      slices: projectData.dimensions?.slices || 0,
    };

    return { currentMasks: masks, projectStats: stats };
  }, [decodedMasks, currentFrame, currentSlice, projectData]);

  // Memoized mask stats calculator
  const calculateMaskStats = useCallback((mask: Uint8Array) => {
    const totalPixels = mask.length;
    const filledPixels = mask.filter(pixel => pixel > 0).length;
    const percentage = totalPixels > 0 ? (filledPixels / totalPixels) * 100 : 0;
    return { totalPixels, filledPixels, percentage };
  }, []);

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
            const label = maskKey.split('_').pop() || 'unknown';
            const anatomicalLabel = label as AnatomicalLabel;
            const labelName = LABEL_NAMES[anatomicalLabel] || label.toUpperCase();
            const color = LABEL_COLORS[anatomicalLabel] || '#primary';
            
            return (
              <div key={maskKey} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-sm">{labelName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {stats.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {stats.filledPixels.toLocaleString()} / {stats.totalPixels.toLocaleString()} pixels
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${stats.percentage}%`,
                      backgroundColor: color
                    }}
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
          <div>Dimensions: {projectStats.width} × {projectStats.height}</div>
          <div>Total Frames: {projectStats.frames}</div>
          <div>Total Slices: {projectStats.slices}</div>
          <div>Total Masks: {projectStats.totalMasks}</div>
        </div>
      </div>
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';


// Compare Panel Component with memoization
const ComparePanel = React.memo(({
  decodedMasks,
  currentFrame,
  currentSlice
}: {
  decodedMasks: Record<string, Uint8Array>;
  currentFrame: number;
  currentSlice: number;
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Compare Masks (WIP)</h2>
      
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
});

ComparePanel.displayName = 'ComparePanel';

// Settings Panel Component with memoization
const SettingsPanel = React.memo(() => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Settings (WIP)</h2>
      
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
});

SettingsPanel.displayName = 'SettingsPanel';

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
  visibleMasks,
  setVisibleMasks,
  handleUndo,
  handleRedo,
  handleClear,
  canUndo,
  canRedo,
  canClear,
  hasUnsavedChanges,
  isSaving = false,
  onSave,
  currentFrame,
  currentSlice,
  totalFrames,
  totalSlices,
  onFrameChange,
  onSliceChange,
  historyData,
  currentHistoryStep = 0,
  onHistoryStepChange,
  onHistoryClear,
  onHistoryExport,
  onHistoryCheckpoint,
  zoomLevel,
  setZoomLevel,
  onReset,
}: SegmentationSidebarProps) {
  const [activeTab, setActiveTab] = useState('brush');

  // Memoized tab change handler
  const handleTabChange = useCallback((tabKey: TabKey) => {
    setActiveTab(tabKey);
  }, []);

  // Memoized save button state
  const saveButtonConfig = useMemo(() => ({
    variant: (hasUnsavedChanges && !isSaving) ? "default" as const : "secondary" as const,
    text: isSaving ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "No Changes",
    disabled: !hasUnsavedChanges || isSaving
  }), [hasUnsavedChanges, isSaving]);

  // Memoized default handlers for optional props
  const defaultHistoryHandlers = useMemo(() => ({
    onClear: onHistoryClear || (() => console.warn('History clear not implemented')),
    onExport: onHistoryExport || (() => console.warn('History export not implemented')),
    onCheckpoint: onHistoryCheckpoint || (() => console.warn('History checkpoint not implemented')),
    onHistoryStepChange: onHistoryStepChange || (() => console.warn('History step change not implemented'))
  }), [onHistoryClear, onHistoryExport, onHistoryCheckpoint, onHistoryStepChange]);

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar)] rounded-xl border border-[var(--sidebar-border)] shadow-sm">
      {/* Top Navigation Bar with proper accessibility */}
      <div className="flex items-center justify-center gap-3 px-2 py-2 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-primary)] rounded-t-xl">
        {NAV_ITEMS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            className={cn(
              "flex items-center justify-center p-2 rounded-lg transition-all hover:scale-105",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === key
                ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] shadow-sm"
                : "hover:bg-primary/20 text-[var(--sidebar-foreground)]"
            )}
            onClick={() => handleTabChange(key)}
            aria-label={`Switch to ${label} tab`}
            title={label}
            type="button"
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Sidebar Content with proper error boundaries */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {activeTab === 'masks' && (
          <MasksPanel
            decodedMasks={decodedMasks}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
            activeLabel={activeLabel}
            setActiveLabel={setActiveLabel}
            visibleMasks={visibleMasks}
            setVisibleMasks={setVisibleMasks}
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
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            onReset={onReset}
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
            onClear={defaultHistoryHandlers.onClear}
            onExport={defaultHistoryHandlers.onExport}
            onCheckpoint={defaultHistoryHandlers.onCheckpoint}
            onHistoryStepChange={defaultHistoryHandlers.onHistoryStepChange}
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

      {/* Save Button with enhanced accessibility */}
      <div className="p-4 border-t border-[var(--sidebar-border)]">
        <Button 
          onClick={onSave}
          disabled={saveButtonConfig.disabled}
          className="w-full transition-colors"
          variant={saveButtonConfig.variant}
          aria-label={`${saveButtonConfig.text} - ${hasUnsavedChanges ? 'Click to save your changes' : 'All changes are saved'}`}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saveButtonConfig.text}
        </Button>
      </div>
    </div>
  );
}