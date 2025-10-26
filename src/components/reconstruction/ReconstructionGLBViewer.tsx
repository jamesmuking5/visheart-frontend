"use client";
import { useEffect, useRef, Suspense, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { AlertCircle, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import * as THREE from "three";

// Visualization settings interface
interface ViewerSettings {
  modelColor: string;
  background: 'gradient' | 'solid-dark' | 'solid-light' | 'white' | 'responsive';
  showGrid: boolean;
  roughness: number;
  metalness: number;
  opacity: number;
}

// Default settings
const DEFAULT_SETTINGS: ViewerSettings = {
  modelColor: '#c41e3a', // Cardiac tissue color
  background: 'responsive',
  showGrid: true,
  roughness: 0.25,
  metalness: 0.65,
  opacity: 1.0,
};

// Preset color palette for cardiac structures
const COLOR_PRESETS = {
  'White': '#ffffff',
  'Red': '#c41e3a',
  'Blue': '#4a90e2',
  'Green': '#09af00',
  'Purple': '#4a26fd',
};

// Model loader that supports both GLB/GLTF and OBJ formats
interface ModelProps { 
  url: string;
  settings: ViewerSettings;
}

function Model({ url, settings }: ModelProps) {
  const [fileType, setFileType] = useState<'obj' | 'glb' | null>(null);
  
  // Detect file type from blob MIME type (for blob URLs) or extension (for regular URLs)
  useEffect(() => {
    const detectFileType = async () => {
      if (url.startsWith('blob:')) {
        // For blob URLs, fetch and check MIME type
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const mimeType = blob.type;
          
          console.log('[Model] Detected blob MIME type:', mimeType);
          
          if (mimeType === 'text/plain') {
            setFileType('obj');
          } else {
            setFileType('glb');
          }
        } catch (err) {
          console.error('[Model] Failed to detect file type:', err);
          setFileType('glb'); // Default to GLB
        }
      } else {
        // For regular URLs, check file extension
        const fileExtension = url.split('.').pop()?.toLowerCase();
        setFileType(fileExtension === 'obj' ? 'obj' : 'glb');
      }
    };
    
    detectFileType();
  }, [url]);
  
  if (!fileType) {
    // Loading state while detecting file type
    return (
      <Center>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#888888" wireframe />
        </mesh>
      </Center>
    );
  }
  
  if (fileType === 'obj') {
    return <OBJModel url={url} settings={settings} />;
  } else {
    return <GLBModel url={url} settings={settings} />;
  }
}

function GLBModel({ url, settings }: ModelProps) {
  const { scene } = useGLTF(url);
  const sceneRef = useRef<THREE.Group | null>(null);
  
  useEffect(() => { 
    console.log("[GLBViewer] GLB/GLTF Model loaded or settings changed");
    
    // Apply customizable materials to all meshes
    const targetScene = sceneRef.current || scene;
    targetScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          
          // Apply settings
          material.color = new THREE.Color(settings.modelColor);
          material.roughness = settings.roughness;
          material.metalness = settings.metalness;
          material.transparent = settings.opacity < 1;
          material.opacity = settings.opacity;
          material.envMapIntensity = 1.2;
          material.needsUpdate = true; // Force material update
        }
      }
    });
  }, [scene, settings, url]); // Added url to dependencies
  
  useEffect(() => {
    // Store the scene reference
    if (scene) {
      sceneRef.current = scene;
    }
  }, [scene]);
  
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function OBJModel({ url, settings }: ModelProps) {
  const [obj, setObj] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load OBJ file
  useEffect(() => {
    console.log("[OBJViewer] Starting OBJ load from URL:", url);
    const loader = new OBJLoader();
    
    loader.load(
      url,
      (loadedObj) => {
        console.log("[OBJViewer] OBJ Model loaded successfully", loadedObj);
        setObj(loadedObj);
        setError(null);
      },
      (progress) => {
        console.log("[OBJViewer] Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (err) => {
        const errorMessage = err instanceof Error ? err.message : "Failed to load OBJ file";
        console.error("[OBJViewer] Error loading OBJ:", err);
        setError(errorMessage);
      }
    );
  }, [url]);

  // Apply settings whenever they change
  useEffect(() => {
    if (!obj) return;

    console.log("[OBJViewer] Applying material settings to OBJ");
    
    // Apply customizable materials to OBJ
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        console.log("[OBJViewer] Updating material for mesh:", mesh.name || "unnamed");
        
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(settings.modelColor),
          roughness: settings.roughness,
          metalness: settings.metalness,
          transparent: settings.opacity < 1,
          opacity: settings.opacity,
          envMapIntensity: 1.2,
        });
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [obj, settings]);

  if (error) {
    console.error("[OBJViewer] Render error:", error);
    return (
      <mesh>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
    );
  }

  if (!obj) {
    console.log("[OBJViewer] Waiting for OBJ to load...");
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#888" wireframe />
      </mesh>
    );
  }
  
  return (
    <Center>
      <primitive object={obj} />
    </Center>
  );
}

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
}

