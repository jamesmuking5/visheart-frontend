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
import { useProject } from "@/context/ProjectContext";

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
    // NEW: Tar cache from context
    tarCacheReady,
    tarCacheError,
    // Cache invalidation
    refreshMasks,
  } = useProject();

  // Segmentation-specific state (not duplicated in context)
  const [masksInitialized, setMasksInitialized] = useState(false);
  const [localDecodedMasks, setLocalDecodedMasks] = useState<Record<string, Uint8Array> | null>(null);

  // Use local decoded masks if available (for edits), otherwise use context masks
  const decodedMasks = localDecodedMasks || contextDecodedMasks;
  const setDecodedMasks = setLocalDecodedMasks;

  // After loading guard, we know contextDecodedMasks is available, so create a safe version
  const safeDecodedMasks = decodedMasks || {};

  // Debug: Log mask data flow for troubleshooting
  useEffect(() => {
    console.log("[Segmentation Debug] Data flow check:");
    console.log("- contextDecodedMasks:", contextDecodedMasks ? Object.keys(contextDecodedMasks) : null);
    console.log("- localDecodedMasks:", localDecodedMasks ? Object.keys(localDecodedMasks) : null);
    console.log("- final decodedMasks:", decodedMasks ? Object.keys(decodedMasks) : null);
    console.log("- masksInitialized:", masksInitialized);
    console.log("- tarCacheReady:", tarCacheReady);
    console.log("- tarCacheError:", tarCacheError);
  }, [contextDecodedMasks, localDecodedMasks, decodedMasks, masksInitialized, tarCacheReady, tarCacheError]);

  // UI state
  const [activeLabel, setActiveLabel] = useState<AnatomicalLabel>("lvc");
  const [tool, setTool] = useState<DrawingTool>("brush");
  const [brushSize, setBrushSize] = useState<number>(10);
  const [opacity, setOpacity] = useState<number>(1);
  const [hardness, setHardness] = useState<"soft" | "medium" | "hard">("hard");
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

  // Frame/Slice-Specific History Management, each frame/slice combination has its own history stack
  const [frameSliceHistories, setFrameSliceHistories] = useState<Record<string, HistoryEntry[]>>({});
  const [frameSliceHistorySteps, setFrameSliceHistorySteps] = useState<Record<string, number>>({});
  const historyIdCounter = useRef(0);

  // Helper to get current frame/slice key
  const getCurrentFrameSliceKey = useCallback(() => {
    return `frame_${currentFrame}_slice_${currentSlice}`;
  }, [currentFrame, currentSlice]);

  // Get current frame/slice history
  const currentHistory = useMemo(() => {
    const key = getCurrentFrameSliceKey();
    return frameSliceHistories[key] || [];
  }, [frameSliceHistories, getCurrentFrameSliceKey]);

  // Get current frame/slice history step
  const currentHistoryStep = useMemo(() => {
    const key = getCurrentFrameSliceKey();
    const step = frameSliceHistorySteps[key] || 0;
    console.log(`[Segmentation] Current history step for ${key}: ${step}`);
    return step;
  }, [frameSliceHistorySteps, getCurrentFrameSliceKey]);

  // Memoized History Values for current frame/slice
  const canUndo = useMemo(() => {
    const result = currentHistoryStep > 0;
    console.log(`[Segmentation] canUndo: ${result} (step: ${currentHistoryStep})`);
    return result;
  }, [currentHistoryStep]);
  
  const canRedo = useMemo(() => {
    const result = currentHistoryStep < currentHistory.length - 1;
    console.log(`[Segmentation] canRedo: ${result} (step: ${currentHistoryStep}, history length: ${currentHistory.length})`);
    return result;
  }, [currentHistoryStep, currentHistory.length]);
  
  const canClear = useMemo(() => !!decodedMasks, [decodedMasks]);

  const [visibleMasks, setVisibleMasks] = useState<Set<AnatomicalLabel>>(new Set(["lvc", "rv", "myo"]));

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

  // Create History Entry Helper
  const createHistoryEntry = useCallback(
    (type: HistoryEntry["type"], description: string, masksSnapshot: Record<string, Uint8Array>, maskChanges?: HistoryEntry["maskChanges"], componentLabel?: AnatomicalLabel): HistoryEntry => {
      // Calculate checkpoint number if this is a checkpoint (per frame/slice)
      let checkpointNumber: number | undefined;
      if (type === "checkpoint") {
        const existingCheckpoints = currentHistory.filter((entry) => entry.type === "checkpoint").length;
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
        componentLabel,
      };
    },
    [currentFrame, currentSlice, currentHistory],
  );

  // Initialize History for a specific frame/slice
  const initializeHistory = useCallback(
    (initialMasks: Record<string, Uint8Array>) => {
      const frameSliceKey = getCurrentFrameSliceKey();

      // Only initialize if this frame/slice doesn't have history yet
      if (frameSliceHistories[frameSliceKey]) {
        console.log(`[Segmentation] History already exists for ${frameSliceKey}`);
        return;
      }

      const initialEntry = createHistoryEntry("import", "Project loaded", initialMasks);

      setFrameSliceHistories((prev) => ({
        ...prev,
        [frameSliceKey]: [initialEntry],
      }));

      setFrameSliceHistorySteps((prev) => ({
        ...prev,
        [frameSliceKey]: 0,
      }));

      console.log(`[Segmentation] History initialized for ${frameSliceKey} with`, Object.keys(initialMasks).length, "masks");
    },
    [createHistoryEntry, getCurrentFrameSliceKey, frameSliceHistories],
  );

  // Calculate Mask Changes for Statistics using editable key format
  const calculateMaskChanges = useCallback(
    (oldMasks: Record<string, Uint8Array>, newMasks: Record<string, Uint8Array>, label: string): HistoryEntry["maskChanges"] => {
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

      return { added, removed, label: label as AnatomicalLabel };
    },
    [currentFrame, currentSlice],
  );

  // Update Masks with History Tracking - Frame/Slice Specific
  const updateMasksWithHistory = useCallback(
    (newMasks: Record<string, Uint8Array>, actionType: HistoryEntry["type"] = "brush", description?: string) => {
      if (!decodedMasks) return;

      const frameSliceKey = getCurrentFrameSliceKey();
      const maskChanges = calculateMaskChanges(decodedMasks, newMasks, activeLabel);

      const newEntry = createHistoryEntry(actionType, description || `${actionType} action on ${activeLabel.toUpperCase()}`, newMasks, maskChanges, activeLabel);

      // Update history for current frame/slice only
      const currentFrameHistory = frameSliceHistories[frameSliceKey] || [];
      const currentStep = frameSliceHistorySteps[frameSliceKey] || 0;

      const newHistory = currentFrameHistory.slice(0, currentStep + 1);
      newHistory.push(newEntry);
      const trimmedHistory = newHistory.slice(-100); // Keep last 100 entries per frame/slice

      setFrameSliceHistories((prev) => ({
        ...prev,
        [frameSliceKey]: trimmedHistory,
      }));

      setFrameSliceHistorySteps((prev) => ({
        ...prev,
        [frameSliceKey]: trimmedHistory.length - 1,
      }));

      setDecodedMasks(newMasks);
      setHasUnsavedChanges(true);

      console.log(`[Segmentation] Updated history for ${frameSliceKey}, step: ${trimmedHistory.length - 1}`);
    },
    [decodedMasks, activeLabel, createHistoryEntry, getCurrentFrameSliceKey, frameSliceHistories, frameSliceHistorySteps, calculateMaskChanges, setDecodedMasks],
  );

  // Undo Handler - Frame/Slice Specific
  const handleUndo = useCallback(() => {
    if (!canUndo || currentHistory.length === 0) return;

    const frameSliceKey = getCurrentFrameSliceKey();
    const newStep = currentHistoryStep - 1;
    const targetEntry = currentHistory[newStep];

    setFrameSliceHistorySteps((prev) => ({
      ...prev,
      [frameSliceKey]: newStep,
    }));

    setDecodedMasks(targetEntry.masksSnapshot);
    setHasUnsavedChanges(true);

    console.log(`[Segmentation] Undo operation for ${frameSliceKey}: ${targetEntry.description}`);
  }, [canUndo, currentHistory, currentHistoryStep, getCurrentFrameSliceKey, setDecodedMasks]);

  // Redo Handler - Frame/Slice Specific
  const handleRedo = useCallback(() => {
    if (!canRedo || currentHistory.length === 0) return;

    const frameSliceKey = getCurrentFrameSliceKey();
    const newStep = currentHistoryStep + 1;
    const targetEntry = currentHistory[newStep];

    setFrameSliceHistorySteps((prev) => ({
      ...prev,
      [frameSliceKey]: newStep,
    }));

    setDecodedMasks(targetEntry.masksSnapshot);
    setHasUnsavedChanges(true);

    console.log(`[Segmentation] Redo operation for ${frameSliceKey}: ${targetEntry.description}`);
  }, [canRedo, currentHistory, currentHistoryStep, getCurrentFrameSliceKey, setDecodedMasks]);

  // Clear Handler
  const handleClear = useCallback(() => {
    if (!decodedMasks) return;

    const newMasks = { ...decodedMasks };
    const editableMaskKey = `editable_frame_${currentFrame}_slice_${currentSlice}_${activeLabel}`;

    if (newMasks[editableMaskKey]) {
      newMasks[editableMaskKey] = new Uint8Array(newMasks[editableMaskKey].length);
      updateMasksWithHistory(newMasks, "clear", `Cleared ${activeLabel.toUpperCase()} editable mask`);
    }
  }, [decodedMasks, currentFrame, currentSlice, activeLabel, updateMasksWithHistory]);

  // History Navigation - for history panel clicks, different from undo/redo
  const handleHistoryStepChange = useCallback(
    (step: number) => {
      if (step >= 0 && step < currentHistory.length) {
        const frameSliceKey = getCurrentFrameSliceKey();
        const targetEntry = currentHistory[step];

        setFrameSliceHistorySteps((prev) => ({
          ...prev,
          [frameSliceKey]: step,
        }));

        setDecodedMasks(targetEntry.masksSnapshot);
        setHasUnsavedChanges(true);

        console.log(`[Segmentation] History navigation for ${frameSliceKey} to step ${step}: ${targetEntry.description}`);
      }
    },
    [currentHistory, getCurrentFrameSliceKey, setDecodedMasks],
  );

  // History Management Actions - Frame/Slice Specific
  const handleHistoryClear = useCallback(() => {
    if (!decodedMasks) return;

    const frameSliceKey = getCurrentFrameSliceKey();

    // Keep only the current state for this frame/slice
    const currentEntry = createHistoryEntry("clear", "History cleared", decodedMasks);

    setFrameSliceHistories((prev) => ({
      ...prev,
      [frameSliceKey]: [currentEntry],
    }));

    setFrameSliceHistorySteps((prev) => ({
      ...prev,
      [frameSliceKey]: 0,
    }));

    console.log(`[Segmentation] History cleared for ${frameSliceKey}`);
  }, [decodedMasks, createHistoryEntry, getCurrentFrameSliceKey]);

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

      // Refresh masks from backend to ensure we have the latest data
      await refreshMasks();

      // After refreshing, clear local changes state
      setHasUnsavedChanges(false);
      setLocalDecodedMasks(null); // Clear local edits since they're now saved in backend

      console.log("[Segmentation] Successfully saved and refreshed masks from backend");
    } catch (err) {
      console.error("Failed to save editable masks:", err);
    } finally {
      setIsSaving(false);
    }
  }, [decodedMasks, projectId, isSaving, refreshMasks]);

  // To do: Export history timeline
  const handleHistoryExport = useCallback(() => {
    console.log("Export triggered from page level");
  }, []);

  // Initialize history when masks become available from context - ONLY ONCE
  useEffect(() => {
    // Only initialize history if we have masks from context and haven't initialized yet
    if (!masksInitialized && contextDecodedMasks && Object.keys(contextDecodedMasks).length > 0) {
      console.log("[Segmentation] Initializing history with context masks...");

      // Set local masks to context masks initially
      setLocalDecodedMasks(contextDecodedMasks);

      // Initialize history
      initializeHistory(contextDecodedMasks);
      setMasksInitialized(true);

      console.log("[Segmentation] History initialized successfully with", Object.keys(contextDecodedMasks).length, "masks");
    }
  }, [contextDecodedMasks, masksInitialized, initializeHistory]);

  // Auto-initialize history for new frame/slice combinations
  useEffect(() => {
    // Only run if we have masks and are initialized
    if (masksInitialized && decodedMasks && Object.keys(decodedMasks).length > 0) {
      const frameSliceKey = getCurrentFrameSliceKey();
      
      // Check if history exists for current frame/slice
      if (!frameSliceHistories[frameSliceKey]) {
        console.log(`[Segmentation] Auto-initializing history for new frame/slice: ${frameSliceKey}`);
        initializeHistory(decodedMasks);
      }
    }
  }, [currentFrame, currentSlice, masksInitialized, decodedMasks, frameSliceHistories, getCurrentFrameSliceKey, initializeHistory]);

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
    <div className="h-full w-full bg-background ">
      <div className="container mx-auto h-full p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        <main className="flex-1 flex flex-col gap-4 lg:gap-6 overflow-hidden">

          <div className="flex-1 relative bg-muted/40 rounded-xl border shadow-sm p-4 flex items-center justify-center">
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
              hardness={hardness}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              resetTrigger={resetTrigger}
            />
          </div>
        </main>

        <aside className="w-full lg:w-80 flex-none">
          <div className="bg-background rounded-xl border shadow-sm h-full">
            <SegmentationSidebar
              projectData={projectData}
              decodedMasks={safeDecodedMasks}
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
              onHistoryStepChange={handleHistoryStepChange}
              onHistoryClear={handleHistoryClear}
              onHistoryExport={handleHistoryExport}
              onHistoryCheckpoint={handleHistoryCheckpoint}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              onReset={handleReset}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
