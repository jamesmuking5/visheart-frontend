"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// --- 3D Imports ---
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, PerspectiveCamera } from '@react-three/drei';

// --- Component Imports ---
import HeroSection from '@/components/hero-section';
import AboutUsSection from '@/components/about-us-section';

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
  // State for command dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCommandDropdown, setShowCommandDropdown] = useState(false);
  
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

  // Navigation function
  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setShowCommandDropdown(false);
    }
  };

  // Function to navigate to contact form
  const navigateToContactForm = () => {
    // First scroll to contact section
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      
      // Wait for scroll to complete, then switch to form tab
      setTimeout(() => {
        const formTab = document.querySelector('[value="form"]') as HTMLElement;
        if (formTab) {
          formTab.click();
        }
      }, 1000);
    }
  };

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

  // Keyboard shortcut to open command
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setDropdownOpen(!dropdownOpen);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

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
        <section id="services-section" aria-label="VisHeart Services" className="services-section">
          <div className="py-24 bg-gradient-to-br from-background to-muted">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-light mb-6 text-foreground">
                  Services
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Comprehensive cardiac imaging solutions powered by cutting-edge AI technology to support healthcare professionals in delivering precision care.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Service 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/40 transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">AI Cardiac Segmentation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Advanced machine learning algorithms automatically identify and segment cardiac structures from medical imaging data with unprecedented accuracy.
                  </p>
                </motion.div>

                {/* Service 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/40 transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 8a1 1 0 01-1-1V8a1 1 0 00-1-1H8a1 1 0 00-1 1v4a1 1 0 01-1 1h6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Real-time Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Instant processing and analysis of cardiac imaging data, providing immediate insights to support clinical decision-making in critical situations.
                  </p>
                </motion.div>

                {/* Service 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/40 transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Cloud Integration</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Seamless cloud-based platform enabling secure collaboration between specialists worldwide with enterprise-grade data protection.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Frequently Asked Questions */}
        <section id="faq-section" aria-label="Frequently Asked Questions" className="faq-section">
          <div className="py-24 bg-gradient-to-br from-background to-muted">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-light mb-6 text-foreground">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Find answers to common questions about VisHeart's AI-powered cardiac segmentation technology and implementation.
                </p>
              </motion.div>

              <div className="space-y-6">
                {/* FAQ 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    How accurate is VisHeart's AI segmentation technology?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    VisHeart achieves over 95% accuracy in cardiac structure identification, validated through extensive clinical trials and peer-reviewed studies. Our AI models are trained on diverse datasets from leading medical institutions worldwide.
                  </p>
                </motion.div>

                {/* FAQ 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    What imaging modalities does VisHeart support?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    VisHeart is compatible with multiple imaging modalities including MRI, CT, echocardiography, and nuclear imaging. Our platform automatically adapts to different image formats and resolutions for seamless integration.
                  </p>
                </motion.div>

                {/* FAQ 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    How long does the implementation process take?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Implementation typically takes 2-4 weeks depending on your existing infrastructure. This includes system integration, staff training, and workflow optimization. Our dedicated support team ensures a smooth transition with minimal disruption.
                  </p>
                </motion.div>

                {/* FAQ 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Is patient data secure in the cloud platform?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Absolutely. VisHeart employs enterprise-grade encryption, HIPAA compliance, and advanced security protocols. All data is encrypted both in transit and at rest, with strict access controls and audit trails for complete transparency.
                  </p>
                </motion.div>

                {/* FAQ 5 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    What kind of training and support do you provide?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We offer comprehensive training programs including hands-on workshops, online tutorials, and personalized sessions. Our 24/7 technical support team provides ongoing assistance, regular software updates, and continuous optimization recommendations.
                  </p>
                </motion.div>

                {/* FAQ 6 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Can VisHeart integrate with existing hospital systems?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Yes, VisHeart seamlessly integrates with most PACS, EMR, and hospital information systems through standard DICOM protocols and HL7 interfaces. Our technical team works closely with your IT department to ensure smooth integration.
                  </p>
                </motion.div>
              </div>

              {/* Contact CTA - Updated for theme adaptation */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Still have questions?
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Our team of experts is ready to help you understand how VisHeart can transform your cardiac imaging workflow.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center group"
                  >
                    Contact Our Team
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery-section" aria-label="VisHeart Gallery" className="gallery-section">
        <div className="py-24 px-8 bg-gradient-to-br from-background to-muted">
          <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-light mb-6 text-foreground">
                  Gallery
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Explore our advanced cardiac imaging capabilities and see how VisHeart transforms medical visualization for better patient outcomes.
                </p>
              </motion.div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Gallery Item 1 - Cardiac MRI Segmentation */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src="/image-1.png"
                          alt="Cardiac MRI Segmentation"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-primary/20 backdrop-blur-sm p-2 rounded-full border border-primary/30 hover:bg-primary/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        Cardiac MRI Segmentation
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Advanced AI-powered segmentation of cardiac structures from MRI imaging with unprecedented precision and accuracy.
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all duration-300"
                      >
                        View Details
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 2 - High-Resolution Imaging */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src="/image-2.png"
                          alt="High-Resolution Cardiac Imaging"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-secondary/20 backdrop-blur-sm p-2 rounded-full border border-secondary/30 hover:bg-secondary/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        High-Resolution Imaging
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Crystal-clear cardiac visualization with enhanced detail and precision for superior diagnostic capabilities.
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all duration-300"
                      >
                        View Details
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 3 - Specialist Interface */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src="/image-3.png"
                          alt="Doctor Interface"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-accent/20 backdrop-blur-sm p-2 rounded-full border border-accent/30 hover:bg-accent/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        Specialist Interface
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Intuitive user interface designed specifically for medical professionals with streamlined workflows.
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all duration-300"
                      >
                        View Details
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 4 - AI-Powered Analytics (Large Card) */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-primary/20 backdrop-blur-sm p-2 rounded-full border border-primary/30 hover:bg-primary/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 min-h-[300px]">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <CardTitle className="text-2xl font-semibold text-foreground mb-4">
                          AI-Powered Analytics
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                          Advanced machine learning algorithms provide real-time cardiac analysis and diagnostic support for enhanced clinical decision-making.
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium"
                      >
                        Explore AI Features
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 5 - Cloud Integration */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-secondary/20 backdrop-blur-sm p-2 rounded-full border border-secondary/30 hover:bg-secondary/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-secondary/30 to-primary/30 min-h-[200px]">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          Cloud Integration
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                          Seamless cloud-based collaboration platform
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all duration-300"
                      >
                        Learn More
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 6 - Real-time Processing */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-accent/20 backdrop-blur-sm p-2 rounded-full border border-accent/30 hover:bg-accent/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-accent/30 to-secondary/30 min-h-[200px]">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          Real-time Processing
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                          Instant analysis and diagnostic insights
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all duration-300"
                      >
                        Learn More
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 7 - Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 lg:col-span-1 group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-destructive/20 backdrop-blur-sm p-2 rounded-full border border-destructive/30 hover:bg-destructive/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-destructive/20 to-primary/20 min-h-[250px]">
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.8, delay: 0.8 }}
                          viewport={{ once: true }}
                          className="text-4xl font-bold text-foreground mb-2"
                        >
                          95%+
                        </motion.div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          Accuracy Rate
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                          Clinically validated precision in cardiac segmentation
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all duration-300"
                      >
                        View Statistics
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>

              {/* Gallery CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <Card className="p-8">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold text-foreground mb-4">
                      See VisHeart in Action
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                      Experience the future of cardiac imaging with our interactive demo. Discover how VisHeart can transform your medical practice.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 inline-flex items-center justify-center group"
                    >
                      Schedule Demo
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 inline-flex items-center justify-center group"
                    >
                      View Documentation
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </motion.button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact-section" aria-label="Contact VisHeart" className="contact-section">
        <div className="py-24 px-8 bg-gradient-to-br from-background to-muted">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-light text-foreground mb-4">Contact</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ready to revolutionize your cardiac imaging workflow? Contact our team of specialists.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information with Tabs */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <Tabs defaultValue="contact" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="contact">Contact Info</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="form">Quick Form</TabsTrigger>
                  </TabsList>

                  {/* Contact Info Tab */}
                  <TabsContent value="contact" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Call Us */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
                      >
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground ml-4">Call Us</h3>
                        </div>
                        <p className="text-muted-foreground mb-2">+60 12-345 6789</p>
                        <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM</p>
                      </motion.div>

                      {/* Email Us */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
                      >
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground ml-4">Email Us</h3>
                        </div>
                        <p className="text-muted-foreground mb-2">support@visheart.com</p>
                        <p className="text-sm text-muted-foreground">24/7 Support</p>
                      </motion.div>
                    </div>
                  </TabsContent>

                  {/* Location Tab */}
                  <TabsContent value="location" className="mt-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground ml-4">Our Location</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-foreground font-medium">VisHeart Medical Technologies</p>
                        <p className="text-muted-foreground">Swinburne University of Technology</p>
                        <p className="text-muted-foreground">Jalan Simpang Tiga, 93350</p>
                        <p className="text-muted-foreground">Kuching, Sarawak, Malaysia</p>
                      </div>
                      
                      {/* Office Hours */}
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="text-lg font-semibold text-foreground mb-3">Office Hours</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                          <div>Saturday: 9:00 AM - 2:00 PM</div>
                          <div>Sunday: Closed</div>
                          <div className="text-primary">Emergency Support: 24/7</div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Quick Form Tab */}
                  <TabsContent value="form" className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="bg-card p-8 rounded-xl shadow-lg border border-border"
                    >
                      <h3 className="text-xl font-semibold text-foreground mb-6">Quick Contact</h3>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Your Name"
                            className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                          />
                          <input
                            type="email"
                            placeholder="Your Email"
                            className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <textarea
                          placeholder="Your Message"
                          rows={4}
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all resize-none bg-background text-foreground placeholder:text-muted-foreground"
                        ></textarea>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium"
                        >
                          Send Message
                        </motion.button>
                      </form>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </motion.div>

              {/* Map Section */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-card p-4 rounded-xl shadow-lg h-full min-h-[600px] border border-border">
                  <div className="w-full h-full rounded-lg overflow-hidden relative">
                    {/* Google Maps Embed with proper center and zoom */}
                    <iframe
                      id="swinburne-map"
                      src="https://maps.google.com/maps?q=Swinburne%20University%20of%20Technology%20Sarawak%20Campus,%20Jalan%20Simpang%20Tiga,%2093350%20Kuching,%20Sarawak,%20Malaysia&t=&z=17&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: '500px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    ></iframe>
                    
                    {/* Recenter Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        // Reload the iframe to recenter
                        const iframe = document.getElementById('swinburne-map') as HTMLIFrameElement;
                        if (iframe) {
                          iframe.src = iframe.src;
                        }
                      }}
                      className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-10"
                      title="Recenter Map"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Floating Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="absolute top-8 right-8 bg-card p-3 rounded-lg shadow-xl max-w-[200px] border border-border"
                >
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs font-semibold text-foreground">VisHeart HQ</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Cardiac imaging innovation center
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>📍 Swinburne University</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

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
      <div className="fixed top-20 right-15 z-50">
        <div className="relative">
          <button
            onMouseEnter={() => setShowCommandDropdown(true)}
            onMouseLeave={() => setShowCommandDropdown(false)}
            className="bg-black dark:bg-white text-white dark:text-black border border-border hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 rounded-full p-4 shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Command Dropdown */}
          <AnimatePresence>
            {showCommandDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
                onMouseEnter={() => setShowCommandDropdown(true)}
                onMouseLeave={() => setShowCommandDropdown(false)}
              >
                <Command className="w-full">
                  <CommandInput placeholder="Search sections..." className="border-0" />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem onSelect={() => navigateToSection('hero-intro-section')}>
                        <span>Home</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('info-section')}>
                        <span>About Us</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('services-section')}>
                        <span>Services</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('faq-section')}>
                        <span>FAQ</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('gallery-section')}>
                        <span>Gallery</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('contact-section')}>
                        <span>Contact</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}