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

  useEffect(() => {
    if (initialState && controlsRef.current && !hasRestoredRef.current) {
      camera.position.set(...initialState.position);
      controlsRef.current.target.set(...initialState.target);
      controlsRef.current.update();
      hasRestoredRef.current = true;
      console.log("[GLBViewer] Restored camera state:", initialState);
    }
  }, [initialState, camera]);

  const handleChange = () => {
    if (controlsRef.current) {
      const state: CameraState = {
        position: camera.position.toArray() as [number, number, number],
        target: controlsRef.current.target.toArray() as [number, number, number],
      };
      onCameraChange(state);
    }
  };

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableZoom
      enablePan
      zoomSpeed={0.5}
      onChange={handleChange}
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
      className={"relative rounded-lg border overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 " + className}
    >
      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-md bg-black/70 text-white text-xs font-semibold">
        Frame {frame}
      </div>
      
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }} 
        style={{ width: "100%", height: "100%" }} 
        gl={{ antialias: true }}
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
          
          <Stage intensity={0.5} environment="city" adjustCamera={1.5}>
            <GLBModel url={modelUrl} />
          </Stage>
          
          <Environment preset="studio" />
          
          <CameraController 
            onCameraChange={handleCameraChange} 
            initialState={cameraState} 
          />
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-3 right-3 z-10 px-3 py-2 rounded-md bg-black/70 text-white text-xs">
        <p className="font-semibold">Controls:</p>
        <p>Click+Drag: Rotate</p>
        <p>Scroll: Zoom</p>
      </div>
    </div>
  );
}