"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";

export default function AboutUsSection() {
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

  // Auto-slide functionality
  useState(() => {
    const timer = setInterval(() => {
      goToSlide((currentSlide + 1) % sliderImages.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(timer);
  });

  return (
    <section aria-label="About VisHeart and key benefits" className="about-benefits-section">
      <div id="info-section" className="py-24 bg-gradient-to-br from-background to-muted">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Info Description */}
            <div className="info-desc w-full lg:w-1/2 lg:sticky lg:top-8">
              <h2 className="text-3xl font-light mb-8 text-foreground">
                About Us
              </h2>

              <p className="text-base mb-6 text-muted-foreground leading-relaxed">
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
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}