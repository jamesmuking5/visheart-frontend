"use client";

import { useState, useEffect, useMemo } from "react";

// --- Animation Library Imports ---
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// --- Page Section Component Imports ---
import { HeroSection } from "@/components/hero-section";
import { AboutUsSection } from "@/components/about-us-section";
import { ServicesSection } from "@/components/services-section";
import { FaqSection } from "@/components/faq-section";
import { GallerySection } from "@/components/gallery-section";
import { ContactSection } from "@/components/contact-section";
import { InteractiveGallerySection } from "@/components/interactive-gallery-section";
import { Commands } from "@/components/commands";
import { Heart3DSection } from "@/components/heart-3d-section";

// Register the GSAP ScrollTrigger plugin if in a browser environment
if (typeof window !== "undefined") {
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

  return (
    <>
      <main>
        <div className="flex h-80 items-center justify-center border-red-50 text-4xl font-bold">
          It is empty... for performance reasons... I am sorry...
        </div>
        {/* 3D Heart Interactive Section - Using extracted component */}
        {/* <Heart3DSection
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
        /> */}

        {/* Hero/Intro Section - Main introduction with VisHeart branding and key features */}
        {/* <HeroSection /> */}

        {/* About/Key Benefits Section - Detailed information and benefits */}
        {/* <AboutUsSection /> */}

        {/* Services Section - Our medical services and offerings */}
        {/* <ServicesSection /> */}

        {/* FAQ Section - Frequently Asked Questions */}
        {/* <FaqSection /> */}

        {/* Gallery Section */}
        {/* <GallerySection /> */}

        {/* Contact Section */}
        {/* <ContactSection /> */}

        {/* --- 3D Interactive Gallery Section --- */}
        {/* <InteractiveGallerySection/> */}
      </main>

      {/* Floating Command Search Button */}
      <Commands />
    </>
  );
}
