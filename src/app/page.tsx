"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"



export default function Home() {
  // State for image slider
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // State for command dialog
  const [commandOpen, setCommandOpen] = useState(false);

  // Images for slider
  const sliderImages = [
    { src: "/image-1.png", alt: "Cardiac MRI Scan", caption: "Cardiac MRI Scan" },
    { src: "/image-2.png", alt: "High-Reso Cardiac MRI Scan", caption: "High-resolution cardiac imaging" },
    { src: "/image-3.png", alt: "Doctor Interface", caption: "Intuitive specialist interface" }
  ];

  // Handle manual slider navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Feature hover animation
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  // Navigation function
  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setCommandOpen(false);
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

  // Keyboard shortcut to open command
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandOpen]);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      goToSlide((currentSlide + 1) % sliderImages.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentSlide, sliderImages.length]);

  return (
    <>
      <main></main>
    </>
  );
}