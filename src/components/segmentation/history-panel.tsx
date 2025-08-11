"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Save, 
  Download, 
  Clock, 
  Brush, 
  Eraser, 
  Trash2, 
  FolderOpen, 
  MapPin, 
  Edit3,
  Undo2,
  Redo2 
} from "lucide-react";

interface HistoryPanelProps {
  onClear: () => void;
  onExport: () => void;
  onCheckpoint: () => void;
  onHistoryStepChange?: (step: number) => void;
  currentFrame: number;
  currentSlice: number;
  currentHistoryStep: number;
  // Accept any history data structure - let TypeScript infer from parent
  historyData: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: number;
    frameSlice?: string;
    checkpointNumber?: number;
  }>;
}

export function HistoryPanel({
  onClear,
  onExport,
  onCheckpoint,
  onHistoryStepChange,
  currentFrame = 0,
  currentSlice = 0,
  currentHistoryStep = 0,
  historyData = []
}: HistoryPanelProps) {

  // Memoized history processing
  const processedHistory = useMemo(() => {
    return historyData.slice(-15).reverse(); // Show last 15 entries, most recent first
  }, [historyData]);

  // Memoized time formatting
  const formatTimeAgo = useMemo(() => {
    return (timestamp: number) => {
      const diff = Math.floor((Date.now() - timestamp) / 60000);
      if (diff < 1) return "just now";
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return `${Math.floor(diff / 1440)}d ago`;
    };
  }, []);

  // Icon mapping using Lucide React icons
  const getHistoryIcon = useMemo(() => {
    return (type: string) => {
      switch (type) {
        case 'brush': 
          return <Brush className="w-4 h-4 text-blue-500" />;
        case 'eraser': 
          return <Eraser className="w-4 h-4 text-orange-500" />;
        case 'clear': 
          return <Trash2 className="w-4 h-4 text-red-500" />;
        case 'import': 
          return <FolderOpen className="w-4 h-4 text-green-500" />;
        case 'checkpoint': 
          return <MapPin className="w-4 h-4 text-purple-500" />;
        case 'undo':
          return <Undo2 className="w-4 h-4 text-gray-500" />;
        case 'redo':
          return <Redo2 className="w-4 h-4 text-gray-500" />;
        default: 
          return <Edit3 className="w-4 h-4 text-muted-foreground" />;
      }
    };
  }, []);

  const handleHistoryItemClick = (index: number) => {
    if (onHistoryStepChange) {
      // Convert display index back to actual history step
      const actualStep = historyData.length - 1 - index;
      onHistoryStepChange(actualStep);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Edit History</h2>
      
      {/* Current Session Info */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Current Session
        </div>
        <div className="text-xs text-muted-foreground">
          Frame {currentFrame + 1}, Slice {currentSlice + 1}
        </div>
        <div className="text-xs text-muted-foreground">
          {historyData.length} action(s) recorded
        </div>
      </div>

      {/* History Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Recent Actions</h3>
        
        {processedHistory.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {processedHistory.map((entry, index) => {
              const isCurrentStep = (historyData.length - 1 - index) === currentHistoryStep;
              
              return (
                <div 
                  key={entry.id} 
                  className={`p-2 rounded border transition-colors cursor-pointer ${
                    isCurrentStep 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-background border-border hover:bg-muted/50"
                  }`}
                  onClick={() => handleHistoryItemClick(index)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getHistoryIcon(entry.type)}
                    <span className="text-sm font-medium capitalize">{entry.type}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatTimeAgo(entry.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.description}
                  </div>
                  {entry.frameSlice && (
                    <div className="text-xs text-muted-foreground opacity-75">
                      {entry.frameSlice}
                    </div>
                  )}
                  {isCurrentStep && (
                    <div className="text-xs text-primary font-medium mt-1">
                      ← Current state
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No actions recorded yet
          </div>
        )}
      </div>

      {/* History Management Actions */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">History Management</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-200 dark:hover:border-purple-800"
            onClick={onCheckpoint}
          >
            <Save className="w-4 h-4 mr-2" />
            Create Checkpoint 
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+S</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Timeline
            <span className="ml-auto text-xs text-muted-foreground">JSON</span>
          </Button>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Session Stats</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Brush Strokes:</span>
            <span>{historyData.filter(h => h.type === 'brush').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Eraser Uses:</span>
            <span>{historyData.filter(h => h.type === 'eraser').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Clear Actions:</span>
            <span>{historyData.filter(h => h.type === 'clear').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Checkpoints:</span>
            <span>{historyData.filter(h => h.type === 'checkpoint').length}</span>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Advanced</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={onClear}
          >
            <History className="w-4 h-4 mr-2" />
            Clear History
            <span className="ml-auto text-xs text-muted-foreground">Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
}