// Anatomical camera preset positions
const CAMERA_PRESETS = {
  default: { position: [70, 20, -75], target: [0, 0, 0] },
  front: { position: [0, 0, 100], target: [0, 0, 0] },
  back: { position: [0, 0, -100], target: [0, 0, 0] },
  top: { position: [0, 100, 0], target: [0, 0, 0] },
  bottom: { position: [0, -100, 0], target: [0, 0, 0] },
  left: { position: [-100, 0, 0], target: [0, 0, 0] },
  right: { position: [100, 0, 0], target: [0, 0, 0] },
  isometric: { position: [70, 70, 70], target: [0, 0, 0] },
} as const;

type CameraPreset = keyof typeof CAMERA_PRESETS;

interface CameraControllerProps {
  onCameraChange: (state: CameraState) => void;
  initialState: CameraState | null;
  activePreset: CameraPreset | null;
  onPresetComplete: () => void;
}

function CameraController({ onCameraChange, initialState, activePreset, onPresetComplete }: CameraControllerProps) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const hasRestoredRef = useRef(false);
  const lastSavedStateRef = useRef<string>("");

  // Handle preset camera movements
  useEffect(() => {
    if (activePreset && controlsRef.current) {
      const preset = CAMERA_PRESETS[activePreset];
      const controls = controlsRef.current;
      
      // Smoothly animate to preset position
      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(...preset.position);
      const startTarget = controls.target.clone();
      const endTarget = new THREE.Vector3(...preset.target);
      
      const duration = 1000; // 1 second animation
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Interpolate position and target
        camera.position.lerpVectors(startPos, endPos, eased);
        controls.target.lerpVectors(startTarget, endTarget, eased);
        controls.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onPresetComplete();
        }
      };
      
      animate();
    }
  }, [activePreset, camera, onPresetComplete]);

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
  // useTheme hook ensures component re-renders when theme changes (needed for responsive background)
  useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraState, setCameraState] = useState<CameraState | null>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ViewerSettings>(DEFAULT_SETTINGS);

  const handleCameraChange = (state: CameraState) => {
    setCameraState(state);
  };

  const handlePresetClick = (preset: CameraPreset) => {
    setActivePreset(preset);
  };

  const handlePresetComplete = () => {
    setActivePreset(null);
  };

  // Background gradient mapping
  const getBackgroundClass = () => {
    switch (settings.background) {
      case 'gradient': return 'bg-gradient-to-b from-slate-900 to-slate-800';
      case 'solid-dark': return 'bg-slate-900';
      case 'solid-light': return 'bg-slate-400';
      case 'white': return 'bg-white';
      case 'responsive': return 'bg-background'; // Adapts to theme (black in dark, white in light)
      default: return 'bg-gradient-to-b from-slate-900 to-slate-800';
    }
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
      className={"relative rounded-lg border overflow-hidden " + getBackgroundClass() + " " + className}
    >
      {/* Frame Badge */}
      <div className="absolute top-3 left-3 z-10 px-3 py-2 rounded-md bg-black/70 text-white text-xs font-semibold">
        Frame {frame}
      </div>

      {/* Camera Preset Buttons */}
      <div className="absolute top-3 right-3 z-10 space-y-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowPresets(!showPresets)}
            className="bg-black/70 hover:bg-black/90 text-white text-xs"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Views
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-black/70 hover:bg-black/90 text-white text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </Button>
        </div>
        
        {showPresets && (
          <div className="grid grid-cols-2 gap-1 p-2 rounded-md bg-black/70 text-white text-[10px]">
            {Object.keys(CAMERA_PRESETS).map((preset) => (
              <Button
                key={preset}
                size="sm"
                variant="ghost"
                onClick={() => handlePresetClick(preset as CameraPreset)}
                className="h-7 px-2 hover:bg-white/20 text-white text-[10px]"
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-72 p-4 rounded-md bg-black/90 text-white text-xs space-y-4 max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Visualization Settings</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(false)}
                className="h-6 w-6 p-0 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Model Color */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Model Color</Label>
              <Select
                value={settings.modelColor}
                onValueChange={(value) => setSettings({ ...settings, modelColor: value })}
              >
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLOR_PRESETS).map(([name, color]) => (
                    <SelectItem key={color} value={color} className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                        {name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="color"
                value={settings.modelColor}
                onChange={(e) => setSettings({ ...settings, modelColor: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>

            {/* Background */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Background</Label>
              <Select
                value={settings.background}
                onValueChange={(value) => setSettings({ ...settings, background: value as ViewerSettings['background'] })}
              >
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient">Gradient (Slate)</SelectItem>
                  <SelectItem value="solid-dark">Solid Dark</SelectItem>
                  <SelectItem value="solid-light">Solid Light</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="responsive">Responsive (Theme)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Roughness */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-white text-xs">Roughness</Label>
                <span className="text-white/60 text-xs">{settings.roughness.toFixed(2)}</span>
              </div>
              <Slider
                value={[settings.roughness]}
                onValueChange={([value]) => setSettings({ ...settings, roughness: value })}
                min={0}
                max={1}
                step={0.05}
                className="[&>span:first-child]:bg-white/20"
              />
            </div>

            {/* Metalness */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-white text-xs">Metalness</Label>
                <span className="text-white/60 text-xs">{settings.metalness.toFixed(2)}</span>
              </div>
              <Slider
                value={[settings.metalness]}
                onValueChange={([value]) => setSettings({ ...settings, metalness: value })}
                min={0}
                max={1}
                step={0.05}
                className="[&>span:first-child]:bg-white/20"
              />
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-white text-xs">Opacity</Label>
                <span className="text-white/60 text-xs">{Math.round(settings.opacity * 100)}%</span>
              </div>
              <Slider
                value={[settings.opacity]}
                onValueChange={([value]) => setSettings({ ...settings, opacity: value })}
                min={0.1}
                max={1}
                step={0.05}
                className="[&>span:first-child]:bg-white/20"
              />
            </div>

            {/* Grid Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-white text-xs">Ground Grid</Label>
              <Switch
                checked={settings.showGrid}
                onCheckedChange={(checked) => setSettings({ ...settings, showGrid: checked })}
              />
            </div>

            {/* Reset to Defaults */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="w-full text-xs mt-4 bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              Reset to Defaults
            </Button>
          </div>
        )}
      </div>
      
      <Canvas 
        camera={{ 
          position: [70, 20, -75], 
          fov: 50, // Reduced FOV for less distortion
          near: 0.1,
          far: 2000
        }} 
        style={{ width: "100%", height: "100%" }} 
        gl={{ 
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
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
          {/* Balanced Lighting Setup for Medical Visualization */}
          {/* Key Light - Main light source (front-top) */}
          <directionalLight 
            position={[30, 80, 60]} 
            intensity={2.8} 
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          {/* Fill Light - Soften shadows (left-front) */}
          <directionalLight 
            position={[-50, 40, 50]} 
            intensity={1.8} 
          />
          
          {/* Back Light - Depth and separation (back-top) */}
          <directionalLight 
            position={[-20, 50, -60]} 
            intensity={1.4} 
            color="#ffffff"
          />
          
          {/* Ambient Light - Overall scene illumination */}
          <ambientLight intensity={1.0} />
          
          {/* Hemisphere Light - Natural sky/ground gradient */}
          <hemisphereLight 
            color="#ffffff" 
            groundColor="#aaaaaa" 
            intensity={0.6} 
          />
          
          {/* Ground Grid for spatial reference - toggleable */}
          {settings.showGrid && (
            <gridHelper args={[200, 20, '#666666', '#333333']} position={[0, -30, 0]} />
          )}
          
          {/* Model with settings */}
          <Model url={modelUrl} settings={settings} />
          
          <CameraController 
            onCameraChange={handleCameraChange} 
            initialState={cameraState}
            activePreset={activePreset}
            onPresetComplete={handlePresetComplete}
          />
        </Suspense>
      </Canvas>
      
      {/* Controls Info */}
      <div className="absolute bottom-3 right-3 z-10 px-3 py-2 rounded-md bg-black/70 text-white text-xs">
        <p className="font-semibold">Controls:</p>
        <p>Left Click+Drag: Rotate</p>
        <p>Right Click+Drag: Pan</p>
        <p>Scroll: Zoom</p>
      </div>
    </div>
  );
}