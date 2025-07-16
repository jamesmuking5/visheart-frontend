"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, PerspectiveCamera } from '@react-three/drei';
import type { Mesh, Group, PerspectiveCamera as PerspectiveCameraType } from 'three';

// --- 3D Gallery Components (defined within the page) ---
// This component represents a single image plane in the 3D scene
function ImagePlane({ url, ...props }: { url: string } & React.ComponentProps<'mesh'>) {
  const texture = useTexture(url);
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<Mesh>(null!);

  useFrame(() => {
    // Animate scale on hover
    gsap.to(meshRef.current.scale, {
      x: hovered ? 1.1 : 1,
      y: hovered ? 1.1 : 1,
      z: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  });

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[3.8, 2.8]} /> {/* Aspect ratio similar to 380x280 */}
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// This is the main component that sets up the 3D scene and GSAP animation
function ThreeDGallery({ images, trigger }: { images: { src: string; alt: string }[], trigger: HTMLElement | null }) {
  const groupRef = useRef<Group>(null);
  const cameraRef = useRef<PerspectiveCameraType>(null);

  // Create a long, repeating array of images for a continuous effect
  const imagePlanes = useMemo(() => {
    const repeatedImages = Array.from({ length: 5 }).flatMap(() => images); // Repeat the images 5 times
    return repeatedImages.map((image, index) => {
      const spacingX = 1.5; // Controls horizontal distance
      const spacingY = 1.0; // Controls vertical distance
      return {
        ...image,
        position: [index * spacingX, index * spacingY, 0] as [number, number, number],
         rotation: [0, -Math.PI / 6, 0] as [number, number, number], // Slant images by -30 degrees on Y-axis
      };
    });
  }, [images]);

  // Use GSAP to animate the camera on scroll
  useEffect(() => {
    if (cameraRef.current && trigger) {
      const spacingX = 1.5;
      const spacingY = 1.0;
      const totalDistanceX = (imagePlanes.length - 1) * spacingX;
      const totalDistanceY = (imagePlanes.length - 1) * spacingY;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: "top top",
          end: `+=${totalDistanceX * 100}`,
          scrub: 1.5,
          pin: true,
        },
      });

      tl.to(cameraRef.current.position, {
        x: totalDistanceX,
        y: totalDistanceY,
        ease: "none",
      });

      return () => {
        tl.kill();
      };
    }
  }, [imagePlanes.length, trigger]);

  return (
    <Canvas>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 15]} fov={30} />
      <ambientLight intensity={2.5} />
      <group ref={groupRef}>
        {imagePlanes.map((image, index) => (
          <ImagePlane key={index} url={image.src} position={image.position} rotation={image.rotation} />
        ))}
      </group>
    </Canvas>
  );
}

// The main exported section component
export function InteractiveGallerySection() { // Removed the 'images' prop as it's no longer needed
  const sectionRef = useRef<HTMLDivElement>(null);

  // Define the images for the 3D gallery here
  const gallery3DImages = useMemo(() => [
    { src: "/image-1.png", alt: "Cardiac MRI Scan" },
    { src: "/image-2.png", alt: "High-Reso Cardiac MRI Scan" },
    { src: "/image-3.png", alt: "Doctor Interface" },
  ], []);

  return (
    <section className="bg-gradient-to-br from-background to-muted">
      <div className="py-24 px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-light mb-6 text-foreground">
            Interactive Gallery
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our advanced cardiac imaging capabilities and see how VisHeart transforms medical visualization for better patient outcomes.
          </p>
        </motion.div>
      </div>

      <div ref={sectionRef} id="3d-gallery-section" className="relative h-[150vh] w-full">
        <div className="sticky top-0 h-screen w-full">
          <ThreeDGallery images={gallery3DImages} trigger={sectionRef.current} />
        </div>
      </div>
    </section>
  );
}