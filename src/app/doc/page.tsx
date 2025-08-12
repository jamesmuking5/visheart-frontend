"use client";

import React, { Suspense, useState, useCallback, Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

// Preload the model immediately
useGLTF.preload('/sliced-heart.glb');

// Custom Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error, resetError: () => void) => ReactNode;
  onReset?: () => void;
  resetKeys?: any[];
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Model Error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.setState({ hasError: false, error: undefined });
      }
    }
  }

  resetError = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.resetError);
    }

    return this.props.children;
  }
}

// Error fallback component
function ModelErrorFallback(error: Error, resetErrorBoundary: () => void) {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-xl">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">3D Model Loading Error</h3>
      <p className="text-gray-600 mb-4">Failed to load the 3D heart model. Please try refreshing the page.</p>
      <div className="space-x-2">
        <button 
          onClick={resetErrorBoundary}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// 3D Model Viewer Component with error handling
function SlicedHeartModel() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Force clear any cache on component mount to ensure fresh load on refresh
    console.log('Component mounted - preparing for 3D model load');
  }, []);

  try {
    const { scene } = useGLTF('/sliced-heart.glb');
    
    useEffect(() => {
      if (scene && !isLoaded) {
        setIsLoaded(true);
        console.log('3D Model loaded successfully');
      }
    }, [scene, isLoaded]);
    
    if (!scene) {
      throw new Error('Failed to load 3D model scene');
    }
    
    return <primitive object={scene} scale={2} dispose={null} />;
  } catch (error) {
    console.error('Error loading 3D model:', error);
    throw error; // This will be caught by the ErrorBoundary
  }
}

// Loading component
function LoadingModel() {
  return (
    <div className="text-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading 3D Model...</p>
    </div>
  );
}

const DocPage = () => {
  const [modelKey, setModelKey] = useState(0);

  const handleModelReset = useCallback(() => {
    setModelKey(prev => prev + 1);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Documentation</h1>
      <p className="text-lg mb-8">
        Welcome to the documentation page. Here you will find all the information you need to use our services.
      </p>

      {/* New 3D Model Section */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Sliced Heart 3D Model</h2>
        <div className="w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden">
          <ErrorBoundary
            fallback={ModelErrorFallback}
            onReset={handleModelReset}
            resetKeys={[modelKey]}
          >
            <Suspense fallback={<LoadingModel />}>
              <Canvas 
                camera={{ position: [0, 0, 5], fov: 50 }}
                onCreated={({ gl }) => {
                  gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                }}
              >
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <SlicedHeartModel />
                <OrbitControls 
                  enablePan={true} 
                  enableZoom={true} 
                  enableRotate={true}
                  maxDistance={10}
                  minDistance={2}
                />
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Use mouse to rotate, zoom, and pan around the 3D model.
        </p>
      </section>
    </div>
  );
};

export default DocPage;