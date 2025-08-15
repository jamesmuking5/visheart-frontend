"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

// Backend integration
import { projectApi, segmentationApi } from "@/lib/api";
import { decodeSegmentationMasks } from "@/lib/decode-RLE(test)";
import type { ProjectData, BaseSegmentationMask } from "@/types/project(test)";
import { LoadingStage } from "@/types/project(test)";
import { LoadingProject } from "@/components/project(test)/LoadingProject";
import { ErrorProject } from "@/components/project(test)/ErrorProject";
import { SegmentationSidebar } from "@/components/segmentation/segmentation-sidebar";

import type { AnatomicalLabel, HistoryEntry } from "@/types/segmentation";
 
const ImageCanvas = dynamic(
  () => import("@/components/segmentation/image-canvas").then((mod) => mod.ImageCanvas),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }
); 

export default function SegmentationResultsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  // Backend state
  const [loading, setLoading] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [undecodedMasks, setUndecodedMasks] = useState<BaseSegmentationMask[] | null>(null);
  const [decodedMasks, setDecodedMasks] = useState<Record<string, Uint8Array> | null>(null);

  // UI state
  const [activeLabel, setActiveLabel] = useState<AnatomicalLabel>('lvc');
  const [tool, setTool] = useState<string>("brush");
  const [brushSize, setBrushSize] = useState<number>(10);
  const [opacity, setOpacity] = useState<number>(1);
  const [hardness, setHardness] = useState<"soft" | "medium" | "hard">("hard");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentSlice, setCurrentSlice] = useState(0);

  // Enhanced History Management
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const historyIdCounter = useRef(0);

  // Track undo/redo operations
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

  // Memoized History Values
  const canUndo = useMemo(() => historyStep > 0, [historyStep]);
  const canRedo = useMemo(() => historyStep < history.length - 1, [historyStep, history.length]);
  const canClear = useMemo(() => !!decodedMasks, [decodedMasks]);

  // Create History Entry Helper
  const createHistoryEntry = useCallback((
    type: HistoryEntry['type'],
    description: string,
    masksSnapshot: Record<string, Uint8Array>,
    maskChanges?: HistoryEntry['maskChanges'],
    componentLabel?: AnatomicalLabel 
  ): HistoryEntry => {
    // Calculate checkpoint number if this is a checkpoint
    let checkpointNumber: number | undefined;
    if (type === 'checkpoint') {
      const existingCheckpoints = history.filter(entry => entry.type === 'checkpoint').length;
      checkpointNumber = existingCheckpoints + 1;
    }
    
    return {
      id: `history_${Date.now()}_${++historyIdCounter.current}`,
      type,
      description,
      timestamp: Date.now(),
      frameSlice: `Frame ${currentFrame + 1}, Slice ${currentSlice + 1}`,
      checkpointNumber,
      maskChanges,
      masksSnapshot: { ...masksSnapshot }, // Deep copy
      componentLabel
    };
  }, [currentFrame, currentSlice]);

  // Initialize History
  const initializeHistory = useCallback((initialMasks: Record<string, Uint8Array>) => {
    const initialEntry = createHistoryEntry(
      'import',
      'Project loaded',
      initialMasks
    );
    setHistory([initialEntry]);
    setHistoryStep(0);
  }, [createHistoryEntry]);

  // Update Masks with History Tracking
  const updateMasksWithHistory = useCallback((
    newMasks: Record<string, Uint8Array>, 
    actionType: HistoryEntry['type'] = 'brush',
    description?: string
  ) => {
    if (!decodedMasks) return;

    // Calculate mask changes for statistics
    const maskChanges = calculateMaskChanges(decodedMasks, newMasks, activeLabel);
    
    // Create new history entry
    const newEntry = createHistoryEntry(
      actionType,
      description || `${actionType} action on ${activeLabel.toUpperCase()}`,
      newMasks,
      maskChanges,
      activeLabel
    );

    // Truncate future history if we're not at the end
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newEntry);

    // Limit history size for performance (keep last 100 entries)
    const trimmedHistory = newHistory.slice(-100);
    
    setHistory(trimmedHistory);
    setHistoryStep(trimmedHistory.length - 1);
    setDecodedMasks(newMasks);
    setHasUnsavedChanges(true);
  }, [decodedMasks, activeLabel, createHistoryEntry, history, historyStep]);

  // Calculate Mask Changes for Statistics using editable key format
  const calculateMaskChanges = useCallback((
    oldMasks: Record<string, Uint8Array>,
    newMasks: Record<string, Uint8Array>,
    label: string
  ): HistoryEntry['maskChanges'] => {
    const editableMaskKey = `editable_frame_${currentFrame}_slice_${currentSlice}_${label}`;
    const oldMask = oldMasks[editableMaskKey];
    const newMask = newMasks[editableMaskKey];

    if (!oldMask || !newMask) return undefined;

    let added = 0;
    let removed = 0;

    for (let i = 0; i < Math.max(oldMask.length, newMask.length); i++) {
      const oldPixel = oldMask[i] || 0;
      const newPixel = newMask[i] || 0;

      if (oldPixel === 0 && newPixel > 0) added++;
      if (oldPixel > 0 && newPixel === 0) removed++;
    }

    return { added, removed, label };
  }, [currentFrame, currentSlice]);

  // Navigation handlers that DON'T trigger undo/redo flag
  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrame(frame);
    // Don't set isUndoRedoOperation flag for normal navigation
  }, []);

  const handleSliceChange = useCallback((slice: number) => {
    setCurrentSlice(slice);
    // Don't set isUndoRedoOperation flag for normal navigation
  }, []);

  // Undo Handler - ONLY for actual undo operations
  const handleUndo = useCallback(() => {
    if (!canUndo || history.length === 0) return;
    
    const newStep = historyStep - 1;
    const targetEntry = history[newStep];
    
    // Signal undo operation to canvas
    setIsUndoRedoOperation(true);
    
    setHistoryStep(newStep);
    setDecodedMasks(targetEntry.masksSnapshot);
    setHasUnsavedChanges(true);

    console.log(`[Segmentation] Undo operation: ${targetEntry.description}`);
    
    // Reset the flag after a brief delay to allow canvas to react
    setTimeout(() => setIsUndoRedoOperation(false), 100);
  }, [canUndo, history, historyStep]);

  // Redo Handler - ONLY for actual redo operations
  const handleRedo = useCallback(() => {
    if (!canRedo || history.length === 0) return;
    
    const newStep = historyStep + 1;
    const targetEntry = history[newStep];
    
    // Signal redo operation to canvas
    setIsUndoRedoOperation(true);
    
    setHistoryStep(newStep);
    setDecodedMasks(targetEntry.masksSnapshot);
    setHasUnsavedChanges(true);

    console.log(`[Segmentation] Redo operation: ${targetEntry.description}`);
    
    // Reset the flag after a brief delay
    setTimeout(() => setIsUndoRedoOperation(false), 100);
  }, [canRedo, history, historyStep]);

  // Clear Handler
  const handleClear = useCallback(() => {
    if (!decodedMasks) return;
    
    const newMasks = { ...decodedMasks };
    const editableMaskKey = `editable_frame_${currentFrame}_slice_${currentSlice}_${activeLabel}`;
    
    if (newMasks[editableMaskKey]) {
      newMasks[editableMaskKey] = new Uint8Array(newMasks[editableMaskKey].length);
      updateMasksWithHistory(
        newMasks, 
        'clear', 
        `Cleared ${activeLabel.toUpperCase()} editable mask`
      );
    }
  }, [decodedMasks, currentFrame, currentSlice, activeLabel, updateMasksWithHistory]);

  // History Navigation - for history panel clicks, different from undo/redo
  const handleHistoryStepChange = useCallback((step: number) => {
    if (step >= 0 && step < history.length) {
      const targetEntry = history[step];
      
      // This is history navigation, not undo/redo
      // Don't trigger local state clearing
      setHistoryStep(step);
      setDecodedMasks(targetEntry.masksSnapshot);
      setHasUnsavedChanges(true);
      
      console.log(`[Segmentation] History navigation to step ${step}: ${targetEntry.description}`);
    }
  }, [history]);

  // History Management Actions
  const handleHistoryClear = useCallback(() => {
    if (!decodedMasks) return;
    
    // Keep only the current state
    const currentEntry = createHistoryEntry(
      'clear',
      'History cleared',
      decodedMasks
    );
    
    setHistory([currentEntry]);
    setHistoryStep(0);
  }, [decodedMasks, createHistoryEntry]);

  const handleHistoryCheckpoint = useCallback(() => {
    if (!decodedMasks) return;
    
    // Get the next checkpoint number
    const existingCheckpoints = history.filter(entry => entry.type === 'checkpoint').length;
    const nextCheckpointNum = existingCheckpoints + 1;
    
    updateMasksWithHistory(
      decodedMasks,
      'checkpoint',
      `Manual checkpoint #${nextCheckpointNum} created`
    );
  }, [decodedMasks, updateMasksWithHistory]);

  // Save Handler - only save editable masks
  const handleSave = useCallback(async () => {
    if (!decodedMasks || !projectId) return;
    
    try {
      // Filter only editable masks for saving
      const editableMasks = Object.entries(decodedMasks)
        .filter(([key]) => key.startsWith('editable_'))
        .reduce((acc, [key, data]) => {
          acc[key] = data;
          return acc;
        }, {} as Record<string, Uint8Array>);

      console.log('[Segmentation] Saving editable masks:', Object.keys(editableMasks));

      await segmentationApi.saveManualSegmentation(projectId, {
        masks: editableMasks,
      });
      setHasUnsavedChanges(false);
      
      // Create a save checkpoint with proper numbering
      const existingCheckpoints = history.filter(entry => entry.type === 'checkpoint').length;
      const checkpointNum = existingCheckpoints + 1;
      
      updateMasksWithHistory(
        decodedMasks,
        'checkpoint',
        `Checkpoint #${checkpointNum} - Editable masks saved to server`
      );
    } catch (err) {
      console.error("Failed to save editable masks:", err);
    }
  }, [decodedMasks, projectId, updateMasksWithHistory, history]);

  // To do: Export history timeline 
  const handleHistoryExport = useCallback(() => {
    console.log("Export triggered from page level");
  }, []);

  // Load project data (unchanged)
  useEffect(() => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading("done");
      return;
    }

    setLoading("project");
    
    projectApi.getProjectInfo(projectId)
      .then((response) => {
        if (!response.success) {
          setError(response.message); 
          setLoading("done");
          return;
        }
        setProjectData(response.project);
      })
      .catch(() => {
        setError("Failed to fetch project data.");
      })
      .finally(() => {
        setLoading("mask");
      });
  }, [projectId]);

  // Load masks with history initialization
  useEffect(() => {
    if (error || !projectData || !projectId) {
      setLoading("done");
      return;
    }

    segmentationApi.getSegmentationResults(projectId)
      .then((response) => {
        if (!response.success) {
          setError("No segmentation masks found. Please run segmentation first.");
          return;
        }
        
        setUndecodedMasks(response.segmentations);
        
        const decoded = decodeSegmentationMasks(
          response.segmentations,
          projectData.dimensions?.width || 0,
          projectData.dimensions?.height || 0
        );
        
      // Console log the decoded masks as expandable arrays
      console.log('[Segmentation] Decoded Masks Overview');
      console.log('Total masks found:', Object.keys(decoded.masks).length); 
      console.log('Raw decoded masks object:', decoded.masks);

        setDecodedMasks(decoded.masks);
        initializeHistory(decoded.masks); // Initialize history
      })
      .catch(() => {
        setError("Failed to load segmentation masks.");
      })
      .finally(() => {
        setLoading("done");
      });
  }, [projectData, projectId, error, initializeHistory]);

  // Loading states
  if (!projectId) return <ErrorProject error="Project ID is missing." />;
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;
  if (error) return <ErrorProject error={error} />;
  if (!projectData || !decodedMasks) return <ErrorProject error="No data available" />;

  return (
    <div className="h-full w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 bg-muted/40">
      <main className="flex-1 flex flex-col gap-4 lg:gap-6 overflow-hidden">
        <div className="flex-none">
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={() => router.push(`/project(test)/${projectId}`)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Project
            </button>
          </div>
          <h1 className="text-2xl font-bold text-center">Cardiac Segmentation Editor</h1>
          <p className="text-center text-gray-500 mb-4">
            Project: {projectData.projectName} • Edit AI-generated masks or create manual annotations
          </p>
        </div>
        
        <div className="flex-1 relative bg-background rounded-xl border shadow-sm p-4 flex items-center justify-center">
          <ImageCanvas
            projectData={projectData}
            decodedMasks={decodedMasks}
            isUndoRedoOperation={isUndoRedoOperation}
            onMaskUpdate={updateMasksWithHistory}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
            onFrameChange={setCurrentFrame}
            onSliceChange={setCurrentSlice}
            width={projectData.dimensions?.width || 512}
            height={projectData.dimensions?.height || 512}
            activeLabel={activeLabel}
            tool={tool}
            brushSize={brushSize}
            opacity={opacity}
            hardness={hardness}
          />
        </div>
      </main>
      
      <aside className="w-full lg:w-80 flex-none">
        <div className="bg-background rounded-xl border shadow-sm h-full">
          <SegmentationSidebar
            projectData={projectData}
            decodedMasks={decodedMasks}
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
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSave}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
            totalFrames={projectData.dimensions?.frames || 1}
            totalSlices={projectData.dimensions?.slices || 1}
            // Pass history data to sidebar
            historyData={history}
            currentHistoryStep={historyStep}
            onHistoryStepChange={handleHistoryStepChange}
            onHistoryClear={handleHistoryClear}
            onHistoryExport={handleHistoryExport}
            onHistoryCheckpoint={handleHistoryCheckpoint}
          />
        </div>
      </aside>
    </div>
  );
}