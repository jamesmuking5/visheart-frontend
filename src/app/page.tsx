"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';

// --- Animation Library Imports ---
import { motion, AnimatePresence } from 'framer-motion';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// --- 3D and Canvas Imports ---
import { OrbitControls, useGLTF, useTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

// --- Page Section Component Imports ---
import { HeroSection } from '@/components/hero-section';
import { AboutUsSection } from '@/components/about-us-section'; 
import { ServicesSection } from '@/components/services-section';
import { FaqSection } from "@/components/faq-section";
import { GallerySection } from "@/components/gallery-section";
import { ContactSection } from "@/components/contact-section"; 
import { Commands } from '@/components/commands';
import { Heart3DSection } from '@/components/heart-3d-section';

// Register the GSAP ScrollTrigger plugin if in a browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// --- 3D Gallery Components (defined within the page) ---
// This component represents a single image plane in the 3D scene
function ImagePlane({ url, ...props }: { url: string } & JSX.IntrinsicElements['mesh']) {
  const texture = useTexture(url);
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);

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
      <planeGeometry args={[3.8, 2.8]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// This is the main component that sets up the 3D scene and GSAP animation
function ThreeDGallery({ images, trigger }: { images: { src: string; alt: string }[], trigger: HTMLElement | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Create a long, repeating array of images for a continuous effect
  const imagePlanes = useMemo(() => {
    const repeatedImages = Array.from({ length: 5 }).flatMap(() => images);
    return repeatedImages.map((image, index) => {
      const spacingX = 1.5;
      const spacingY = 1.0;
      return {
        ...image,
        position: [index * spacingX, index * spacingY, 0] as [number, number, number],
        rotation: [0, -Math.PI / 6, 0] as [number, number, number],
      };
    });
  }, [images]);

  // Use GSAP to animate the camera on scroll
  useEffect(() => {
    if (cameraRef.current) {
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
  }, [imagePlanes.length, cameraRef.current, trigger]);

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

export default function Home() {   
  // State for initial welcome animation
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  // New states for segmented animation
  const [currentAnimationSegment, setCurrentAnimationSegment] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [showInteractionPrompt, setShowInteractionPrompt] = useState(true);

  const threeDGallerySectionRef = useRef<HTMLDivElement>(null);

  // Define the images for the 3D gallery here using useMemo for stability
  const gallery3DImages = useMemo(() => [
    { src: "/image-1.png", alt: "Cardiac MRI Scan" },
    { src: "/image-2.png", alt: "High-Reso Cardiac MRI Scan" },
    { src: "/image-3.png", alt: "Doctor Interface" },
  ], []);

  // Feature hover animation
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  // Function to handle Learn More button click with effects
  const handleLearnMoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const button = e.currentTarget;
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      button.style.transform = 'scale(1)';
      
      const aboutSection = document.getElementById('info-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        
        setTimeout(() => {
          aboutSection.style.transition = 'all 0.8s ease';
          aboutSection.style.boxShadow = '0 0 30px rgba(88, 123, 154, 0.3)';
          aboutSection.style.transform = 'scale(1.01)';
          
          setTimeout(() => {
            aboutSection.style.boxShadow = '';
            aboutSection.style.transform = '';
          }, 1500);
        }, 800);
      }
    }, 150);
  };

  // Add state to track text animation completion
  const [textAnimationsComplete, setTextAnimationsComplete] = useState(false);
  const [case0AnimationCompleted, setCase0AnimationCompleted] = useState(false);
  
  // Animation advancement logic
  const advanceAnimation = () => {
    console.log('Current segment before advance:', currentAnimationSegment);
    
    if (currentAnimationSegment === 0 && !textAnimationsComplete) {
      console.log('Text animations not complete yet - blocking advancement');
      return;
    }
    
    if (currentAnimationSegment < 4) {
      setCurrentAnimationSegment(prev => {
        const newSegment = prev + 1;
        console.log('Advancing to segment:', newSegment);
        return newSegment;
      });
      setAnimationPaused(false);
      
      if (currentAnimationSegment === 0) {
        setShowInteractionPrompt(false);
      }
    } else {
      console.log('Animation complete, but keeping ECG visible');
      setShowInteractionPrompt(false);
      
      setTimeout(() => {
        setHasPlayedWelcome(true);
      }, 5000);
    }
  };
  
  // Update the keyboard and click event listeners
  useEffect(() => {
    const handleInteraction = (e: KeyboardEvent | MouseEvent) => {
      if (hasPlayedWelcome) return;
      
      if (currentAnimationSegment === 0 && !textAnimationsComplete) {
        console.log('Blocking interaction - text animations still running');
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      if (e.type === 'keydown') {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.code === 'Enter' || keyEvent.code === 'Space') {
          console.log('Keyboard interaction detected:', keyEvent.code);
          advanceAnimation();
        }
      } else if (e.type === 'click') {
        console.log('Click interaction detected');
        advanceAnimation();
      }
    };
  
    if (!hasPlayedWelcome) {
      console.log('Adding event listeners, current segment:', currentAnimationSegment);
      document.addEventListener('keydown', handleInteraction, { passive: false });
      document.addEventListener('click', handleInteraction, { passive: false });
    }
  
    return () => {
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, [currentAnimationSegment, hasPlayedWelcome, textAnimationsComplete]);
    
  // Reset text animations state when component mounts
  useEffect(() => {
    if (currentAnimationSegment === 0) {
      setTextAnimationsComplete(false);
    }
  }, [currentAnimationSegment]);
  
  // Add this useEffect after case 0 completes
  useEffect(() => {
    if (case0AnimationCompleted) {
      // Force final static state via CSS
      const text1 = document.getElementById('dramatic-text-1');
      const text2 = document.getElementById('dramatic-text-2');
      
      if (text1) {
        text1.style.opacity = '1';
        text1.style.transform = 'translateY(0px)';
        text1.style.pointerEvents = 'none';
      }
      
      if (text2) {
        text2.style.opacity = '1';
        text2.style.transform = 'translateY(0px)';
        text2.style.pointerEvents = 'none';
      }
    }
  }, [case0AnimationCompleted]);

  return (
    <>
      <main>
        {/* 3D Heart Interactive Section - Using extracted component */}
        <Heart3DSection
          currentAnimationSegment={currentAnimationSegment}
          setCurrentAnimationSegment={setCurrentAnimationSegment}
          hasPlayedWelcome={hasPlayedWelcome}
          setHasPlayedWelcome={setHasPlayedWelcome}
          animationPaused={animationPaused}
          setAnimationPaused={setAnimationPaused}
          showInteractionPrompt={showInteractionPrompt}
          setShowInteractionPrompt={setShowInteractionPrompt}
          textAnimationsComplete={textAnimationsComplete}
          setTextAnimationsComplete={setTextAnimationsComplete}
          case0AnimationCompleted={case0AnimationCompleted}
          setCase0AnimationCompleted={setCase0AnimationCompleted}
        />

        {/* Hero/Intro Section - Main introduction with VisHeart branding and key features */}
        <HeroSection handleLearnMoreClick={handleLearnMoreClick} />

        {/* About/Key Benefits Section - Detailed information and benefits */}
        <AboutUsSection />

        {/* Services Section - Our medical services and offerings */}
        <ServicesSection />

        {/* FAQ Section - Frequently Asked Questions */}
        <FaqSection />
        
        {/* Gallery Section */}
        <GallerySection />
                  
        {/* Contact Section */}
        <ContactSection />

        {/* --- NEW 3D GALLERY SECTION --- */}
        <section className="bg-gradient-to-br from-background to-muted">
          {/* Section Header */}
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

          {/* 3D Gallery Canvas */}
          <div id="3d-gallery-section" ref={threeDGallerySectionRef} className="relative h-[150vh] w-full">
            <div className="sticky top-0 h-screen w-full">
              {/* The canvas for the 3D gallery */}
              <ThreeDGallery images={gallery3DImages} trigger={threeDGallerySectionRef.current} />
            </div>
          </div>
        </section>
      </main>

      {/* Floating Command Search Button */}
      <Commands />
    </>
  );
}