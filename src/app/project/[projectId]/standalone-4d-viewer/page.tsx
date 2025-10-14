"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { LoadingProject } from "@/components/project/LoadingProject";
import { ErrorProject } from "@/components/project/ErrorProject";
import { ReconstructionGLBViewer } from "@/components/reconstruction/ReconstructionGLBViewer";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Loader2,
  AlertCircle 
} from "lucide-react";

export default function Standalone4DViewerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  // Get data from ProjectContext
  const {
    loading,
    error,
    projectData,
    hasReconstructions,
    reconstructionCacheReady,
    reconstructionCacheError,
    getReconstructionGLB,
    reconstructionMetadata,
  } = useProject();

  // Update page title dynamically
  useEffect(() => {
    if (projectData?.name) {
      document.title = `VisHeart | ${projectData.name} - 4D Viewer`;
    } else {
      document.title = "VisHeart | 4D Reconstruction Viewer";
    }
    
    return () => {
      document.title = "VisHeart";
    };
  }, [projectData?.name]);

  // Viewer state
  const [currentFrame, setCurrentFrame] = useState(0);
  const [reconstructionModelUrl, setReconstructionModelUrl] = useState<string | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms per frame

  const totalFrames = projectData?.dimensions?.frames || 0;

  // Load 3D reconstruction model when frame changes
  useEffect(() => {
    if (!hasReconstructions || !reconstructionCacheReady) {
      setReconstructionModelUrl(null);
      return;
    }

    const loadModel = async () => {
      setIsLoadingModel(true);
      try {
        console.log(`[Standalone4DViewer] Loading model for frame ${currentFrame}...`);
        const url = await getReconstructionGLB(currentFrame);
        if (url) {
          console.log(`[Standalone4DViewer] ✅ Loaded model for frame ${currentFrame}`);
          setReconstructionModelUrl(url);
        } else {
          console.warn(`[Standalone4DViewer] ❌ No model URL for frame ${currentFrame}`);
          setReconstructionModelUrl(null);
        }
      } catch (error) {
        console.error(`[Standalone4DViewer] Error loading model:`, error);
        setReconstructionModelUrl(null);
      } finally {
        setIsLoadingModel(false);
      }
    };

    loadModel();
  }, [currentFrame, hasReconstructions, reconstructionCacheReady, getReconstructionGLB]);

  // Playback animation
  useEffect(() => {
    if (!isPlaying || totalFrames === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, totalFrames, playbackSpeed]);

  // Keyboard navigation for frame control
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent default browser behavior for arrow keys
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }

      switch (event.key) {
        case "ArrowLeft":
          // Go to previous frame
          setCurrentFrame((prev) => Math.max(0, prev - 1));
          setIsPlaying(false); // Pause playback when manually navigating
          break;
        case "ArrowRight":
          // Go to next frame
          setCurrentFrame((prev) => Math.min(totalFrames - 1, prev + 1));
          setIsPlaying(false); // Pause playback when manually navigating
          break;
        case " ":
          // Spacebar toggles play/pause
          event.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [totalFrames]);

  // Loading state
  if (loading !== "done") {
    return <LoadingProject loadingStage={loading} />;
  }

  // Error state
  if (error) {
    return <ErrorProject error={error} />;
  }

  // Null check for projectData
  if (!projectData) {
    return <ErrorProject error="Failed to load project data" />;
  }

  // No reconstruction data
  if (!hasReconstructions) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No 4D Reconstruction Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This project does not have a 4D reconstruction yet.
              </p>
              <Button onClick={() => router.push(`/project/${projectId}`)}>
                Return to Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cache error state
  if (reconstructionCacheError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Reconstruction</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {reconstructionCacheError}
              </p>
              <Button onClick={() => router.push(`/project/${projectId}`)}>
                Return to Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl h-screen flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{projectData.name}</h1>
            <p className="text-sm text-muted-foreground">4D Cardiac Reconstruction Viewer</p>
          </div>
        </div>
        
        {reconstructionMetadata && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {reconstructionMetadata.name || "Reconstruction"}
            </Badge>
            {!reconstructionCacheReady && (
              <Badge variant="secondary">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading cache...
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Main Viewer */}
      <div className="flex-1 min-h-0 mb-4">
        <ReconstructionGLBViewer
          modelUrl={reconstructionModelUrl}
          frame={currentFrame + 1} // 1-based index for user friendliness
          className="w-full h-full"
        />
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Playback Controls</span>
            {isLoadingModel && (
              <Badge variant="secondary">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading model...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Frame Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Frame: {currentFrame + 1} / {totalFrames}</span>
              <span className="text-muted-foreground">
                {Math.round((currentFrame / (totalFrames - 1)) * 100)}%
              </span>
            </div>
            <Slider
              value={[currentFrame]}
              onValueChange={(value) => {
                setCurrentFrame(value[0]);
                setIsPlaying(false);
              }}
              max={totalFrames - 1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Playback Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentFrame(0)}
              disabled={currentFrame === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
              disabled={currentFrame === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1))}
              disabled={currentFrame === totalFrames - 1}
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentFrame(totalFrames - 1)}
              disabled={currentFrame === totalFrames - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Playback Speed</span>
              <span className="text-muted-foreground">
                {(1000 / playbackSpeed).toFixed(1)} fps
              </span>
            </div>
            <Slider
              value={[playbackSpeed]}
              onValueChange={(value) => setPlaybackSpeed(value[0])}
              min={100}
              max={2000}
              step={100}
              className="w-full"
            />
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground font-medium mb-1">Keyboard Shortcuts:</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">←</kbd> Previous Frame</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">→</kbd> Next Frame</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">Space</kbd> Play/Pause</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
