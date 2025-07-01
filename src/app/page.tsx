"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';

// UI Imports
import Footer from "@/ui/footer/footer";
import Header from "@/ui/header/header";

export default function Home() {
  // State for image slider
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Auto-slide functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      goToSlide((currentSlide + 1) % sliderImages.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentSlide, sliderImages.length]);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section with Background Video */}
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
          <div className="hero-content relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.h1
                initial={{ letterSpacing: "0.5em" }}
                animate={{ letterSpacing: "0.2em" }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="hero-header text-7xl md:text-6xl font-light tracking-wider text-white m-0 drop-shadow-lg"
              >
                VisHeart
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="hero-description text-xl md:text-2xl font-light text-white mt-6 mb-12 max-w-2xl mx-auto"
              >
                AI-Powered Cardiac Segmentation for Precision Healthcare
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                <a href="#info-section"
                  className="hero-button px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:-translate-y-1 scroll-smooth inline-flex items-center group"
                >
                  Explore
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Information Section with Image Slider */}
        <div id="info-section" className="info-section py-24 px-8 bg-[#FFFCF6]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Info Description */}
              <div className="info-desc w-full lg:w-1/2 lg:sticky lg:top-8">
                <h2 className="text-3xl font-light mb-8 text-[#3A4454]">
                  Advanced Cardiac<br />Imaging Technology
                </h2>

                <p className="text-base mb-6 text-[#3A4454] leading-relaxed">
                  The cardiac system is the heart's network for circulating oxygen-rich blood throughout the body. Our VisHeart technology provides unprecedented visualization capabilities for cardiac specialists, enabling more accurate diagnosis through AI-powered segmentation.
                </p>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3 text-[#5B7B9A]">Key Benefits</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#A87C5F] mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Advanced AI segmentation algorithms for greater accuracy</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#A87C5F] mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Cloud-based collaboration for specialists worldwide</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#A87C5F] mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Intuitive interface optimized for clinical workflows</span>
                    </li>
                  </ul>
                </div>

                <div className="info-button mt-8">
                  <Link href="/about-us"
                    className="px-6 py-3 bg-[#5B7B9A] hover:bg-[#4A6A89] text-white rounded-md transition-all duration-300 shadow-md"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Enhanced Image Slider */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2 relative overflow-hidden rounded-xl shadow-2xl h-[450px]"
              >
                <AnimatePresence>
                  {sliderImages.map((image, index) => (
                    index === currentSlide && (
                      <motion.div
                        key={image.src}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900 to-transparent p-8">
                          <p className="text-white text-lg opacity-90">{image.caption}</p>
                        </div>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>

                {/* Improved slider controls */}
                <div className="absolute bottom-4 right-4 flex space-x-3">
                  {sliderImages.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => goToSlide(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        {/* ... other sections from LandingPage.jsx can be added here ... */}
      </main>
      <Footer />
    </>
  );
}