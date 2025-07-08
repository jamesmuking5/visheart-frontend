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

// --- UI Component Imports ---
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// --- Page Section Component Imports ---
import { HeroSection } from '@/components/hero-section';
import { AboutUsSection } from '@/components/about-us-section'; 
import { ServicesSection } from '@/components/services-section';
import { FaqSection } from "@/components/faq-section";
import { GallerySection } from "@/components/gallery-section";
import { ContactSection } from "@/components/contact-section"; 

// Register the GSAP ScrollTrigger plugin if in a browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger); // <-- Register the plugin
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
      <planeGeometry args={[3.8, 2.8]} /> {/* Aspect ratio similar to 380x280 */}
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
    // The effect will now run when cameraRef.current is populated
    if (cameraRef.current) {
      // Define spacing constants here to match the useMemo hook
      const spacingX = 1.5;
      const spacingY = 1.0;
      const totalDistanceX = (imagePlanes.length - 1) * spacingX;
      const totalDistanceY = (imagePlanes.length - 1) * spacingY;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger, // Use the new section as the trigger
          start: "top top",
          end: `+=${totalDistanceX * 100}`, // Make scroll length proportional to distance
          scrub: 1.5,
          pin: true, // Pin the section while scrolling through the gallery
        },
      });

      // Animate the camera's position along the line of images
      tl.to(cameraRef.current.position, {
        x: totalDistanceX,
        y: totalDistanceY,
        ease: "none",
      });

      // Cleanup function to kill the timeline when the component unmounts
      return () => {
        tl.kill();
      };
    }
  }, [imagePlanes.length, cameraRef.current, trigger]); // <-- ADD cameraRef.current to dependency array

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

  const threeDGallerySectionRef = useRef<HTMLDivElement>(null); // Ref for the 3D gallery section

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
    
    // Add visual feedback - brief scale effect
    const button = e.currentTarget;
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      button.style.transform = 'scale(1)';
      
      // Navigate to about section with smooth scroll
      const aboutSection = document.getElementById('info-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        
        // Add highlight effect to the about section
        setTimeout(() => {
          aboutSection.style.transition = 'all 0.8s ease';
          aboutSection.style.boxShadow = '0 0 30px rgba(88, 123, 154, 0.3)';
          aboutSection.style.transform = 'scale(1.01)';
          
          // Remove highlight after animation
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
  
    // In the advanceAnimation function, modify the completion logic
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
      // Don't immediately set hasPlayedWelcome to true
      // Let case 4 handle the transition
      setShowInteractionPrompt(false);
      
      // Set hasPlayedWelcome to true after a delay to keep ECG visible longer
      setTimeout(() => {
        setHasPlayedWelcome(true);
      }, 5000); // Keep ECG visible for 5 more seconds after VisHeart
    }
  };
  
  // Update the keyboard and click event listeners
  useEffect(() => {
    const handleInteraction = (e: KeyboardEvent | MouseEvent) => {
      // Only handle interactions if we haven't completed the welcome animation
      if (hasPlayedWelcome) return;
      
      // Block interaction if we're in segment 0 and text animations aren't complete
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
          console.log('Keyboard interaction detected:', keyEvent.code); // Debug log
          advanceAnimation();
        }
      } else if (e.type === 'click') {
        console.log('Click interaction detected'); // Debug log
        advanceAnimation();
      }
    };
  
    // Only add listeners if the welcome animation hasn't been completed
    if (!hasPlayedWelcome) {
      console.log('Adding event listeners, current segment:', currentAnimationSegment); // Debug log
      document.addEventListener('keydown', handleInteraction, { passive: false });
      document.addEventListener('click', handleInteraction, { passive: false });
    }
  
    return () => {
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, [currentAnimationSegment, hasPlayedWelcome, textAnimationsComplete]); // Added textAnimationsComplete dependency
    
  // Reset text animations state when component mounts
  useEffect(() => {
    // Reset text animation state when starting over
    if (currentAnimationSegment === 0) {
      setTextAnimationsComplete(false);
    }
  }, [currentAnimationSegment]);
  
        function GSAPAnimatedECG() {
          const ecgRef = useRef<HTMLDivElement>(null);
          const timelineRef = useRef<any>(null);
        
          useEffect(() => {
            if (!ecgRef.current) return;
        
            import('gsap').then((gsap) => {
              const { default: GSAP } = gsap;
        
              // Create the main timeline with MUCH shorter delay for faster cycling
              const tl = GSAP.timeline({ repeat: -1, repeatDelay: 0.3 });
              timelineRef.current = tl;
        
              // Animate multiple ECG lines with different speeds and delays
              [1, 2, 3].forEach((lineNum) => {
                const line = ecgRef.current?.querySelector(`#ecg-line-${lineNum}`) as SVGPathElement;
                const mask = ecgRef.current?.querySelector(`#ecg-mask-${lineNum}`) as SVGRectElement;
                
                if (line && mask) {
                  // Set initial path length for drawing animation
                  const pathLength = line.getTotalLength();
                  GSAP.set(line, {
                    strokeDasharray: pathLength,
                    strokeDashoffset: pathLength
                  });
        
                  // Set initial mask position
                  GSAP.set(mask, { x: -250 });
        
                  // Create individual timeline for this line with MUCH FASTER durations
                  const lineTl = GSAP.timeline({ 
                    repeat: -1, 
                    repeatDelay: 0.8 + lineNum * 0.3
                  });
                  
                  // Step 1: Draw the ECG line - MUCH FASTER DURATION
                  lineTl.to(line, {
                    strokeDashoffset: 0,
                    duration: 3,
                    ease: "none"
                  })
                  // Step 2: Move the mask to create trailing effect - FASTER
                  .to(mask, {
                    x: 800,
                    duration: 3,
                    ease: "none"
                  }, 0)
                  
                  // Step 3: Much shorter hold duration
                  .to({}, { duration: 0.3 })
                  
                  // Step 4: Reset for next cycle
                  .set([line, mask], {
                    strokeDashoffset: pathLength,
                    x: -250
                  });
        
                  // Add to main timeline with much shorter stagger
                  tl.add(lineTl, lineNum * 0.8);
                }
              });
        
              // Add faster grid line animation
              const gridLines = ecgRef.current?.querySelectorAll('.grid-line');
              if (gridLines) {
                GSAP.to(gridLines, {
                  duration: 2,
                  repeat: -1,
                  stagger: 0.1,
                  ease: "sine.inOut"
                });
              }
            });
        
            return () => {
              if (timelineRef.current) {
                timelineRef.current.kill();
              }
            };
          }, []);
        
          return (
            <div 
              ref={ecgRef}
              className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
              style={{ 
                background: 'transparent',
                filter: 'contrast(1.2) brightness(1.1)'
              }}
            >
              {/* ECG Grid Background */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 500 300"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Grid pattern */}
                  <pattern id="ecgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path 
                      d="M 20 0 L 0 0 0 20" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="0.4"
                      opacity="0.4"
                      className="grid-line"
                    />
                  </pattern>
                  
                  {/* Masks for trailing effect - WIDER MASKS for longer sweep */}
                  <mask id="ecgMask1">
                    <rect id="ecg-mask-1" x="-250" y="0" width="250" height="300" fill="white"/>
                  </mask>
                  <mask id="ecgMask2">
                    <rect id="ecg-mask-2" x="-250" y="0" width="250" height="300" fill="white"/>
                  </mask>
                  <mask id="ecgMask3">
                    <rect id="ecg-mask-3" x="-250" y="0" width="250" height="300" fill="white"/>
                  </mask>
                </defs>
        
                {/* Grid background */}
                <rect width="100%" height="100%" fill="url(#ecgGrid)" opacity="0.5"/>
        
                {/* ECG Line 1 - Top - MOVED HIGHER (from y=75 to y=30) */}
                <g transform="translate(0, 30)">
                  <path
                    id="ecg-line-1"
                    d="M0,50 L40,50 L45,25 L50,75 L55,50 L60,50 L65,45 L70,55 L75,50 L80,50 L120,50 L160,50 L165,20 L170,80 L175,50 L180,50 L220,50 L260,50 L265,30 L270,70 L275,50 L280,50 L320,50 L360,50 L365,25 L370,75 L375,50 L380,50 L420,50 L460,50 L465,30 L470,70 L475,50 L480,50 L520,50 L560,50 L565,20 L570,80 L575,50 L580,50 L620,50 L660,50 L665,25 L670,75 L675,50 L680,50 L720,50"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    mask="url(#ecgMask1)"
                    style={{
                      filter: 'drop-shadow(0 0 4px #ef4444)',
                    }}
                  />
                </g>
        
                {/* ECG Line 2 - Middle - MOVED HIGHER (from y=150 to y=80) */}
                <g transform="translate(0, 80)">
                  <path
                    id="ecg-line-2"
                    d="M0,50 L35,50 L38,30 L43,70 L48,50 L52,50 L57,40 L62,60 L67,50 L72,50 L110,50 L155,50 L160,15 L165,85 L170,50 L175,50 L215,50 L255,50 L260,35 L265,65 L270,50 L275,50 L315,50 L355,50 L360,20 L365,80 L370,50 L375,50 L415,50 L455,50 L460,35 L465,65 L470,50 L475,50 L515,50 L555,50 L560,15 L565,85 L570,50 L575,50 L615,50 L655,50 L660,30 L665,70 L670,50 L675,50 L715,50"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    mask="url(#ecgMask2)"
                    style={{
                      filter: 'drop-shadow(0 0 4px #ef4444)',
                    }}
                  />
                </g>
        
                {/* ECG Line 3 - Bottom - MOVED HIGHER (from y=225 to y=130) */}
                <g transform="translate(0, 130)">
                  <path
                    id="ecg-line-3"
                    d="M0,50 L45,50 L50,35 L55,65 L60,50 L65,50 L70,42 L75,58 L80,50 L85,50 L125,50 L170,50 L175,25 L180,75 L185,50 L190,50 L230,50 L270,50 L275,30 L280,70 L285,50 L290,50 L330,50 L370,50 L375,20 L380,80 L385,50 L390,50 L430,50 L470,50 L475,30 L480,70 L485,50 L490,50 L530,50 L570,50 L575,25 L580,75 L585,50 L590,50 L630,50 L670,50 L675,35 L680,65 L685,50 L690,50 L730,50"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    mask="url(#ecgMask3)"
                    style={{
                      filter: 'drop-shadow(0 0 4px #ef4444)',
                    }}
                  />
                </g>
              </svg>
        
              {/* Heart rate indicator with faster update - MOVED TO TOP LEFT */}
              <motion.div 
                className="absolute top-4 left-4 text-red-500 font-mono text-sm bg-black/20 backdrop-blur-sm px-2 py-1 rounded"
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
              </motion.div>
            </div>
          );
        }


  // Update the Three.js lighting to maintain consistency
    function DynamicLighting({ currentSegment }: { currentSegment: number }) {
      const ambientRef = useRef<any>(null);
      const keyLightRef = useRef<any>(null);
      const fillLightRef = useRef<any>(null);
      const accentLightRef = useRef<any>(null);
    
      useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        
        // Breathing effect on ambient light
        if (ambientRef.current) {
          ambientRef.current.intensity = 0.4 + Math.sin(time * 1.2) * 0.05; // Reduced variation
        }
        
        // Dynamic key light movement - more subtle
        if (keyLightRef.current) {
          keyLightRef.current.position.x = 10 + Math.sin(time * 0.3) * 1; // Slower, smaller movement
          keyLightRef.current.position.y = 10 + Math.cos(time * 0.2) * 0.5; // Slower, smaller movement
        }
        
        // Keep fill light consistent - NO segment-based changes
        if (fillLightRef.current) {
          fillLightRef.current.color.setHex(0x999999); // Consistent neutral gray
        }
      });
    
      return (
        <>
          {/* Consistent lighting throughout */}
          <ambientLight ref={ambientRef} intensity={0.4} />
          
          {/* Dynamic key light with subtle movement */}
          <pointLight 
            ref={keyLightRef}
            position={[10, 10, 10]} 
            intensity={1.5} 
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Consistent fill light */}
          <pointLight 
            ref={fillLightRef}
            position={[-8, -5, 8]} 
            intensity={0.8} 
            color="#999999" // Consistent neutral gray
          />
          
          {/* Consistent accent light */}
          <pointLight 
            ref={accentLightRef}
            position={[5, -10, -5]} 
            intensity={0.6} 
            color="#999999" // Consistent neutral gray
          />
          
          {/* Consistent rim light */}
          <spotLight
            position={[0, 15, -10]}
            angle={0.4}
            penumbra={1}
            intensity={1.0}
            color="#ffffff"
            castShadow
          />
          
          {/* Consistent depth light */}
          <spotLight
            position={[15, 5, 15]}
            angle={0.6}
            penumbra={0.8}
            intensity={0.8}
            color="#f5f5f5"
          />
        </>
      );
    }

  function DynamicBackground({ currentSegment, hasPlayedWelcome }: { 
    currentSegment: number; 
    hasPlayedWelcome: boolean; 
  }) {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
    
    // Generate particles
    useEffect(() => {
      const generateParticles = () => {
        const newParticles = [];
        for (let i = 0; i < 50; i++) {
          newParticles.push({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random() * 0.6 + 0.2
          });
        }
        setParticles(newParticles);
      };
      
      generateParticles();
    }, []);
  
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Light Grey Background */}
        <div className="absolute inset-0 bg-gray-300" />
        
        {/* Grid Overlay with White Square Outlines */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right,rgb(113, 117, 123) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(113, 117, 123) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
  
        {/* Floating Medical Particles */}
        {!hasPlayedWelcome && (
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-gray-900 rounded-full" // Darker particles for contrast
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  opacity: particle.opacity * 0.4, // Reduced opacity
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                }}
                animate={{
                  opacity: [particle.opacity * 0.4, particle.opacity * 0.1, particle.opacity * 0.4],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
  
        {/* Segment-specific Light Rays - More subtle */}
        {currentSegment >= 1 && (
          <>
            <motion.div
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 0.08, rotate: 45 }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
              className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-gray-500/40 to-transparent transform origin-top"
            />
            <motion.div
              initial={{ opacity: 0, rotate: 45 }}
              animate={{ opacity: 0.08, rotate: -45 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-gray-600/40 to-transparent transform origin-top"
            />
          </>
        )}
  
        {/* Atmospheric Depth Circles - More subtle */}
        {currentSegment >= 2 && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.06, 0.12, 0.06]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-gray-500/20 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1.5, 1, 1.5],
                opacity: [0.04, 0.08, 0.04]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 border border-gray-600/15 rounded-full"
            />
          </>
        )}
  
        {/* Final Segment Celebration Effect - More subtle */}
        {currentSegment === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            {/* Radial burst effect */}
            <motion.div
              animate={{
                scale: [0, 2],
                opacity: [0.3, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-600/60 rounded-full"
            />
            
            {/* Sparkle particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gray-600/80 rounded-full"
                style={{
                  left: `${50 + Math.cos(i * 18 * Math.PI / 180) * 20}%`,
                  top: `${50 + Math.sin(i * 18 * Math.PI / 180) * 20}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  repeatDelay: 2
                }}
              />
            ))}
          </motion.div>
        )}
  
        {/* Ambient Lighting Overlay - More subtle */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)'
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 pointer-events-none"
        />
      </div>
    );
  }


    // 3D Heart Component with Segmented Animation
  function Heart3D({ hasPlayedWelcome, setHasPlayedWelcome }: { 
    hasPlayedWelcome: boolean; 
    setHasPlayedWelcome: (value: boolean) => void; 
  }) {
    const meshRef = useRef<any>(null);
    const { scene } = useGLTF('/3dheart.glb'); // Fixed file path
    const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
    const [currentTimeline, setCurrentTimeline] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    
    // Single unified animation effect - REMOVE THE DUPLICATE useEffect
    useEffect(() => {
      if (meshRef.current && !hasPlayedWelcome) {
        import('gsap').then((gsap) => {
          const { default: GSAP } = gsap;
          
          // Set initial state ONLY ONCE at the very beginning
          if (currentAnimationSegment === 0 && !isInitialized) {
            console.log('Setting initial state - heart fills screen');
            meshRef.current.scale.set(15, 15, 15); // Start large but not overwhelming
            meshRef.current.rotation.set(0.1, 0, 0.05); // Slight initial tilt for drama
            meshRef.current.position.set(0, 0, 0); // Center stage
            setIsInitialized(true);
          }
  
          const runSegment = (segment: number) => {
            console.log('Executing GSAP animation for segment:', segment); // Debug log
            console.log('Current heart state before segment:', {
              scale: meshRef.current.scale.toArray(),
              rotation: meshRef.current.rotation.toArray(),
              position: meshRef.current.position.toArray()
            });
            
            // Kill any existing timeline to prevent conflicts
            if (currentTimeline) {
              currentTimeline.kill();
            }
            
            const tl = GSAP.timeline({
              onComplete: () => {
                console.log('Segment', segment, 'animation complete'); // Debug log
                console.log('Heart state after segment:', {
                  scale: meshRef.current.scale.toArray(),
                  rotation: meshRef.current.rotation.toArray(),
                  position: meshRef.current.position.toArray()
                });
                
                if (segment < 4) {
                  setAnimationPaused(true);
                  console.log('Animation paused, waiting for user interaction'); // Debug log
                } else {
                  console.log('All segments complete'); // Debug log
                  setInitialAnimationComplete(true);
                  setHasPlayedWelcome(true);
                  setShowInteractionPrompt(false);
                }
              }
            });
            
            // Store the timeline reference
            setCurrentTimeline(tl);
  
            switch (segment) {      
              case 0: 
                // Skip animation if already completed
                if (case0AnimationCompleted) {
                  console.log('Case 0 already animated - skipping');
                  setTextAnimationsComplete(true);
                  return;
                }
                
                // Set initial states for text elements to prevent re-animation
                tl.set("#dramatic-text-1", { opacity: 0, y: 30, scale: 1, display: "block" })
                .set("#dramatic-text-2", { opacity: 0, y: 30, scale: 1, display: "block" })
                .set("#dramatic-text-1 h1", { scale: 0.8, rotationY: -15 })
                .set("#dramatic-text-2 h1", { scale: 0.8, rotationY: 15 })
                
                // Both texts animate in simultaneously
                .to("#dramatic-text-1", {
                  opacity: 1,
                  y: 0,
                  duration: 1.2,
                  ease: "power2.out",
                  delay: 0.5
                })
                .to("#dramatic-text-1 h1", {
                  scale: 1,
                  rotationY: 0,
                  duration: 1,
                  ease: "back.out(1.4)",
                }, "-=1.2")
                
                .to("#dramatic-text-2", {
                  opacity: 1,
                  y: 0,
                  duration: 1.2,
                  ease: "power2.out",
                }, "-=1.7")
                .to("#dramatic-text-2 h1", {
                  scale: 1,
                  rotationY: 0,
                  duration: 1,
                  ease: "back.out(1.4)",
                }, "-=1.2")
                
                // Mark BOTH text animations as complete AND set flag
                .call(() => {
                  console.log('Both text animations completed - marking as permanently done');
                  setTextAnimationsComplete(true);
                  setCase0AnimationCompleted(true); // Prevent future re-animations
                  if (meshRef.current) {
                    meshRef.current.userData.textAnimationsComplete = true;
                  }
                });
                break;
                            
              case 1:
                // Remove both corner texts from case 0
                tl.to("#dramatic-text-1", {
                  opacity: 0,
                  y: -20,
                  scale: 1.1,
                  duration: 0.8,
                  ease: "power2.in",
                })
                .to("#dramatic-text-2", {
                  opacity: 0,
                  y: -20,
                  scale: 1.1,
                  duration: 0.8,
                  ease: "power2.in",
                }, "-=0.8") // Start at same time as first text removal
                .set("#dramatic-text-1", { display: "none" }) // Completely hide first text
                .set("#dramatic-text-2", { display: "none" }) // Completely hide second text
                
                // Now animate in the new case 1 text at center
                .to("#case1-text", {
                  opacity: 1,
                  y: 0,
                  duration: 1.2,
                  ease: "power2.out",
                  delay: 0.3 // Brief pause after corner texts disappear
                })
                .to("#case1-text h1", {
                  scale: 1,
                  rotationY: 0,
                  duration: 1,
                  ease: "back.out(1.4)",
                }, "-=1.2")
                
                // Heart scaling animation - ZOOMED OUT MORE
                .to(meshRef.current.scale, {
                  x: 2.8, // Reduced from 4.0 to 2.8 (30% smaller)
                  y: 2.8, // Reduced from 4.0 to 2.8 (30% smaller)
                  z: 2.8, // Reduced from 4.0 to 2.8 (30% smaller)
                  duration: 1.5,
                  ease: "power2.out",
                }, "-=1.5"); // Start heart animation with text
                break;
                              
              case 2: 
                // Remove case 1 text
                tl.to("#case1-text", {
                  opacity: 0,
                  y: -20,
                  scale: 1.1,
                  duration: 0.8,
                  ease: "power2.in",
                })
                .set("#case1-text", { display: "none" }) // Completely hide case 1 text
                
                // Animate in case 2 text
                .to("#case2-text", {
                  opacity: 1,
                  y: 0,
                  duration: 1.2,
                  ease: "power2.out",
                  delay: 0.3
                })
                .to("#case2-text h1", {
                  scale: 1,
                  rotationY: 0,
                  duration: 1,
                  ease: "back.out(1.4)",
                }, "-=1.2")
                
                // Heart animations start with text - ZOOMED OUT MORE
                .to(meshRef.current.scale, {
                  x: 3.2, // Reduced from 4.5 to 3.2 (29% smaller)
                  y: 3.2, // Reduced from 4.5 to 3.2 (29% smaller)
                  z: 3.2, // Reduced from 4.5 to 3.2 (29% smaller)
                  duration: 1.5,
                  ease: "power2.out",
                }, "-=1.5") // Start heart animation with text
                .to(meshRef.current.rotation, {
                  y: "+=3.14159", // Add π to current rotation (RELATIVE)
                  duration: 1.5,
                  ease: "power2.inOut",
                }, "-=1.5"); // Start at same time as scale
                break;
                
              case 3: // Segment 4: Final scale from (4.5) to (2.0) with more rotation
                console.log('Segment 3: Final scale from 4.5 to 2.0 with more rotation'); // Debug log
                
                // Remove case 2 text
                tl.to("#case2-text", {
                  opacity: 0,
                  y: -20,
                  scale: 1.1,
                  duration: 0.8,
                  ease: "power2.in",
                })
                .set("#case2-text", { display: "none" }) // Completely hide case 2 text
                
                // Animate in case 3 text
                .to("#case3-text", {
                  opacity: 1,
                  y: 0,
                  duration: 1.2,
                  ease: "power2.out",
                  delay: 0.3
                })
                .to("#case3-text h1", {
                  scale: 1,
                  rotationY: 0,
                  duration: 1,
                  ease: "back.out(1.4)",
                }, "-=1.2")
                
                // Heart animations start with text
                .to(meshRef.current.scale, {
                  x: 2.0, // Reduced from 2.5 to 2.0
                  y: 2.0,
                  z: 2.0,
                  duration: 1.5,
                  ease: "back.out(1.7)",
                }, "-=1.5") // Start heart animation with text
                .to(meshRef.current.rotation, {
                  y: "+=3.14159", // Add another π to current rotation (RELATIVE)
                  duration: 1.5,
                  ease: "power2.inOut",
                }, "-=1.5")
                .to(meshRef.current.position, {
                  y: "+=0.5", // Add to current Y position (RELATIVE)
                  duration: 0.8,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: 1,
                }, "-=0.8")
                
                // === CINEMATIC TRANSITION SEQUENCE ===
                // Stage 1: Build tension (2 seconds after text appears)
                .to("#case3-text", {
                  textShadow: "0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.4)",
                  duration: 0.8,
                  ease: "power2.out",
                  delay: 2
                })
                
                // Stage 2: Dramatic pause with pulsing intensity
                .to("#case3-text", {
                  duration: 1.5,
                  ease: "power2.inOut",
                })
                
                // Stage 3: Heart dramatic focus with slow zoom
                .to(meshRef.current.scale, {
                  x: 1.8,
                  y: 1.8, 
                  z: 1.8,
                  duration: 1.2,
                  ease: "power2.inOut",
                }, "-=0.8")
                .to(meshRef.current.rotation, {
                  y: "+=1.57", // Add π/2 for cinematic slow rotation
                  duration: 1.2,
                  ease: "power1.inOut",
                }, "-=1.2")
                
                // Stage 4: Environmental cinematic effects
                .call(() => {
                  // Add cinematic particle burst effect
                  const cinematicParticles = [];
                  for (let i = 0; i < 15; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'cinematic-particle';
                    particle.style.cssText = `
                      position: fixed;
                      width: 3px;
                      height: 3px;
                      background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
                      border-radius: 50%;
                      pointer-events: none;
                      z-index: 35;
                      left: ${50 + (Math.random() - 0.5) * 60}%;
                      top: ${50 + (Math.random() - 0.5) * 60}%;
                      opacity: 0;
                    `;
                    document.body.appendChild(particle);
                    
                    // Animate particle
                    GSAP.to(particle, {
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                      duration: 2,
                      ease: "power2.out",
                      onComplete: () => particle.remove()
                    });
                  }
                })
                
                // Stage 5: Dramatic text exit with cinematic flair
                .to("#case3-text", {
                  opacity: 0,
                  scale: 0.8,
                  y: -30,
                  textShadow: "0 0 50px rgba(255,255,255,1), 0 0 100px rgba(255,255,255,0.8)",
                  duration: 1.2,
                  ease: "power3.in",
                  delay: 0.8
                })
                
                // Stage 6: Environmental blackout effect
                .call(() => {
                  // Create dramatic overlay
                  const overlay = document.createElement('div');
                  overlay.id = 'cinematic-overlay';
                  overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.7) 100%);
                    pointer-events: none;
                    z-index: 25;
                    opacity: 0;
                  `;
                  document.body.appendChild(overlay);
                  
                  GSAP.to(overlay, {
                    opacity: 1,
                    duration: 1,
                    ease: "power2.out"
                  });
                  
                  // Remove after VisHeart appears
                  setTimeout(() => {
                    GSAP.to(overlay, {
                      opacity: 0,
                      duration: 1.5,
                      ease: "power2.out",
                      onComplete: () => overlay.remove()
                    });
                  }, 3000);
                })
                
                .set("#case3-text", { display: "none" }) // Completely hide case 3 text
                
                // Stage 8: Heart repositioning for final reveal
                .to(meshRef.current.position, {
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out",
                })
                .to(meshRef.current.scale, {
                  x: 2.2,
                  y: 2.2,
                  z: 2.2,
                  duration: 0.8,
                  ease: "back.out(1.2)",
                }, "-=0.4")
                
                // Stage 9: VisHeart dramatic entrance with NO blurring effects
                  .set("#welcome-text", { 
                    scale: 0.3, 
                    opacity: 0,
                    rotationY: 0,
                    textShadow: "none", // Remove all text shadow
                    filter: "none !important", // Force remove blur
                    backdropFilter: "none !important" // Remove backdrop blur
                  })
                  .to("#welcome-text", {
                    opacity: 1,
                    scale: 0.7,
                    duration: 0.8,
                    ease: "power2.out",
                    delay: 0.3,
                    filter: "none !important", // Ensure no blur during animation
                    backdropFilter: "none !important",
                    textShadow: "none" // Keep text shadow off
                  })
                  .to("#welcome-text", {
                    scale: 1,
                    textShadow: "none", // NO glow/shine effects at all
                    duration: 1,
                    ease: "elastic.out(1, 0.6)",
                    filter: "none !important", // Keep filter clear
                    backdropFilter: "none !important"
                  })
                
                // Stage 10: Final environmental cleanup
                .call(() => {
                  // Add final sparkle effects around VisHeart
                  for (let i = 0; i < 8; i++) {
                    const sparkle = document.createElement('div');
                    sparkle.style.cssText = `
                      position: fixed;
                      width: 2px;
                      height: 2px;
                      background: white;
                      border-radius: 50%;
                      pointer-events: none;
                      z-index: 35;
                      left: ${45 + Math.random() * 10}%;
                      top: ${45 + Math.random() * 10}%;
                      opacity: 0;
                      box-shadow: 0 0 6px rgba(255,255,255,0.8);
                    `;
                    document.body.appendChild(sparkle);
                    
                    GSAP.to(sparkle, {
                      duration: 1.5,
                      delay: i * 0.2,
                      ease: "power2.out",
                      onComplete: () => sparkle.remove()
                    });
                  }
                });
                break;
                
                            case 4:
                // Ensure ECG lines stay visible during VisHeart display
                tl.call(() => {
                  // Force ECG visibility if it was hidden
                  const ecgContainer = document.querySelector('.absolute.inset-0.z-10.pointer-events-none.overflow-hidden');
                  if (ecgContainer) {
                    (ecgContainer as HTMLElement).style.display = 'block';
                    (ecgContainer as HTMLElement).style.opacity = '1';
                  }
                })
                
                // Just fade out VisHeart after 2 seconds
                .to("#welcome-text", {
                  opacity: 0,
                  y: -30,
                  duration: 0.6,
                  ease: "power2.in",
                  delay: 2, // Show VisHeart for 2 seconds
                })
                
                // Keep ECG lines active during and after VisHeart
                .call(() => {
                  // Ensure ECG continues running
                  const ecgContainer = document.querySelector('.absolute.inset-0.z-10.pointer-events-none.overflow-hidden');
                  if (ecgContainer) {
                    (ecgContainer as HTMLElement).style.display = 'block';
                    (ecgContainer as HTMLElement).style.opacity = '1';
                  }
                })
                
                // Wait without moving anything else, keeping ECG active
                .to({}, { duration: 2 }); 
                break;
            }
          };
  
          // Only run if not paused or if this is the first segment
          if (!animationPaused || currentAnimationSegment === 0) {
            runSegment(currentAnimationSegment);
          }
        });
      }
  
      // Cleanup function to kill timeline when component unmounts
      return () => {
        if (currentTimeline) {
          currentTimeline.kill();
        }
      };
    }, [currentAnimationSegment, hasPlayedWelcome, animationPaused, isInitialized]);
    
    // Simple idle animation after initial animation completes
    useFrame(({ clock }) => {
      if (meshRef.current && initialAnimationComplete) {
        // Keep heart at final scale and add subtle breathing/floating
        const time = clock.getElapsedTime();
        const breathingEffect = Math.sin(time * 1.2) * 0.02; // Gentle breathing
        const floatingEffect = Math.sin(time * 0.8) * 0.1; // Subtle floating
        
        // Apply subtle idle animations with smaller final scale
        meshRef.current.scale.set(2.5 + breathingEffect, 2.5 + breathingEffect, 2.5 + breathingEffect); // Changed from 4 to 2.5
        meshRef.current.position.y = floatingEffect;
    
        // Slow, consistent rotation in one direction
        meshRef.current.rotation.y += 0.005; // Slower, steady clockwise rotation
      }
    });
  
    return (
      <primitive 
        ref={meshRef}
        object={scene} 
        // Remove initial scale/position props to prevent conflicts
      />
    );
  }
  
// Add this state at the top of your component
const [case0AnimationCompleted, setCase0AnimationCompleted] = useState(false);
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
        {/* 3D Heart Interactive Section - Initial welcome animation */}
         <section 
          id="heart-3d-section" 
          aria-label="Interactive 3D Heart Animation" 
          className="relative w-full h-screen"
        >
          <div className="relative w-full h-screen overflow-hidden">
            {/* Dynamic Background Effects */}
            <DynamicBackground 
              currentSegment={currentAnimationSegment} 
              hasPlayedWelcome={hasPlayedWelcome}
            />

            {/* Animated ECG Lines - Show during welcome animation OR case 4 */}
            {(!hasPlayedWelcome || currentAnimationSegment === 4) && <GSAPAnimatedECG />}
            
            {/* Enhanced 3D Heart Canvas */}
            <div className="absolute inset-0 z-20">
              <Canvas
                camera={{ 
                  position: [0, 0, 3], 
                  fov: 45,
                  near: 0.1,
                  far: 1000
                }}
                style={{ background: 'transparent' }}
              >
                <Suspense fallback={null}>
                  {/* Dynamic Lighting that changes with segments */}
                  <DynamicLighting currentSegment={currentAnimationSegment} />
                  
                  <Heart3D 
                    hasPlayedWelcome={hasPlayedWelcome}
                    setHasPlayedWelcome={setHasPlayedWelcome}
                  />
                  <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={2.0}
                    enableDamping
                    dampingFactor={0.05}
                  />
                </Suspense>
              </Canvas>
            </div>
        
            {/* Rest of the overlay content remains the same */}
            <div className="absolute inset-0 z-30 pointer-events-none">
              {/* Top left corner text - Case 0 */}              {/* Dramatic Text 1 - Case 0 - TOP LEFT CORNER - BIGGER */}
              <div 
                id="dramatic-text-1"
                className="absolute top-8 left-8 text-white opacity-0"
                style={{ transform: 'translateY(30px)' }}
              >
                <h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider drop-shadow-2xl leading-tight"
                  style={{ 
                    fontFamily: 'RetroFloral, serif',
                    color: '#000000' // Full black color
                  }}
                >
                  Inside the Beating Core<br />
                  <span 
                    style={{ 
                      fontFamily: 'RetroFloral, serif',
                      color: '#000000' // Full black color
                    }}
                  >
                    of Innovation..
                  </span>
                </h1>
              </div>
              
              {/* Dramatic Text 2 - Case 0 - BOTTOM RIGHT CORNER - BIGGER */}
              <div 
                id="dramatic-text-2"
                className="absolute bottom-22 right-8 text-white opacity-0 text-right"
                style={{ transform: 'translateY(30px)' }}
              >
                <h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider drop-shadow-2xl leading-tight"
                  style={{ 
                    fontFamily: 'RetroFloral, serif',
                    color: '#000000' // Full black color
                  }}
                >
                  Where AI Meets<br />
                  <span 
                    style={{ 
                      fontFamily: 'RetroFloral, serif',
                      color: '#000000' // Full black color
                    }}
                  >
                    the Human Heart.
                  </span>
                </h1>
              </div>           
                        
              {/* Center container for other texts - Case 1, 2, 3, 4 */}
              <div className="absolute inset-0 flex items-center justify-center">
                                {/* Case 1 Text */}
                <div 
                  id="case1-text"
                  className="text-center text-black opacity-0 absolute"
                  style={{ transform: 'translateY(30px)' }}
                >
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider drop-shadow-2xl leading-tight"
                    style={{ fontFamily: 'RetroFloral, serif' }}
                  >
                    Your MRI<br />
                    <span style={{ fontFamily: 'RetroFloral, serif' }}>
                      Now Intelligent
                    </span>
                  </h1>
                </div>

              
              {/* Case 2 Text */}
                <div 
                  id="case2-text"
                  className="text-center text-white opacity-0 absolute"
                  style={{ transform: 'translateY(30px)' }}
                >
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider drop-shadow-2xl leading-tight"
                    style={{ 
                      fontFamily: 'RetroFloral, serif',
                      color: '#000000' // Changed to solid black
                    }}
                  >
                    The Future of Cardiac<br />
                    <span 
                      style={{ 
                        fontFamily: 'RetroFloral, serif',
                        color: '#000000' // Changed to solid black
                      }}
                    >
                      Imaging In Your Browser
                    </span>
                  </h1>
                </div>
              
                {/* Case 3 Text */}
                <div 
                  id="case3-text"
                  className="text-center text-white opacity-0 absolute"
                  style={{ transform: 'translateY(30px)' }}
                >
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider drop-shadow-2xl leading-tight"
                    style={{ 
                      fontFamily: 'RetroFloral, serif',
                      background: 'linear-gradient(to bottom, #d1d5db, #000000)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Clarity That Could<br />
                    <span 
                      style={{ 
                        fontFamily: 'RetroFloral, serif',
                        background: 'linear-gradient(to bottom, #d1d5db, #000000)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Save Lives.
                    </span>
                  </h1>
                </div>
              
                {/* VisHeart Welcome Text */}
                <div 
                  id="welcome-text"
                  className="text-center text-white opacity-0 absolute"
                  style={{ transform: 'translateY(30px)' }}
                >
                  <h1 
                    className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider drop-shadow-2xl"
                    style={{ 
                      fontFamily: 'RetroFloral, serif',
                      background: 'linear-gradient(to bottom, #d1d5db, #000000)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    VisHeart
                  </h1>
                </div>
              </div>
            </div>
            
            {!hasPlayedWelcome && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                <div className="flex space-x-3 bg-black/30 backdrop-blur-md rounded-full px-6 py-3">
                  {[0, 1, 2, 3, 4].map((segment) => (
                    <motion.div
                      key={segment}
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        segment <= currentAnimationSegment 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/30'
                      }`}
                      animate={{
                        scale: segment === currentAnimationSegment ? [1, 1.3, 1] : 1,
                        opacity: segment <= currentAnimationSegment ? 1 : 0.3
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: segment === currentAnimationSegment ? Infinity : 0,
                        repeatDelay: 1
                      }}
                    />
                  ))}
                </div>
                
                {/* Interaction Status Indicator */}
                {currentAnimationSegment === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-4"
                  >
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </section>

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