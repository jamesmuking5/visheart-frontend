"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

// Backend integration
import { projectApi, segmentationApi } from "@/lib/api";
import { decodeSegmentationMasks } from "@/lib/decode-RLE(test)";
import type { ProjectData, BaseSegmentationMask, LoadingStage } from "@/types/project(test)";
import { LoadingProject } from "@/components/project(test)/LoadingProject";
import { ErrorProject } from "@/components/project(test)/ErrorProject";
import { SegmentationSidebar } from "@/components/segmentation/segmentation-sidebar";
import type { AnatomicalLabel, HistoryEntry, DrawingTool } from "@/types/segmentation";

// Import tar cache for background image preloading
import { tarImageCache } from "@/lib/tar-image-cache";

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

  // Backend state
  const [loading, setLoading] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [undecodedMasks, setUndecodedMasks] = useState<BaseSegmentationMask[] | null>(null);
  const [decodedMasks, setDecodedMasks] = useState<Record<string, Uint8Array> | null>(null);
  const [masksInitialized, setMasksInitialized] = useState(false);

  // Tar cache state for background images
  const [isTarCacheReady, setIsTarCacheReady] = useState(false);
  const [tarCacheError, setTarCacheError] = useState<string | null>(null);

  // UI state
  const [activeLabel, setActiveLabel] = useState<AnatomicalLabel>("lvc");
  const [tool, setTool] = useState<DrawingTool>("brush");
  const [brushSize, setBrushSize] = useState<number>(10);
  const [opacity, setOpacity] = useState<number>(1);
  const [hardness, setHardness] = useState<"soft" | "medium" | "hard">("hard");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentSlice, setCurrentSlice] = useState(0);

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
    return frameSliceHistorySteps[key] || 0;
  }, [frameSliceHistorySteps, getCurrentFrameSliceKey]);

  // Memoized History Values for current frame/slice
  const canUndo = useMemo(() => currentHistoryStep > 0, [currentHistoryStep]);
  const canRedo = useMemo(() => currentHistoryStep < currentHistory.length - 1, [currentHistoryStep, currentHistory.length]);
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
    [decodedMasks, activeLabel, createHistoryEntry, getCurrentFrameSliceKey, frameSliceHistories, frameSliceHistorySteps],
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

  // Navigation handlers that DON'T trigger undo/redo flag
  const handleFrameChange = useCallback(
    (frame: number) => {
      console.log(`[Segmentation] Changing frame from ${currentFrame} to ${frame}`);
      console.log(`[Segmentation] Current decodedMasks keys:`, decodedMasks ? Object.keys(decodedMasks) : "null");
      setCurrentFrame(frame);
    },
    [currentFrame, decodedMasks],
  );

  const handleSliceChange = useCallback(
    (slice: number) => {
      console.log(`[Segmentation] Changing slice from ${currentSlice} to ${slice}`);
      console.log(`[Segmentation] Current decodedMasks keys:`, decodedMasks ? Object.keys(decodedMasks) : "null");
      setCurrentSlice(slice);
    },
    [currentSlice, decodedMasks],
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
  }, [canUndo, currentHistory, currentHistoryStep, getCurrentFrameSliceKey]);

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
  }, [canRedo, currentHistory, currentHistoryStep, getCurrentFrameSliceKey]);

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
    [currentHistory, getCurrentFrameSliceKey],
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

  // Save Handler - only save editable masks
  const handleSave = useCallback(async () => {
    if (!decodedMasks || !projectId) return;

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

      // Convert masks to the format expected by the API
      const frames = Object.entries(editableMasks).map(([key, data]) => ({
        key,
        data: Array.from(data), // Convert Uint8Array to regular array for JSON
        isMedSAMOutput: false, // Mark as manually edited
      }));

      await segmentationApi.saveManualSegmentation(projectId, {
        name: `Manual Segmentation - ${new Date().toISOString()}`,
        description: "Manually edited segmentation masks",
        frames: frames,
      });

      setHasUnsavedChanges(false);

      // Create a save checkpoint with proper numbering for current frame/slice
      const existingCheckpoints = currentHistory.filter((entry) => entry.type === "checkpoint").length;
      const checkpointNum = existingCheckpoints + 1;

      updateMasksWithHistory(decodedMasks, "checkpoint", `Checkpoint #${checkpointNum} - Editable masks saved to server`);
    } catch (err) {
      console.error("Failed to save editable masks:", err);
    }
  }, [decodedMasks, projectId, updateMasksWithHistory, currentHistory]);

  // To do: Export history timeline
  const handleHistoryExport = useCallback(() => {
    console.log("Export triggered from page level");
  }, []);

  // Load project data and initialize tar cache
  useEffect(() => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading("done");
      return;
    }

    setLoading("project");

    projectApi
      .getProjectInfo(projectId)
      .then(async (response) => {
        if (!response.success) {
          setError(response.message);
          setLoading("done");
          return;
        }
        setProjectData(response.project);

        // Initialize tar cache for background images after project is loaded
        try {
          console.log("[Segmentation] Initializing tar cache for background images...");
          await tarImageCache.init();

          // Check if images are already cached
          const { frames, slices } = await tarImageCache.getAvailableFramesAndSlices(projectId);
          if (frames.length > 0 && slices.length > 0) {
            console.log(`[Segmentation] Found ${frames.length} frames and ${slices.length} slices in tar cache`);
            setIsTarCacheReady(true);
          } else {
            console.log("[Segmentation] No cached images found, will attempt to extract from tar");
            // Attempt to fetch and extract images in background
            try {
              const result = await tarImageCache.fetchAndExtractProjectImages(projectId, projectApi.getProjectPresignedUrl);
              if (result.success) {
                console.log(`[Segmentation] Successfully extracted ${result.extractedImages} images to cache`);
                setIsTarCacheReady(true);
              } else {
                console.warn("[Segmentation] Failed to extract images, will use API fallback");
                setTarCacheError(`Image extraction failed: ${result.errors.join(", ")}`);
              }
            } catch (extractError) {
              console.warn("[Segmentation] Image extraction error, will use API fallback:", extractError);
              setTarCacheError(extractError instanceof Error ? extractError.message : "Unknown extraction error");
            }
          }
        } catch (cacheError) {
          console.warn("[Segmentation] Tar cache initialization failed, will use API fallback:", cacheError);
          setTarCacheError(cacheError instanceof Error ? cacheError.message : "Cache initialization failed");
        }
      })
      .catch(() => {
        setError("Failed to fetch project data.");
      })
      .finally(() => {
        setLoading("mask");
      });
  }, [projectId]);

  // Load masks with history initialization - ONLY ONCE
  useEffect(() => {
    // Prevent reloading if masks are already initialized
    if (masksInitialized || error || !projectData || !projectId) {
      if (!masksInitialized && projectData && projectId && !error) {
        console.log("[Segmentation] Ready to load masks but not initialized yet");
      }
      setLoading("done");
      return;
    }

    console.log("[Segmentation] Loading masks for the first time...");

    segmentationApi
      .getSegmentationResults(projectId)
      .then((response) => {
        if (!response.success) {
          setError("No segmentation masks found. Please run segmentation first.");
          return;
        }

        setUndecodedMasks(response.segmentations);
        // Console log dimensions for masks (use original DB dimensions)
        console.log("[Segmentation] Decoding with original DB dimensions:", {
          width: projectData.dimensions?.width,
          height: projectData.dimensions?.height,
          format: `${projectData.dimensions?.width} × ${projectData.dimensions?.height}`,
        });

        // Decode masks using ORIGINAL database dimensions (no swapping)
        const decoded = decodeSegmentationMasks(response.segmentations, projectData.dimensions?.width || 0, projectData.dimensions?.height || 0);

        // Console log the decoded masks as expandable arrays
        console.log("[Segmentation] Decoded Masks Overview");
        console.log("Total masks found:", Object.keys(decoded.masks).length);
        console.log("Raw decoded masks object:", decoded.masks);

        setDecodedMasks(decoded.masks);
        initializeHistory(decoded.masks); // Initialize history
        setMasksInitialized(true); // Mark as initialized to prevent reloading
        console.log("[Segmentation] Masks initialized successfully");
      })
      .catch(() => {
        setError("Failed to load segmentation masks.");
      })
      .finally(() => {
        setLoading("done");
      });
  }, [projectData, projectId, error, masksInitialized]); // Removed initializeHistory from dependencies

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
            <button onClick={() => router.push(`/project(test)/${projectId}`)} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Project
            </button>
          </div>
          <h1 className="text-2xl font-bold text-center">Cardiac Segmentation Editor</h1>
          <p className="text-center text-gray-500 mb-4">Project: {projectData.name} • Edit AI-generated masks or create manual annotations</p>
        </div>

        <div className="flex-1 relative bg-background rounded-xl border shadow-sm p-4 flex items-center justify-center">
          <ImageCanvas
            projectData={projectData}
            decodedMasks={decodedMasks}
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
            isTarCacheReady={isTarCacheReady}
            tarCacheError={tarCacheError}
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
            visibleMasks={visibleMasks}
            setVisibleMasks={setVisibleMasks}
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
            historyData={currentHistory}
            currentHistoryStep={currentHistoryStep}
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
