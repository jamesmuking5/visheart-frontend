"use client";

import { useState, useEffect, useMemo } from 'react';

// --- Animation Library Imports ---
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// --- Page Section Component Imports ---
import { HeroSection } from '@/components/hero-section';
import { AboutUsSection } from '@/components/about-us-section'; 
import { ServicesSection } from '@/components/services-section';
import { FaqSection } from "@/components/faq-section";
import { GallerySection } from "@/components/gallery-section";
import { ContactSection } from "@/components/contact-section";
import { InteractiveGallerySection } from '@/components/interactive-gallery-section';
import { Commands } from '@/components/commands';
import { Heart3DSection } from '@/components/heart-3d-section';

// Register the GSAP ScrollTrigger plugin if in a browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {   
  // State for initial welcome animation
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  // New states for segmented animation
  const [currentAnimationSegment, setCurrentAnimationSegment] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [showInteractionPrompt, setShowInteractionPrompt] = useState(true);

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
        <HeroSection />

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

        {/* --- 3D Interactive Gallery Section --- */}
        <InteractiveGallerySection/>
      </main>

      {/* Floating Command Search Button */}
      <Commands />
    </>
  );
}