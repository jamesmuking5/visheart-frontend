"use client";
import { useEffect, useRef, Suspense, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stage, Environment, useGLTF } from "@react-three/drei";
import { AlertCircle } from "lucide-react";

interface GLBModelProps { 
  url: string; 
}

function GLBModel({ url }: GLBModelProps) {
  const { scene } = useGLTF(url);
  useEffect(() => { 
    console.log("[GLBViewer] Model loaded"); 
  }, [scene, url]);
  return <primitive object={scene} />;
}

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
}

interface CameraControllerProps {
  onCameraChange: (state: CameraState) => void;
  initialState: CameraState | null;
}

function CameraController({ onCameraChange, initialState }: CameraControllerProps) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const hasRestoredRef = useRef(false);
  const lastSavedStateRef = useRef<string>("");

  useEffect(() => {
    if (initialState && controlsRef.current && !hasRestoredRef.current) {
      camera.position.set(...initialState.position);
      controlsRef.current.target.set(...initialState.target);
      controlsRef.current.update();
      hasRestoredRef.current = true;
      console.log("[GLBViewer] Restored camera state:", initialState);
    }
  }, [initialState, camera]);

  const handleChangeEnd = () => {
    // Only save state when user finishes moving (not during movement)
    if (controlsRef.current) {
      const state: CameraState = {
        position: camera.position.toArray() as [number, number, number],
        target: controlsRef.current.target.toArray() as [number, number, number],
      };
      
      // Only update if state actually changed (prevents unnecessary re-renders)
      const stateString = JSON.stringify(state);
      if (stateString !== lastSavedStateRef.current) {
        lastSavedStateRef.current = stateString;
        onCameraChange(state);
      }
    }
  };

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableZoom
      enablePan
      enableRotate
      zoomSpeed={1.0}
      panSpeed={1.0}
      rotateSpeed={1.0}
      onEnd={handleChangeEnd}
    />
  );
}

interface ReconstructionGLBViewerProps { 
  modelUrl: string | null; 
  frame: number; 
  className?: string; 
}

export function ReconstructionGLBViewer({ 
  modelUrl, 
  frame, 
  className = "" 
}: ReconstructionGLBViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraState, setCameraState] = useState<CameraState | null>(null);

  const handleCameraChange = (state: CameraState) => {
    setCameraState(state);
  };

  if (!modelUrl) {
    return (
      <div className={"flex items-center justify-center bg-muted/30 rounded-lg border border-dashed " + className}>
        <div className="text-center p-8">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
          <h3 className="font-semibold mt-2">No Model Loaded</h3>
          <p className="text-sm text-muted-foreground">Select a frame</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={"relative rounded-lg border overflow-hidden bg-background " + className}
    >
      <div className="absolute top-3 left-3 z-10 px-3 py-2 rounded-md bg-black/70 text-white text-xs font-semibold">
        Frame {frame}
      </div>
      
      <Canvas 
        camera={{ 
          position: [70, 20, -75], 
          fov: 90,
          near: 0.5,
          far: 1000
        }} 
        style={{ width: "100%", height: "100%" }} 
        gl={{ 
          antialias: true,
          alpha: true
        }}
      >
        <Suspense 
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#888" wireframe />
            </mesh>
          }
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          
          <Stage 
            intensity={0.5} 
            environment="city" 
            adjustCamera={false}
            shadows={false}
          >
            <GLBModel url={modelUrl} />
          </Stage>
          
          <Environment preset="studio" />
          
          <CameraController 
            onCameraChange={handleCameraChange} 
            initialState={cameraState} 
          />
        </Suspense>
      </Canvas>
      
      <div className="absolute top-3 right-3 z-10 px-3 py-2 rounded-md bg-black/70 text-white text-xs">
        <p className="font-semibold">Controls:</p>
        <p>Left Click+Drag: Rotate</p>
        <p>Right Click+Drag: Pan</p>
        <p>Scroll: Zoom</p>
      </div>
    </div>
  );
}