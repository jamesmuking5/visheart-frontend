"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HeroSection() {
  
  // Add dropdown state
  const [showComponents, setShowComponents] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showSegTypes, setShowSegTypes] = useState(false);

  // Cardiac components data
  const cardiacComponents = [
    { abbr: "LVC", name: "Left Ventricle Cavity", color: "text-red-500" },
    { abbr: "MYO", name: "Myocardium", color: "text-green-500" },
    { abbr: "RV", name: "Right Ventricle", color: "text-blue-500" }
  ];

  // AI models data
  const aiModels = [
    { abbr: "YOLOv11" },
    { abbr: "MedSAM" }
  ];

  // Segmentation types data
  const segmentationTypes = [
    { abbr: "2D Segmentation" },
    { abbr: "3D Segmentation" }
  ];

  const hoverCardClass = "transition-all duration-300 hover:scale-[1.03] hover:shadow-xl";

  return (
    <section 
      id="hero-intro-section" 
      aria-label="Hero introduction" 
      className="hero-intro-section relative overflow-hidden"
    >
      <div className="hero-section relative w-full min-h-[90vh] h-auto">
        {/* Enhanced Background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-background z-5"></div>
          
          {/* Medical-themed animated patterns */}
          <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
            {/* Heart-like pulse effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Content */}
        <div className="hero-content relative z-20 min-h-[90vh] flex items-center justify-center px-8 py-20">
          <div className="max-w-7xl w-full">
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-light mb-6 text-foreground">
                <span className="text-primary font-semibold"> About VisHeart</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Transforming cardiac MRI analysis through AI-powered segmentation technology
              </p>
            </motion.div>

            {/* Problem Statement & Solution */}
            <div className="max-w-6xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Problem Statement */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className={`bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 text-center ${hoverCardClass}`}
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-2xl font-semibold text-foreground mb-4 flex items-center justify-center"
                  >
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      viewport={{ once: true }}
                      className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mr-3"
                    >
                      <span className="text-white text-xl">⚠️</span>
                    </motion.div>
                    The Challenge
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="text-muted-foreground leading-relaxed text-center"
                  >
                    Advanced cardiac segmentation models exist but operate as standalone systems without user-friendly interfaces. 
                    This gap hinders clinical adoption and integration into healthcare workflows, limiting the real-world impact of AI research.
                  </motion.p>
                </motion.div>
            
                {/* Our Solution */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className={`bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 text-center ${hoverCardClass}`}
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="text-2xl font-semibold text-foreground mb-4 flex items-center justify-center"
                  >
                    <motion.div 
                      initial={{ scale: 0, rotate: 180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      viewport={{ once: true }}
                      className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3"
                    >
                      <span className="text-white text-xl">💡</span>
                    </motion.div>
                    Our Solution
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    viewport={{ once: true }}
                    className="text-muted-foreground leading-relaxed text-center"
                  >
                    VisHeart bridges this gap with an intuitive web-based platform that integrates cutting-edge AI models into clinical workflows. 
                    We enable seamless MRI upload, automated segmentation, and interactive refinement tools for healthcare professionals.
                  </motion.p>
                </motion.div>
              </motion.div>
            </div>          

            {/* Research Context */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1 }}
              className={`text-center mb-16 ${hoverCardClass}`}
            >
              <div className="max-w-5xl mx-auto bg-card/30 backdrop-blur-sm border border-border rounded-xl p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Research Innovation</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Addressing the critical gap between advanced cardiac segmentation research and clinical practice. Our web-based platform integrates 
                  state-of-the-art models (YOLOv11, MedSAM) to provide clinicians with an accessible, user-friendly interface for MRI cardiac analysis, 
                  enabling seamless integration into existing healthcare workflows. The platform supports both 2D slice-by-slice segmentation and 
      advanced 3D cardiac reconstruction capabilities, offering comprehensive cardiac analysis solutions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Cardiac Components with Dropdown */}
                  <div
                    className="text-center relative group"
                    // group class for hover
                    onMouseEnter={() => setShowComponents(true)}
                    onMouseLeave={() => setShowComponents(false)}
                  >
                    <div className="w-full flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-primary">3</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center">
                        Cardiac Components
                      </div>
                      <div className="flex justify-center w-full mt-1">
                        <svg
                          className={`w-5 h-5 mx-auto transition-transform duration-200 ${showComponents ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {showComponents && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-card border border-border rounded-lg shadow-lg px-6 py-4 z-20 min-w-[320px]">
                        <div className="flex flex-row items-start justify-center gap-8">
                          {cardiacComponents.map((comp) => (
                            <div key={comp.abbr} className="flex flex-col items-center">
                              <span className={`font-bold text-lg ${comp.color}`}>{comp.abbr}</span>
                              <span className="text-xs text-muted-foreground mt-1 text-center">{comp.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Models Integrated with Dropdown */}
                  <div
                    className="text-center relative group"
                    onMouseEnter={() => setShowModels(true)}
                    onMouseLeave={() => setShowModels(false)}
                  >
                    <div className="w-full flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-primary">2</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center">
                        AI Models Integrated
                      </div>
                      <div className="flex justify-center w-full mt-1">
                        <svg
                          className={`w-5 h-5 mx-auto transition-transform duration-200 ${showModels ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {showModels && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-card border border-border rounded-lg shadow-lg px-6 py-4 z-20 min-w-[220px]">
                        <div className="flex flex-row items-start justify-center gap-8">
                          {aiModels.map((model) => (
                            <div key={model.abbr} className="flex flex-col items-center">
                              <span className="font-bold text-lg text-primary">{model.abbr}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Segmentation Types with Dropdown */}
                  <div
                    className="text-center relative group"
                    onMouseEnter={() => setShowSegTypes(true)}
                    onMouseLeave={() => setShowSegTypes(false)}
                  >
                    <div className="w-full flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-primary">2</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center">
                        Segmentation Types
                      </div>
                      <div className="flex justify-center w-full mt-1">
                        <svg
                          className={`w-5 h-5 mx-auto transition-transform duration-200 ${showSegTypes ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {showSegTypes && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-card border border-border rounded-lg shadow-lg px-6 py-4 z-20 min-w-[220px]">
                        <div className="flex flex-row items-start justify-center gap-8">
                          {segmentationTypes.map((type) => (
                            <div key={type.abbr} className="flex flex-col items-center">
                              <span className="font-bold text-lg text-primary">{type.abbr}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                
                  </div>
                </div>
              </div>  
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}