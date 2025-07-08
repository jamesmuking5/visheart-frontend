"use client";

import { motion } from 'framer-motion';

export function HeroSection() {
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

  return (
    <section 
      id="hero-intro-section" 
      aria-label="Hero introduction" 
      className="hero-intro-section relative"
    >
      <motion.div
        style={{ opacity: 1, scale: 1 }}
        className="hero-section relative w-full h-screen overflow-hidden"
      >
        {/* Background Video with Parallax Effect */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-[#3A4454] opacity-30 z-10"></div>
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/heart.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Animated Content */}
        <div className="hero-content relative z-20 h-full flex items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-6xl w-full"
          >
            <motion.h1
              initial={{ letterSpacing: "0.5em" }}
              animate={{ letterSpacing: "0.2em" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="hero-header text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider text-white m-0 drop-shadow-lg text-left"
            >
              VisHeart
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="hero-description text-xl md:text-2xl lg:text-3xl font-light text-white mt-6 mb-12 max-w-3xl text-left"
            >
              AI-Powered Cardiac Segmentation for Precision Healthcare
            </motion.p>
            
            {/* Container for colored boxes */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
              {/* Main colored box */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 flex-1 text-left"
              >
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
                  Why choose VisHeart?
                </h3>
                <p className="text-base md:text-lg text-white/90 mb-6 leading-relaxed">
                  Because we combine cutting-edge AI technology with medical expertise to deliver the most accurate cardiac segmentation solutions, helping healthcare professionals make better decisions and save more lives.
                </p>
                <a 
                  href="#info-section"
                  onClick={handleLearnMoreClick}
                  className="hero-button px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 scroll-smooth inline-flex items-center group relative overflow-hidden"
                >
                  <span className="relative z-10">Learn More</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-y-1 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {/* Ripple effect background */}
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></span>
                </a>
              </motion.div>

              {/* Three square boxes */}
              <div className="flex flex-row gap-4">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="w-24 h-24 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-300/30 flex items-center justify-center hover:bg-blue-500/30 transition-all duration-300"
                >
                  <svg className="w-10 h-10 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className="w-24 h-24 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-300/30 flex items-center justify-center hover:bg-green-500/30 transition-all duration-300"
                >
                  <svg className="w-10 h-10 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 10a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM3 3a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V3z" clipRule="evenodd"/>
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6, duration: 0.8 }}
                  className="w-24 h-24 bg-purple-500/20 backdrop-blur-sm rounded-xl border border-purple-300/30 flex items-center justify-center hover:bg-purple-500/30 transition-all duration-300"
                >
                  <svg className="w-10 h-10 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}