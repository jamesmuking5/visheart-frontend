"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Typing effect state
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "AI-Powered Cardiac Segmentation for Precision Healthcare";

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

  // Enhanced feature data
  const features = [
    { 
      icon: "🎯", 
      title: "Precision", 
      desc: "99.7% Accuracy",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      icon: "⚡", 
      title: "Speed", 
      desc: "Real-time Analysis",
      color: "green",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      icon: "🔒", 
      title: "Security", 
      desc: "HIPAA Compliant",
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section 
      ref={heroRef}
      id="hero-intro-section" 
      aria-label="Hero introduction" 
      className="hero-intro-section relative overflow-hidden"
    >
      <motion.div
        style={{ opacity }}
        className="hero-section relative w-full h-screen"
      >
        {/* Theme-responsive Background with Parallax */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
        >
          {/* Theme-responsive background */}
          <div className="absolute inset-0 bg-background z-5"></div>
          
          {/* Animated background patterns - theme responsive */}
          <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
        </motion.div>

        {/* Enhanced Content */}
        <motion.div 
          style={{ y: textY }}
          className="hero-content relative z-20 h-full flex items-center justify-center px-8"
        >
          <div className="max-w-7xl w-full">
            {/* Main Title with Enhanced Animation */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <motion.h1
                initial={{ letterSpacing: "0.5em", scale: 0.8 }}
                animate={{ letterSpacing: "0.2em", scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="hero-header text-6xl md:text-7xl lg:text-9xl font-bold tracking-wider text-primary m-0 drop-shadow-2xl mb-6"
              >
                VisHeart
              </motion.h1>
              
              {/* Enhanced Subtitle with Typing Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground/90 mb-4 min-h-[3rem]"
              >
                {displayText}
                <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
              </motion.div>
              
              {/* Professional Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.8 }}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              >
                Revolutionizing cardiac diagnostics with cutting-edge artificial intelligence
              </motion.p>
            </motion.div>

            {/* Enhanced Feature Cards Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3, duration: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 3.2 + (index * 0.2), 
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
                    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 h-full border border-border hover:border-border/50 transition-all duration-300">
                      <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="text-4xl mb-3 filter drop-shadow-lg"
                        >
                          {feature.icon}
                        </motion.div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-foreground transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm font-medium">
                          {feature.desc}
                        </p>
                      </div>
                      
                      {/* Animated background glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4, duration: 1 }}
              className="text-center"
            >
              <motion.a 
                href="#info-section"
                onClick={handleLearnMoreClick}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center px-12 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-lg rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button content */}
                <span className="relative z-10 mr-3">Explore VisHeart</span>
                <motion.svg 
                  className="w-5 h-5 relative z-10"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
                
                {/* Ripple effect */}
                <motion.div
                  className="absolute inset-0 bg-primary-foreground/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"
                  style={{ transformOrigin: 'center' }}
                ></motion.div>
              </motion.a>
              
              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.5, duration: 1 }}
                className="mt-16 flex flex-col items-center"
              >
                <p className="text-muted-foreground text-sm mb-4">Scroll to discover more</p>
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
        </motion.div>
      </motion.div>
    </section>
  );
}