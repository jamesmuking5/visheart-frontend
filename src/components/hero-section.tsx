"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HeroSection() {
  // Typing effect state
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Web-based Application for Cardiac Component Segmentation";

  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setShowCursor(false);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Enhanced feature data based on research objectives
  const features = [
    { 
      icon: "🏥", 
      title: "MRI Upload & Processing", 
      desc: "DICOM & NifTI format support with automated anonymization",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      icon: "🧠", 
      title: "AI-Powered Segmentation", 
      desc: "YOLOv11 + MedSAM integration for precise cardiac components",
      color: "green",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      icon: "�", 
      title: "Interactive Refinement", 
      desc: "Manual ROI adjustment and real-time visualization",
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  // Cardiac components data with technical details
  const cardiacComponents = [
    { name: "Left Ventricle Cavity", abbr: "LVC", color: "text-red-500", slice: "Short Axis" },
    { name: "Left Ventricle Myocardium", abbr: "MYO", color: "text-green-500", slice: "Base to Apex" },
    { name: "Right Ventricle Cavity", abbr: "RV", color: "text-blue-500", slice: "Cross-sectional" }
  ];

  // Pipeline steps
  const pipelineSteps = [
    { step: "1", title: "Upload", desc: "MRI Stack (.dcm/.nii/.nii.gz)" },
    { step: "2", title: "Detection", desc: "YOLOv11 Localization" },
    { step: "3", title: "Segmentation", desc: "MedSAM Processing" },
    { step: "4", title: "Export", desc: "NifTI Output" }
  ];

  return (
    <section 
      id="hero-intro-section" 
      aria-label="Hero introduction" 
      className="hero-intro-section relative overflow-hidden"
    >
      <div className="hero-section relative w-full min-h-[180vh] h-auto">
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
        <div className="hero-content relative z-20 min-h-[180vh] flex items-center justify-center px-8 py-20">
          <div className="max-w-7xl w-full">
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <motion.h1
                initial={{ letterSpacing: "0.5em", scale: 0.8 }}
                animate={{ letterSpacing: "0.2em", scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="hero-header text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider text-primary m-0 drop-shadow-2xl mb-8"
              >
                VisHeart
              </motion.h1>
              
              {/* Enhanced Subtitle with Typing Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-lg md:text-xl lg:text-2xl font-light text-foreground/90 mb-6 min-h-[3rem]"
              >
                {displayText}
                <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
              </motion.div>
              
              {/* Enhanced Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.8 }}
                className="text-base md:text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              >
                Revolutionizing cardiac care by bridging advanced AI segmentation models with clinical workflows through an intuitive web-based platform for MRI analysis
              </motion.p>
            </motion.div>

            {/* Processing Pipeline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 1 }}
              className="text-center mb-12"
            >
              <h3 className="text-lg font-semibold text-foreground/80 mb-6">AI Processing Pipeline</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {pipelineSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3 + (index * 0.2), duration: 0.5 }}
                    className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 relative"
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white dark:text-black font-bold text-sm mb-2 mx-auto">
                        {step.step}
                      </div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                    {index < pipelineSteps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-primary/50"></div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Cardiac Components Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.5, duration: 1 }}
              className="text-center mb-12"
            >
              <h3 className="text-lg font-semibold text-foreground/80 mb-6">Target Segmentation Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {cardiacComponents.map((component, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.7 + (index * 0.2), duration: 0.5 }}
                    className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4"
                  >
                    <div className="text-center">
                      <span className={`font-bold text-lg ${component.color}`}>{component.abbr}</span>
                      <h4 className="font-medium text-foreground text-sm mt-1">{component.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{component.slice}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4, duration: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 4.2 + (index * 0.2), 
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative"
                >
                  <div className={`bg-gradient-to-br ${feature.gradient} p-[1px] rounded-2xl`}>
                    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 h-full border border-border hover:border-border/50 transition-all duration-300">
                      <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="text-4xl mb-4 filter drop-shadow-lg"
                        >
                          {feature.icon}
                        </motion.div>
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm font-medium">
                          {feature.desc}
                        </p>
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Research Context */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.8, duration: 1 }}
              className="text-center mb-16"
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
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground">Cardiac Components</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">2</div>
                    <div className="text-sm text-muted-foreground">AI Models Integrated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-sm text-muted-foreground">Patient Anonymization</div>
                  </div>
                </div>
                <div className="mt-6 text-xs text-muted-foreground/80">
                  <span className="font-medium">Supervised by:</span> Dr. Miko Chang May Lee & Kathy Wong Hui Ying
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.2, duration: 1 }}
              className="text-center pb-16"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5.5, duration: 1 }}
                className="flex flex-col items-center"
              >
                <p className="text-muted-foreground text-sm mb-6">Discover The Future of Cardiac Imaging</p>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
                >
                  <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1 h-3 bg-muted-foreground/60 rounded-full mt-2"
                  ></motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}