"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function Commands() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCommandDropdown, setShowCommandDropdown] = useState(false);

  // Navigation function
  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setShowCommandDropdown(false);
    }
  };

  return (
    <div className="fixed top-20 right-15 z-50">
      <div className="relative">
        {/* Search Button */}
        <button
          onMouseEnter={() => setShowCommandDropdown(true)}
          onMouseLeave={() => setShowCommandDropdown(false)}
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setShowCommandDropdown(!showCommandDropdown);
          }}
          className="bg-black dark:bg-white text-white dark:text-black border border-border hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 rounded-full p-4 shadow-lg group"
          aria-label="Search and navigate sections (Ctrl+K)"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-200 group-hover:scale-110"
          >
            <path 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        {/* Command Dropdown */}
        <AnimatePresence>
          {showCommandDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg overflow-hidden backdrop-blur-sm"
              onMouseEnter={() => setShowCommandDropdown(true)}
              onMouseLeave={() => setShowCommandDropdown(false)}
            >
              <Command className="w-full">
                <CommandInput 
                  placeholder="Search sections..." 
                  className="border-0 focus:ring-0" 
                />
                <CommandList className="max-h-[200px]">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Navigation">
                    <CommandItem 
                      onSelect={() => navigateToSection('heart-3d-section')}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>3D Heart</span>
                    </CommandItem>
                    
                    <CommandItem 
                      onSelect={() => navigateToSection('hero-intro-section')}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Home</span>
                    </CommandItem>
                    
                    <CommandItem 
                      onSelect={() => navigateToSection('technical-specs-section')}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <span>Technical Specs</span>
                    </CommandItem>
                    
                    <CommandItem 
                      onSelect={() => navigateToSection('target-users-section')}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Target Users</span>
                    </CommandItem>
                    
                    <CommandItem 
                      onSelect={() => navigateToSection('services-section')}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Services</span>
                    </CommandItem>
                    
                    <CommandItem 
                      onSelect={() => navigateToSection('faq-section')}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>FAQ</span>
                    </CommandItem>
                    
                    <CommandItem 
                      onSelect={() => navigateToSection('3d-gallery-section')}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Interactive Gallery</span>
                    </CommandItem>
                    
                    <CommandItem 
                      onSelect={() => navigateToSection('contact-section')}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
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
  );
}