"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

interface Heart3DSectionProps {
  currentAnimationSegment: number;
  setCurrentAnimationSegment: (value: number) => void;
  hasPlayedWelcome: boolean;
  setHasPlayedWelcome: (value: boolean) => void;
  animationPaused: boolean;
  setAnimationPaused: (value: boolean) => void;
  showInteractionPrompt: boolean;
  setShowInteractionPrompt: (value: boolean) => void;
  textAnimationsComplete: boolean;
  setTextAnimationsComplete: (value: boolean) => void;
  case0AnimationCompleted: boolean;
  setCase0AnimationCompleted: (value: boolean) => void;
}

  // Update the GSAPAnimatedECG component with increased vertical spacing:
  function GSAPAnimatedECG() {
    const ecgRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<any>(null);
    const { theme } = useTheme();

    useEffect(() => {
      if (!ecgRef.current) return;

      import('gsap').then((gsap) => {
        const { default: GSAP } = gsap;

        // Create a completely independent timeline that never gets killed
        const createECGAnimation = () => {
          // Kill any existing timeline first
          if (timelineRef.current) {
            timelineRef.current.kill();
          }

          const masterTimeline = GSAP.timeline({ repeat: -1 });
          timelineRef.current = masterTimeline;

          // Animate multiple ECG lines with continuous flow
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
              GSAP.set(mask, { x: -600 });

              // Create individual timeline for continuous flow
              const lineTl = GSAP.timeline({ 
                repeat: -1, 
                repeatDelay: 0 // No delay for seamless looping
              });
              
              // Continuous animation cycle
              lineTl.to(line, {
                strokeDashoffset: 0,
                duration: 2.5,
                ease: "none"
              })
              .to(mask, {
                x: 1400, // Move completely across and beyond screen
                duration: 2.5,
                ease: "none"
              }, 0) // Start mask movement with line drawing
              
              // Immediately reset for next cycle (no pause)
              .set([line, mask], {
                strokeDashoffset: pathLength,
                x: -600 // Reset to start position
              });

              // Add to master timeline with staggered start
              masterTimeline.add(lineTl, lineNum * 0.6);
            }
          });
        };

        // Initialize the animation
        createECGAnimation();

        // Make the timeline persistent and immune to external interference
        if (timelineRef.current) {
          timelineRef.current.userData = { persistent: true };
        }
      });

      // Only cleanup on component unmount, never during re-renders
      return () => {
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
      };
    }, []); // Remove all dependencies to prevent recreation

    // Separate useEffect for theme changes that doesn't kill the animation
    useEffect(() => {
      if (!ecgRef.current) return;

      // Update colors without killing animation
      const lines = ecgRef.current.querySelectorAll('[id^="ecg-line-"]');
      const isDark = theme === 'dark';
      const ecgColor = isDark ? '#00ff41' : '#ef4444';
      const ecgGlow = isDark ? '0 0 8px #00ff41, 0 0 16px #00ff41' : '0 0 4px #ef4444';

      lines.forEach((line) => {
        const svgLine = line as SVGPathElement;
        svgLine.setAttribute('stroke', ecgColor);
        svgLine.style.filter = `drop-shadow(${ecgGlow})`;
      });
    }, [theme]); // Only theme dependency

    // Theme-responsive ECG colors
    const isDark = theme === 'dark';
    const ecgColor = isDark ? '#00ff41' : '#ef4444';
    const ecgGlow = isDark ? '0 0 8px #00ff41, 0 0 16px #00ff41' : '0 0 4px #ef4444';

    return (
      <div 
        ref={ecgRef}
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
        style={{ 
          background: 'transparent',
          filter: 'contrast(1.2) brightness(1.1)'
        }}
      >
        {/* ECG Lines with increased vertical spacing */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 300" // Extended viewBox for longer paths
          preserveAspectRatio="none"
        >
          <defs>
            {/* Extended masks for continuous trailing effect */}
            <mask id="ecgMask1">
              <rect id="ecg-mask-1" x="-600" y="0" width="600" height="300" fill="white"/>
            </mask>
            <mask id="ecgMask2">
              <rect id="ecg-mask-2" x="-600" y="0" width="600" height="300" fill="white"/>
            </mask>
            <mask id="ecgMask3">
              <rect id="ecg-mask-3" x="-600" y="0" width="600" height="300" fill="white"/>
            </mask>
          </defs>

          {/* ECG Line 1 - Top - Moved higher and spaced out more */}
          <g transform="translate(0, 20)">
            <path
              id="ecg-line-1"
              d="M-200,50 L-160,50 L-155,25 L-150,75 L-145,50 L-140,50 L-135,45 L-130,55 L-125,50 L-120,50 L-80,50 L-40,50 L-35,20 L-30,80 L-25,50 L-20,50 L20,50 L60,50 L65,30 L70,70 L75,50 L80,50 L120,50 L160,50 L165,25 L170,75 L175,50 L180,50 L220,50 L260,50 L265,30 L270,70 L275,50 L280,50 L320,50 L360,50 L365,20 L370,80 L375,50 L380,50 L420,50 L460,50 L465,25 L470,75 L475,50 L480,50 L520,50 L560,50 L565,30 L570,70 L575,50 L580,50 L620,50 L660,50 L665,20 L670,80 L675,50 L680,50 L720,50 L760,50 L765,25 L770,75 L775,50 L780,50 L820,50 L860,50 L865,30 L870,70 L875,50 L880,50 L920,50 L960,50 L965,20 L970,80 L975,50 L980,50 L1020,50 L1060,50 L1065,25 L1070,75 L1075,50 L1080,50 L1120,50 L1160,50 L1165,30 L1170,70 L1175,50 L1180,50 L1220,50"
              fill="none"
              stroke={ecgColor}
              strokeWidth="2.5"
              mask="url(#ecgMask1)"
              style={{
                filter: `drop-shadow(${ecgGlow})`,
                transition: 'stroke 0.3s ease, filter 0.3s ease'
              }}
            />
          </g>

          {/* ECG Line 2 - Middle - Increased spacing from top line */}
          <g transform="translate(0, 110)">
            <path
              id="ecg-line-2"
              d="M-200,50 L-165,50 L-162,30 L-157,70 L-152,50 L-148,50 L-143,40 L-138,60 L-133,50 L-128,50 L-90,50 L-45,50 L-40,15 L-35,85 L-30,50 L-25,50 L15,50 L55,50 L60,35 L65,65 L70,50 L75,50 L115,50 L155,50 L160,20 L165,80 L170,50 L175,50 L215,50 L255,50 L260,35 L265,65 L270,50 L275,50 L315,50 L355,50 L360,15 L365,85 L370,50 L375,50 L415,50 L455,50 L460,30 L465,70 L470,50 L475,50 L515,50 L555,50 L560,35 L565,65 L570,50 L575,50 L615,50 L655,50 L660,15 L665,85 L670,50 L675,50 L715,50 L755,50 L760,30 L765,70 L770,50 L775,50 L815,50 L855,50 L860,35 L865,65 L870,50 L875,50 L915,50 L955,50 L960,15 L965,85 L970,50 L975,50 L1015,50 L1055,50 L1060,30 L1065,70 L1070,50 L1075,50 L1115,50 L1155,50 L1160,35 L1165,65 L1170,50 L1175,50 L1215,50"
              fill="none"
              stroke={ecgColor}
              strokeWidth="2.5"
              mask="url(#ecgMask2)"
              style={{
                filter: `drop-shadow(${ecgGlow})`,
                transition: 'stroke 0.3s ease, filter 0.3s ease'
              }}
            />
          </g>

          {/* ECG Line 3 - Bottom - Further increased spacing */}
          <g transform="translate(0, 200)">
            <path
              id="ecg-line-3"
              d="M-200,50 L-155,50 L-150,35 L-145,65 L-140,50 L-135,50 L-130,42 L-125,58 L-120,50 L-115,50 L-75,50 L-30,50 L-25,25 L-20,75 L-15,50 L-10,50 L30,50 L70,50 L75,30 L80,70 L85,50 L90,50 L130,50 L170,50 L175,20 L180,80 L185,50 L190,50 L230,50 L270,50 L275,30 L280,70 L285,50 L290,50 L330,50 L370,50 L375,25 L380,75 L385,50 L390,50 L430,50 L470,50 L475,35 L480,65 L485,50 L490,50 L530,50 L570,50 L575,20 L580,80 L585,50 L590,50 L630,50 L670,50 L675,30 L680,70 L685,50 L690,50 L730,50 L770,50 L775,25 L780,75 L785,50 L790,50 L830,50 L870,50 L875,35 L880,65 L885,50 L890,50 L930,50 L970,50 L975,20 L980,80 L985,50 L990,50 L1030,50 L1070,50 L1075,30 L1080,70 L1085,50 L1090,50 L1130,50 L1170,50 L1175,25 L1180,75 L1185,50 L1190,50 L1230,50"
              fill="none"
              stroke={ecgColor}
              strokeWidth="2.5"
              mask="url(#ecgMask3)"
              style={{
                filter: `drop-shadow(${ecgGlow})`,
                transition: 'stroke 0.3s ease, filter 0.3s ease'
              }}
            />
          </g>
        </svg>
      </div>
    );
  }

