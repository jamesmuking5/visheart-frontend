"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

// Backend integration
import { segmentationApi } from "@/lib/api";
import { createFramesStructureFromEditableMasks } from "@/lib/decode-RLE";
import { LoadingProject } from "@/components/project/LoadingProject";
import { ErrorProject } from "@/components/project/ErrorProject";
import { SegmentationSidebar } from "@/components/segmentation/segmentation-sidebar";
import type { AnatomicalLabel, HistoryEntry, DrawingTool } from "@/types/segmentation";
import { generateMaskKey } from "@/types/segmentation";
import { useProject } from "@/context/ProjectContext";
import { useSegmentationHistory } from "@/hooks/useSegmentationHistory";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const ImageCanvas = dynamic(() => import("@/components/segmentation/image-canvas").then((mod) => mod.ImageCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ),
});

export default function SegmentationResultsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  // Get data from ProjectContext (eliminates duplicate API calls and state)
  const {
    loading,
    error,
    projectData,
    decodedMasks: contextDecodedMasks,
    hasMasks,
    segmentationError,
    tarCacheReady,
    tarCacheError,
    updateContextMasks,
  } = useProject();

  // Segmentation-specific state (not duplicated in context)
  const [masksInitialized, setMasksInitialized] = useState(false);
  const [localDecodedMasks, setLocalDecodedMasks] = useState<Record<string, Uint8Array> | null>(null);

  // Use local decoded masks if available (for edits), otherwise use context masks
  const decodedMasks = localDecodedMasks || contextDecodedMasks;
  const setDecodedMasks = setLocalDecodedMasks;

  // After loading guard, we know contextDecodedMasks is available, so create a safe version
  const safeDecodedMasks = decodedMasks || {};

  // Debug: Log mask data flow for troubleshooting (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("[Segmentation Debug] Data flow check:", {
        contextMasks: contextDecodedMasks ? Object.keys(contextDecodedMasks).length : 0,
        localMasks: localDecodedMasks ? Object.keys(localDecodedMasks).length : 0,
        finalMasks: decodedMasks ? Object.keys(decodedMasks).length : 0,
        masksInitialized,
        tarCacheReady,
        tarCacheError
      });
    }
  }, [contextDecodedMasks, localDecodedMasks, decodedMasks, masksInitialized, tarCacheReady, tarCacheError]);

  // UI state
  const [activeLabel, setActiveLabel] = useState<AnatomicalLabel>("lvc");
  const [tool, setTool] = useState<DrawingTool>("brush");
  const [brushSize, setBrushSize] = useState<number>(10);
  const [opacity, setOpacity] = useState<number>(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Reset zoom and position
  const handleReset = useCallback(() => {
    setZoomLevel(1);
    setResetTrigger(prev => prev + 1);
  }, []);

  // Use custom history hook to simplify state management
  const {
    currentHistory,
    currentStep: currentHistoryStep,
    canUndo,
    canRedo,
    createEntry: createHistoryEntry,
    addToHistory,
    navigateToStep: handleHistoryStepChange,
    initialize: initializeHistory,
    clear: handleHistoryClear
  } = useSegmentationHistory({
    currentFrame,
    currentSlice,
    decodedMasks
  });

  const canClear = useMemo(() => !!decodedMasks, [decodedMasks]);

  const [visibleMasks, setVisibleMasks] = useState<Set<AnatomicalLabel>>(new Set(["lvc", "rv", "myo"]));

  // Memoize mask changes calculation using editable key format
  const calculateMaskChanges = useCallback(
    (oldMasks: Record<string, Uint8Array>, newMasks: Record<string, Uint8Array>, label: string): HistoryEntry["maskChanges"] => {
      const editableMaskKey = generateMaskKey(currentFrame, currentSlice, label as AnatomicalLabel);
      const oldMask = oldMasks[editableMaskKey];
      const newMask = newMasks[editableMaskKey];

      // If newMask doesn't exist, no changes to track
      if (!newMask) return undefined;

      // Treat missing oldMask as an empty mask (all zeros) to properly track initial drawing
      let added = 0;
      let removed = 0;

      const maskLength = newMask.length;
      for (let i = 0; i < maskLength; i++) {
        const oldPixel = oldMask ? oldMask[i] || 0 : 0;
        const newPixel = newMask[i] || 0;

        if (oldPixel === 0 && newPixel > 0) added++;
        if (oldPixel > 0 && newPixel === 0) removed++;
      }

      return { added, removed, label: label as AnatomicalLabel };
    },
    [currentFrame, currentSlice],
  );

  // Update Masks with History Tracking - Frame/Slice Specific
  const updateMasksWithHistory = useCallback(
    (newMasks: Record<string, Uint8Array>, actionType: HistoryEntry["type"] = "brush", description?: string) => {
      if (!decodedMasks) return;

      const maskChanges = calculateMaskChanges(decodedMasks, newMasks, activeLabel);
      
      // CRITICAL: Snapshot the CURRENT state (before change) so undo can restore to it
      // This allows undoing back to the initial empty state
      const newEntry = createHistoryEntry(
        actionType, 
        description || `${actionType} action on ${activeLabel.toUpperCase()}`, 
        decodedMasks, // Capture state BEFORE change, not after!
        maskChanges, 
        activeLabel
      );

      // Add to history using our custom hook
      addToHistory(newEntry);

      setDecodedMasks(newMasks);
      setHasUnsavedChanges(true);

      console.log(`[Segmentation] Updated history for current frame/slice`);
    },
    [decodedMasks, activeLabel, createHistoryEntry, addToHistory, calculateMaskChanges, setDecodedMasks],
  );

  // Compute canvas dimensions based on project data
  const canvasDimensions = useMemo(() => {
    // Define database dimensions (original stored values)
    const dbWidth = projectData?.dimensions?.width || 512;
    const dbHeight = projectData?.dimensions?.height || 512;

    // Define canvas dimensions
    return {
      width: dbWidth,
      height: dbHeight,
    };
  }, [projectData?.dimensions]);

  // Optimized function to restore masks from history entry
  const restoreMasksFromHistory = useCallback((entry: HistoryEntry | null) => {
    if (!entry || !entry.masksSnapshot || !decodedMasks) return;

    // Only restore masks for current frame/slice
    const currentFrameSlicePrefix = `editable_frame_${currentFrame}_slice_${currentSlice}_`;
    const mergedMasks = { ...decodedMasks };

    // Step 1: Remove current frame/slice masks that don't exist in snapshot (deleted masks)
    for (const key of Object.keys(mergedMasks)) {
      if (key.startsWith(currentFrameSlicePrefix) && !(key in entry.masksSnapshot)) {
        delete mergedMasks[key];
        console.log(`[Segmentation] Removed mask ${key} (not in snapshot)`);
      }
    }

    // Step 2: Add/update masks from snapshot
    for (const [key, maskData] of Object.entries(entry.masksSnapshot)) {
      if (key.startsWith(currentFrameSlicePrefix) && maskData) {
        try {
          mergedMasks[key] = new Uint8Array(maskData as ArrayLike<number>);
        } catch (error) {
          console.error(`[Segmentation] Failed to restore mask ${key}:`, error);
        }
      }
    }

    setDecodedMasks(mergedMasks);
    setHasUnsavedChanges(true);
  }, [decodedMasks, currentFrame, currentSlice, setDecodedMasks]);

  // Enhanced history step change handler that updates masks
  const handleHistoryStepChangeWithMasks = useCallback((step: number) => {
    console.log(`[Segmentation] Navigating to history step ${step}`);
    const entry = handleHistoryStepChange(step);
    if (entry) {
      restoreMasksFromHistory(entry);
      console.log(`[Segmentation] Successfully navigated to history step ${step}`);
    }
    return entry;
  }, [handleHistoryStepChange, restoreMasksFromHistory]);

  // Undo Handler - uses custom hook
  const handleUndo = useCallback(() => {
    if (!canUndo || !decodedMasks) return;
    
    const previousEntry = handleHistoryStepChangeWithMasks(currentHistoryStep - 1);
    if (previousEntry) {
      console.log(`[Segmentation] Undo operation completed`);
    }
  }, [canUndo, decodedMasks, handleHistoryStepChangeWithMasks, currentHistoryStep]);

  // Redo Handler - uses custom hook  
  const handleRedo = useCallback(() => {
    if (!canRedo || !decodedMasks) return;
    
    const nextEntry = handleHistoryStepChangeWithMasks(currentHistoryStep + 1);
    if (nextEntry) {
      console.log(`[Segmentation] Redo operation completed`);
    }
  }, [canRedo, decodedMasks, handleHistoryStepChangeWithMasks, currentHistoryStep]);  // Clear Handler
  const handleClear = useCallback(() => {
    if (!decodedMasks) return;

    const newMasks = { ...decodedMasks };
    const editableMaskKey = generateMaskKey(currentFrame, currentSlice, activeLabel);

    if (newMasks[editableMaskKey]) {
      newMasks[editableMaskKey] = new Uint8Array(newMasks[editableMaskKey].length);
      updateMasksWithHistory(newMasks, "clear", `Cleared ${activeLabel.toUpperCase()} editable mask`);
    }
  }, [decodedMasks, currentFrame, currentSlice, activeLabel, updateMasksWithHistory]);

  // History Checkpoint Handler - creates manual checkpoint
  const handleHistoryCheckpoint = useCallback(() => {
    if (!decodedMasks) return;

    // Get the next checkpoint number for current frame/slice
    const existingCheckpoints = currentHistory.filter((entry) => entry.type === "checkpoint").length;
    const nextCheckpointNum = existingCheckpoints + 1;

    updateMasksWithHistory(decodedMasks, "checkpoint", `Manual checkpoint #${nextCheckpointNum} created`);
  }, [decodedMasks, currentHistory, updateMasksWithHistory]);

  // Save Handler - only save editable masks with proper RLE encoding
  const handleSave = useCallback(async () => {
    if (!decodedMasks || !projectId || isSaving) return;

    setIsSaving(true);
    try {
      // Filter only editable masks for saving
      const editableMasks = Object.entries(decodedMasks)
        .filter(([key]) => key.startsWith("editable_"))
        .reduce(
          (acc, [key, data]) => {
            acc[key] = data;
            return acc;
          },
          {} as Record<string, Uint8Array>,
        );

      console.log("[Segmentation] Saving editable masks:", Object.keys(editableMasks));

      // Convert masks to the proper backend format with RLE encoding
      const frames = createFramesStructureFromEditableMasks(editableMasks);

      console.log("[Segmentation] Converted to backend frames format:", frames);

      // Temporary: Test RLE encoding to verify it works
      if (frames.length > 0 && frames[0].slices && frames[0].slices.length > 0) {
        const firstMask = frames[0].slices[0].segmentationmasks?.[0];
        if (firstMask) {
          console.log("[RLE Test] First mask RLE string:", firstMask.segmentationmaskcontents);
          console.log("[RLE Test] RLE string length:", firstMask.segmentationmaskcontents.length);
        }
      }

      await segmentationApi.saveManualSegmentation(projectId, {
        name: `Manual Segmentation - ${new Date().toISOString()}`,
        description: "Manually edited segmentation masks with RLE encoding",
        frames: frames,
      });

      console.log("[Segmentation] Successfully saved masks to backend");

      // Optimistic update - update context directly with current masks
      // This eliminates the need for refreshMasks and prevents UI reload
      updateContextMasks(decodedMasks);

      // Clear local changes state immediately
      setHasUnsavedChanges(false);
      setLocalDecodedMasks(null); // Clear local edits since they're now saved in context

      console.log("[Segmentation] Successfully saved and updated context with optimistic approach");
    } catch (err) {
      console.error("Failed to save editable masks:", err);
    } finally {
      setIsSaving(false);
    }
  }, [decodedMasks, projectId, isSaving, updateContextMasks]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S to save
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // Prevent browser's default save dialog
        
        // Only save if there are unsaved changes and not currently saving
        if (hasUnsavedChanges && !isSaving) {
          console.log('[Segmentation] Ctrl+S shortcut triggered - saving changes...');
          handleSave();
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasUnsavedChanges, isSaving, handleSave]);

  // Export history timeline handler
  const handleHistoryExport = useCallback(() => {
    console.log("Export triggered from page level");
  }, []);

  // Initialize history when masks become available from context - ONLY ONCE
  useEffect(() => {
    // Only initialize history if we have masks from context and haven't initialized yet
    if (contextDecodedMasks && !masksInitialized) {
      console.log("[Segmentation] Initializing history with context masks");
      initializeHistory(contextDecodedMasks);
      setMasksInitialized(true);
    }
  }, [contextDecodedMasks, masksInitialized, initializeHistory]);

  // Auto-initialize history for new frame/slice combinations
  useEffect(() => {
    if (masksInitialized && decodedMasks) {
      console.log(`[Segmentation] Auto-initializing history for new frame/slice if needed`);
      initializeHistory(decodedMasks);
    }
  }, [currentFrame, currentSlice, masksInitialized, decodedMasks, initializeHistory]);

  // Loading states - now much simpler since ProjectContext handles main data loading
  if (!projectId) return <ErrorProject error="Project ID is missing." />;
  if (loading !== "done") return <LoadingProject loadingStage={loading} />;
  if (error) return <ErrorProject error={error} />;
  if (segmentationError && !hasMasks) return <ErrorProject error={segmentationError} />;

  // Don't show error if we're currently saving (refreshing masks) - show loading instead
  if (!projectData || (!contextDecodedMasks && !isSaving)) {
    return <ErrorProject error="No data available" />;
  }

  // Show loading state while saving/refreshing masks
  if (isSaving && !contextDecodedMasks) {
    return <LoadingProject loadingStage="mask" />;
  }

  return (
    <div className="h-full w-full bg-background">
      {/* Mobile: Stack vertically */}
      <div className="lg:hidden w-full h-full p-4 flex flex-col gap-4">
        <div className="flex-1 relative bg-muted/40 rounded-xl border shadow-sm p-4 flex items-center justify-center overflow-hidden">
          <ImageCanvas
            projectData={projectData}
            decodedMasks={safeDecodedMasks}
            onMaskUpdate={updateMasksWithHistory}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
            onFrameChange={setCurrentFrame}
            onSliceChange={setCurrentSlice}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            activeLabel={activeLabel}
            visibleMasks={visibleMasks}
            tool={tool}
            brushSize={brushSize}
            opacity={opacity}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            resetTrigger={resetTrigger}
          />
        </div>
        
        <div className="w-full bg-background rounded-xl border shadow-sm">
          <SegmentationSidebar
            projectData={projectData}
            decodedMasks={safeDecodedMasks}
            tool={tool}
            setTool={setTool}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            opacity={opacity}
            setOpacity={setOpacity}
            activeLabel={activeLabel}
            setActiveLabel={setActiveLabel}
            visibleMasks={visibleMasks}
            setVisibleMasks={setVisibleMasks}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            handleClear={handleClear}
            canUndo={canUndo}
            canRedo={canRedo}
            canClear={canClear}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            onSave={handleSave}
            currentFrame={currentFrame}
            currentSlice={currentSlice}
            totalFrames={projectData.dimensions?.frames || 1}
            totalSlices={projectData.dimensions?.slices || 1}
            historyData={currentHistory}
            currentHistoryStep={currentHistoryStep}
            onHistoryStepChange={handleHistoryStepChangeWithMasks}
            onHistoryClear={handleHistoryClear}
            onHistoryExport={handleHistoryExport}
            onHistoryCheckpoint={handleHistoryCheckpoint}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* Desktop: Resizable panels */}
      <div className="hidden lg:block w-full h-full p-6">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="h-full w-full rounded-xl border shadow-sm"
        >
          {/* Canvas Panel */}
          <ResizablePanel defaultSize={70} minSize={40}>
            <div className="h-full w-full relative bg-muted/40 rounded-l-xl p-4 flex items-center justify-center">
              <ImageCanvas
                projectData={projectData}
                decodedMasks={safeDecodedMasks}
                onMaskUpdate={updateMasksWithHistory}
                currentFrame={currentFrame}
                currentSlice={currentSlice}
                onFrameChange={setCurrentFrame}
                onSliceChange={setCurrentSlice}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                activeLabel={activeLabel}
                visibleMasks={visibleMasks}
                tool={tool}
                brushSize={brushSize}
                opacity={opacity}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                resetTrigger={resetTrigger}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Sidebar Panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full w-full bg-background">
              <SegmentationSidebar
                projectData={projectData}
                decodedMasks={safeDecodedMasks}
                tool={tool}
                setTool={setTool}
                brushSize={brushSize}
                setBrushSize={setBrushSize}
                opacity={opacity}
                setOpacity={setOpacity}
                activeLabel={activeLabel}
                setActiveLabel={setActiveLabel}
                visibleMasks={visibleMasks}
                setVisibleMasks={setVisibleMasks}
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                handleClear={handleClear}
                canUndo={canUndo}
                canRedo={canRedo}
                canClear={canClear}
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
                onSave={handleSave}
                currentFrame={currentFrame}
                currentSlice={currentSlice}
                totalFrames={projectData.dimensions?.frames || 1}
                totalSlices={projectData.dimensions?.slices || 1}
                historyData={currentHistory}
                currentHistoryStep={currentHistoryStep}
                onHistoryStepChange={handleHistoryStepChangeWithMasks}
                onHistoryClear={handleHistoryClear}
                onHistoryExport={handleHistoryExport}
                onHistoryCheckpoint={handleHistoryCheckpoint}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                onReset={handleReset}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
