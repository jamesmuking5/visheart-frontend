"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

// 3D Model Viewer Component
function SlicedHeartModel() {
  const { scene } = useGLTF('/sliced-heart.glb'); // Place sliced-heart.glb in public folder
  return <primitive object={scene} scale={2} />;
}

const DocPage = () => {
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
          <Suspense fallback={<div className="text-center py-20">Loading 3D Model...</div>}>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <SlicedHeartModel />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          </Suspense>
        </div>
      </section>
    </div>
  );
};

export default DocPage;