// Replace the DynamicLighting component to preserve original colors:
function DynamicLighting({ currentSegment }: { currentSegment: number }) {
  const ambientRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Very bright ambient light to preserve original colors
    if (ambientRef.current) {
      ambientRef.current.intensity = 1.5 + Math.sin(time * 1.2) * 0.1;
    }
  });

  return (
    <>
      {/* Very bright ambient light to preserve original pink color */}
      <ambientLight ref={ambientRef} intensity={1.5} color="#ffffff" />
      
      {/* Minimal directional light to avoid color distortion */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        color="#ffffff"
      />
      
      {/* Remove all colored lights that might tint the heart */}
    </>
  );
}

// DynamicBackground Component
function DynamicBackground({ currentSegment, hasPlayedWelcome }: { 
  currentSegment: number; 
  hasPlayedWelcome: boolean; 
}) {
  const { theme } = useTheme();
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

  // Theme-responsive colors
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? 'bg-gray-1000' : 'bg-gray-300';
  const gridColor = isDark ? 'rgb(75, 85, 99)' : 'rgb(113, 117, 123)';
  const particleColor = isDark ? 'bg-gray-400' : 'bg-gray-900';
  const rayColor = isDark ? 'gray-400/50' : 'gray-500/40';
  const circleColor = isDark ? 'gray-400/30' : 'gray-500/20';
  const burstColor = isDark ? 'gray-400/70' : 'gray-600/60';
  const sparkleColor = isDark ? 'gray-400/90' : 'gray-600/80';

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Theme-responsive Background */}
      <div className={`absolute inset-0 ${backgroundColor} transition-colors duration-500`} />
      
      {/* Grid Overlay with Theme-responsive Colors */}
      <div 
        className="absolute inset-0 opacity-30 transition-opacity duration-500"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
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
              className={`absolute w-1 h-1 ${particleColor} rounded-full transition-colors duration-500`}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: particle.opacity * 0.4,
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

      {/* Segment-specific Light Rays - Theme-responsive */}
      {currentSegment >= 1 && (
        <>
          <motion.div
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 0.08, rotate: 45 }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
            className={`absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-${rayColor} to-transparent transform origin-top transition-colors duration-500`}
          />
          <motion.div
            initial={{ opacity: 0, rotate: 45 }}
            animate={{ opacity: 0.08, rotate: -45 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            className={`absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-${rayColor} to-transparent transform origin-top transition-colors duration-500`}
          />
        </>
      )}

      {/* Atmospheric Depth Circles - Theme-responsive */}
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
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-${circleColor} rounded-full transition-colors duration-500`}
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
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 border border-${circleColor} rounded-full transition-colors duration-500`}
          />
        </>
      )}

      {/* Final Segment Celebration Effect - Theme-responsive */}
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
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-${burstColor} rounded-full transition-colors duration-500`}
          />
          
          {/* Sparkle particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 ${sparkleColor} rounded-full transition-colors duration-500`}
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

      {/* Ambient Lighting Overlay - Theme-responsive */}
      <motion.div
        animate={{
          background: isDark ? [
            'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)'
          ] : [
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
        className="absolute inset-0 pointer-events-none transition-all duration-500"
      />
    </div>
  );
}


// 3D Heart Component with Segmented Animation
function Heart3D({ 
  hasPlayedWelcome, 
  setHasPlayedWelcome,
  currentAnimationSegment,
  animationPaused,
  setAnimationPaused,
  setShowInteractionPrompt,
  setTextAnimationsComplete,
  case0AnimationCompleted,
  setCase0AnimationCompleted
}: { 
  hasPlayedWelcome: boolean; 
  setHasPlayedWelcome: (value: boolean) => void;
  currentAnimationSegment: number;
  animationPaused: boolean;
  setAnimationPaused: (value: boolean) => void;
  setShowInteractionPrompt: (value: boolean) => void;
  setTextAnimationsComplete: (value: boolean) => void;
  case0AnimationCompleted: boolean;
  setCase0AnimationCompleted: (value: boolean) => void;
}) {
  const meshRef = useRef<any>(null);
  const { scene } = useGLTF('/pinker-heart.glb'); // Fixed file path
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
  const [currentTimeline, setCurrentTimeline] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Single unified animation effect
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
              console.log('Segment', segment, 'animation complete');
              console.log('Heart state after segment:', {
                scale: meshRef.current.scale.toArray(),
                rotation: meshRef.current.rotation.toArray(),
                position: meshRef.current.position.toArray()
              });
              
              if (segment < 3) { // Changed from 4 to 3 since we only have 4 segments (0-3)
                setAnimationPaused(true);
                console.log('Animation paused, waiting for user interaction');
              } else if (segment === 3) { // Final segment
                console.log('Final segment complete - preparing for navigation');
                setInitialAnimationComplete(true);
                setHasPlayedWelcome(true);
                setShowInteractionPrompt(false);
                
                // Auto-navigate after a brief delay to show final state
                setTimeout(() => {
                  console.log('Navigating to next section...');
                  const heroSection = document.getElementById('hero-section') || 
                                     document.querySelector('section:nth-child(2)') || 
                                     document.querySelector('[data-section="hero"]');
                  
                  if (heroSection) {
                    heroSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  } else {
                    // Fallback: scroll down by viewport height
                    window.scrollTo({
                      top: window.innerHeight,
                      behavior: 'smooth'
                    });
                  }
                }, 4000); // 4-second delay to appreciate the final VisHeart display
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
              
            case 3: // Final case - end after VisHeart fades
              console.log('Segment 3: Final scale and VisHeart display'); // Debug log
              
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
                x: 2.0,
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
              
              // Build tension with text glow
              .to("#case3-text", {
                textShadow: "0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.4)",
                duration: 0.8,
                ease: "power2.out",
                delay: 2
              })
              
              // Dramatic pause
              .to("#case3-text", {
                duration: 1.5,
                ease: "power2.inOut",
              })
              
              // Heart final positioning
              .to(meshRef.current.scale, {
                x: 1.8,
                y: 1.8, 
                z: 1.8,
                duration: 1.2,
                ease: "power2.inOut",
              }, "-=0.8")
              .to(meshRef.current.rotation, {
                y: "+=1.57", // Add π/2 for final rotation
                duration: 1.2,
                ease: "power1.inOut",
              }, "-=1.2")
              
              // Final VisHeart fade out - END ALL ANIMATIONS HERE
              .to("#case3-text", {
                opacity: 0,
                scale: 0.8,
                y: -30,
                textShadow: "0 0 50px rgba(255,255,255,1), 0 0 100px rgba(255,255,255,0.8)",
                duration: 1.2,
                ease: "power3.in",
                delay: 0.8
              })
              
              // Mark animation as complete and navigate
              .call(() => {
                console.log('VisHeart fade complete - ending all animations');
                setInitialAnimationComplete(true);
                setHasPlayedWelcome(true);
                setShowInteractionPrompt(false);
                
                // Auto-navigate to next section
                setTimeout(() => {
                  console.log('Navigating to next section...');
                  const heroSection = document.getElementById('hero-section') || 
                                     document.querySelector('section:nth-child(2)') || 
                                     document.querySelector('[data-section="hero"]');
                  
                  if (heroSection) {
                    heroSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  } else {
                    // Fallback: scroll down by viewport height
                    window.scrollTo({
                      top: window.innerHeight,
                      behavior: 'smooth'
                    });
                  }
                }, 2000); // 2 seconds after VisHeart fades
              })
              
              .set("#case3-text", { display: "none" }); // Hide the text element
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
    />
  );
}

export function Heart3DSection({
  currentAnimationSegment,
  setCurrentAnimationSegment,
  hasPlayedWelcome,
  setHasPlayedWelcome,
  animationPaused,
  setAnimationPaused,
  showInteractionPrompt,
  setShowInteractionPrompt,
  textAnimationsComplete,
  setTextAnimationsComplete,
  case0AnimationCompleted,
  setCase0AnimationCompleted
}: Heart3DSectionProps) {
  const { theme } = useTheme(); // Add theme hook

  // Animation advancement logic - moved from page.tsx
  const advanceAnimation = () => {
    console.log('Current segment before advance:', currentAnimationSegment);
    console.log('Animation paused:', animationPaused);
    console.log('Text animations complete:', textAnimationsComplete);
    
    if (currentAnimationSegment === 0 && !textAnimationsComplete) {
      console.log('Text animations not complete yet - blocking advancement');
      return;
    }
    
    if (currentAnimationSegment < 4) {
      const newSegment = currentAnimationSegment + 1;
      console.log('Advancing to segment:', newSegment);
      setCurrentAnimationSegment(newSegment);
      setAnimationPaused(false);
      
      if (currentAnimationSegment === 0) {
        setShowInteractionPrompt(false);
      }
    } else {
      console.log('Animation complete, finalizing');
      setShowInteractionPrompt(false);
      
      setTimeout(() => {
        setHasPlayedWelcome(true);
      }, 5000);
    }
  };
  
  // Update the keyboard and click event listeners - FIXED
  useEffect(() => {
    const handleInteraction = (e: KeyboardEvent | MouseEvent) => {
      if (hasPlayedWelcome) {
        console.log('Animation already complete - ignoring interaction');
        return;
      }
      
      // Block interactions only during case 0 text animations
      if (currentAnimationSegment === 0 && !textAnimationsComplete) {
        console.log('Blocking interaction - text animations still running');
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // Allow interactions when animation is paused (waiting for user input)
      if (!animationPaused && currentAnimationSegment !== 0) {
        console.log('Animation still running - ignoring interaction');
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
      console.log('Adding event listeners, current segment:', currentAnimationSegment, 'paused:', animationPaused);
      document.addEventListener('keydown', handleInteraction, { passive: false });
      document.addEventListener('click', handleInteraction, { passive: false });
    }
  
    return () => {
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, [currentAnimationSegment, hasPlayedWelcome, textAnimationsComplete, animationPaused]);
    
  // Reset text animations state when component mounts - moved from page.tsx
  useEffect(() => {
    if (currentAnimationSegment === 0) {
      setTextAnimationsComplete(false);
    }
  }, [currentAnimationSegment, setTextAnimationsComplete]);
  
  // Add this useEffect after case 0 completes - moved from page.tsx
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

  // Theme-responsive text colors
  const isDark = theme === 'dark';
  const textColor = isDark ? '#d1d5db' : '#000000'; // Light gray for dark mode, black for light mode

  return (
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
                currentAnimationSegment={currentAnimationSegment}
                animationPaused={animationPaused}
                setAnimationPaused={setAnimationPaused}
                setShowInteractionPrompt={setShowInteractionPrompt}
                setTextAnimationsComplete={setTextAnimationsComplete}
                case0AnimationCompleted={case0AnimationCompleted}
                setCase0AnimationCompleted={setCase0AnimationCompleted}
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
    
        {/* Rest of the overlay content */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Dramatic Text 1 - Case 0 - TOP LEFT CORNER */}
          <div 
            id="dramatic-text-1"
            className="absolute top-8 left-8 text-white opacity-0 transition-colors duration-500"
            style={{ transform: 'translateY(30px)' }}
          >
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider drop-shadow-2xl leading-tight transition-colors duration-500"
              style={{ 
                fontFamily: 'RetroFloral, serif',
                color: textColor
              }}
            >
              Inside the Beating Core<br />
              <span 
                style={{ 
                  fontFamily: 'RetroFloral, serif',
                  color: textColor
                }}
              >
                of Innovation..
              </span>
            </h1>
          </div>
          
          {/* Dramatic Text 2 - Case 0 - BOTTOM RIGHT CORNER */}
          <div 
            id="dramatic-text-2"
            className="absolute bottom-22 right-8 text-white opacity-0 text-right transition-colors duration-500"
            style={{ transform: 'translateY(30px)' }}
          >
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider drop-shadow-2xl leading-tight transition-colors duration-500"
              style={{ 
                fontFamily: 'RetroFloral, serif',
                color: textColor
              }}
            >
              Where AI Meets<br />
              <span 
                style={{ 
                  fontFamily: 'RetroFloral, serif',
                  color: textColor
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
              className="text-center text-black opacity-0 absolute transition-colors duration-500"
              style={{ transform: 'translateY(30px)' }}
            >
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider drop-shadow-2xl leading-tight transition-colors duration-500"
                style={{ 
                  fontFamily: 'RetroFloral, serif',
                  color: textColor
                }}
              >
                Your MRI<br />
                <span style={{ 
                  fontFamily: 'RetroFloral, serif',
                  color: textColor
                }}>
                  Now Intelligent
                </span>
              </h1>
            </div>

            {/* Case 2 Text */}
            <div 
              id="case2-text"
              className="text-center text-white opacity-0 absolute transition-colors duration-500"
              style={{ transform: 'translateY(30px)' }}
            >
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider drop-shadow-2xl leading-tight transition-colors duration-500"
                style={{ 
                  fontFamily: 'RetroFloral, serif',
                  color: textColor
                }}
              >
                The Future of Cardiac<br />
                <span 
                  style={{ 
                    fontFamily: 'RetroFloral, serif',
                    color: textColor
                  }}
                >
                  Imaging In Your Browser
                </span>
              </h1>
            </div>
          
            {/* Case 3 Text */}
            <div 
              id="case3-text"
              className="text-center text-white opacity-0 absolute transition-colors duration-500"
              style={{ transform: 'translateY(30px)' }}
            >
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider drop-shadow-2xl leading-tight transition-colors duration-500"
                style={{ 
                  fontFamily: 'RetroFloral, serif',
                  color: textColor // Use the same theme-responsive color as other text
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
              {[0, 1, 2, 3].map((segment) => (
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
  );
}