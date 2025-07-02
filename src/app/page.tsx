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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  // State for image slider
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // State for command dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCommandDropdown, setShowCommandDropdown] = useState(false);

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
      setShowCommandDropdown(false);
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
        setDropdownOpen(!dropdownOpen);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      goToSlide((currentSlide + 1) % sliderImages.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentSlide, sliderImages.length]);

  return (
    <>
      <main>
        {/* Hero/Intro Section - Main introduction with VisHeart branding and key features */}
        <section id="hero-intro-section" aria-label="Hero introduction" className="hero-intro-section">
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

        {/* About/Key Benefits Section - Detailed information and benefits */}
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
        </section>

        {/* Services Section - Our medical services and offerings */}
        <section id="services-section" aria-label="VisHeart Services" className="services-section">
          <div className="py-24 bg-gradient-to-br from-background to-muted">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-light mb-6 text-foreground">
                  Services
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Comprehensive cardiac imaging solutions powered by cutting-edge AI technology to support healthcare professionals in delivering precision care.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Service 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/40 transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">AI Cardiac Segmentation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Advanced machine learning algorithms automatically identify and segment cardiac structures from medical imaging data with unprecedented accuracy.
                  </p>
                </motion.div>

                {/* Service 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/40 transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 8a1 1 0 01-1-1V8a1 1 0 00-1-1H8a1 1 0 00-1 1v4a1 1 0 01-1 1h6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Real-time Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Instant processing and analysis of cardiac imaging data, providing immediate insights to support clinical decision-making in critical situations.
                  </p>
                </motion.div>

                {/* Service 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/40 transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Cloud Integration</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Seamless cloud-based platform enabling secure collaboration between specialists worldwide with enterprise-grade data protection.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Frequently Asked Questions */}
        <section id="faq-section" aria-label="Frequently Asked Questions" className="faq-section">
          <div className="py-24 bg-gradient-to-br from-background to-muted">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-light mb-6 text-foreground">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Find answers to common questions about VisHeart's AI-powered cardiac segmentation technology and implementation.
                </p>
              </motion.div>

              <div className="space-y-6">
                {/* FAQ 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    How accurate is VisHeart's AI segmentation technology?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    VisHeart achieves over 95% accuracy in cardiac structure identification, validated through extensive clinical trials and peer-reviewed studies. Our AI models are trained on diverse datasets from leading medical institutions worldwide.
                  </p>
                </motion.div>

                {/* FAQ 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    What imaging modalities does VisHeart support?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    VisHeart is compatible with multiple imaging modalities including MRI, CT, echocardiography, and nuclear imaging. Our platform automatically adapts to different image formats and resolutions for seamless integration.
                  </p>
                </motion.div>

                {/* FAQ 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    How long does the implementation process take?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Implementation typically takes 2-4 weeks depending on your existing infrastructure. This includes system integration, staff training, and workflow optimization. Our dedicated support team ensures a smooth transition with minimal disruption.
                  </p>
                </motion.div>

                {/* FAQ 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Is patient data secure in the cloud platform?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Absolutely. VisHeart employs enterprise-grade encryption, HIPAA compliance, and advanced security protocols. All data is encrypted both in transit and at rest, with strict access controls and audit trails for complete transparency.
                  </p>
                </motion.div>

                {/* FAQ 5 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    What kind of training and support do you provide?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We offer comprehensive training programs including hands-on workshops, online tutorials, and personalized sessions. Our 24/7 technical support team provides ongoing assistance, regular software updates, and continuous optimization recommendations.
                  </p>
                </motion.div>

                {/* FAQ 6 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Can VisHeart integrate with existing hospital systems?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Yes, VisHeart seamlessly integrates with most PACS, EMR, and hospital information systems through standard DICOM protocols and HL7 interfaces. Our technical team works closely with your IT department to ensure smooth integration.
                  </p>
                </motion.div>
              </div>

              {/* Contact CTA - Updated for theme adaptation */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Still have questions?
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Our team of experts is ready to help you understand how VisHeart can transform your cardiac imaging workflow.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center group"
                  >
                    Contact Our Team
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery-section" aria-label="VisHeart Gallery" className="gallery-section">
        <div className="py-24 px-8 bg-gradient-to-br from-background to-muted">
          <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-light mb-6 text-foreground">
                  Gallery
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Explore our advanced cardiac imaging capabilities and see how VisHeart transforms medical visualization for better patient outcomes.
                </p>
              </motion.div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Gallery Item 1 - Cardiac MRI Segmentation */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src="/image-1.png"
                          alt="Cardiac MRI Segmentation"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-primary/20 backdrop-blur-sm p-2 rounded-full border border-primary/30 hover:bg-primary/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        Cardiac MRI Segmentation
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Advanced AI-powered segmentation of cardiac structures from MRI imaging with unprecedented precision and accuracy.
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all duration-300"
                      >
                        View Details
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 2 - High-Resolution Imaging */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src="/image-2.png"
                          alt="High-Resolution Cardiac Imaging"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-secondary/20 backdrop-blur-sm p-2 rounded-full border border-secondary/30 hover:bg-secondary/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        High-Resolution Imaging
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Crystal-clear cardiac visualization with enhanced detail and precision for superior diagnostic capabilities.
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all duration-300"
                      >
                        View Details
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 3 - Specialist Interface */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src="/image-3.png"
                          alt="Doctor Interface"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-accent/20 backdrop-blur-sm p-2 rounded-full border border-accent/30 hover:bg-accent/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        Specialist Interface
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Intuitive user interface designed specifically for medical professionals with streamlined workflows.
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all duration-300"
                      >
                        View Details
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 4 - AI-Powered Analytics (Large Card) */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-primary/20 backdrop-blur-sm p-2 rounded-full border border-primary/30 hover:bg-primary/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 min-h-[300px]">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <CardTitle className="text-2xl font-semibold text-foreground mb-4">
                          AI-Powered Analytics
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                          Advanced machine learning algorithms provide real-time cardiac analysis and diagnostic support for enhanced clinical decision-making.
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium"
                      >
                        Explore AI Features
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 5 - Cloud Integration */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-secondary/20 backdrop-blur-sm p-2 rounded-full border border-secondary/30 hover:bg-secondary/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-secondary/30 to-primary/30 min-h-[200px]">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          Cloud Integration
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                          Seamless cloud-based collaboration platform
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all duration-300"
                      >
                        Learn More
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 6 - Real-time Processing */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-accent/20 backdrop-blur-sm p-2 rounded-full border border-accent/30 hover:bg-accent/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-accent/30 to-secondary/30 min-h-[200px]">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          Real-time Processing
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                          Instant analysis and diagnostic insights
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all duration-300"
                      >
                        Learn More
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Gallery Item 7 - Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 lg:col-span-1 group"
                >
                  <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <CardAction>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-destructive/20 backdrop-blur-sm p-2 rounded-full border border-destructive/30 hover:bg-destructive/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                            </svg>
                          </motion.button>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-destructive/20 to-primary/20 min-h-[250px]">
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.8, delay: 0.8 }}
                          viewport={{ once: true }}
                          className="text-4xl font-bold text-foreground mb-2"
                        >
                          95%+
                        </motion.div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          Accuracy Rate
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                          Clinically validated precision in cardiac segmentation
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all duration-300"
                      >
                        View Statistics
                      </motion.button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>

              {/* Gallery CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <Card className="p-8">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold text-foreground mb-4">
                      See VisHeart in Action
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                      Experience the future of cardiac imaging with our interactive demo. Discover how VisHeart can transform your medical practice.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 inline-flex items-center justify-center group"
                    >
                      Schedule Demo
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 inline-flex items-center justify-center group"
                    >
                      View Documentation
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </motion.button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact-section" className="py-24 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light text-foreground mb-4">Contact</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ready to revolutionize your cardiac imaging workflow? Contact our team of specialists.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information with Tabs */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <Tabs defaultValue="contact" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="form">Quick Form</TabsTrigger>
                </TabsList>

                {/* Contact Info Tab */}
                <TabsContent value="contact" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Call Us */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground ml-4">Call Us</h3>
                      </div>
                      <p className="text-muted-foreground mb-2">+60 12-345 6789</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM</p>
                    </motion.div>

                    {/* Email Us */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground ml-4">Email Us</h3>
                      </div>
                      <p className="text-muted-foreground mb-2">support@visheart.com</p>
                      <p className="text-sm text-muted-foreground">24/7 Support</p>
                    </motion.div>
                  </div>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="mt-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground ml-4">Our Location</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-foreground font-medium">VisHeart Medical Technologies</p>
                      <p className="text-muted-foreground">Swinburne University of Technology</p>
                      <p className="text-muted-foreground">Jalan Simpang Tiga, 93350</p>
                      <p className="text-muted-foreground">Kuching, Sarawak, Malaysia</p>
                    </div>
                    
                    {/* Office Hours */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="text-lg font-semibold text-foreground mb-3">Office Hours</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                        <div>Saturday: 9:00 AM - 2:00 PM</div>
                        <div>Sunday: Closed</div>
                        <div className="text-primary">Emergency Support: 24/7</div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Quick Form Tab */}
                <TabsContent value="form" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="bg-card p-8 rounded-xl shadow-lg border border-border"
                  >
                    <h3 className="text-xl font-semibold text-foreground mb-6">Quick Contact</h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Your Name"
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                        />
                        <input
                          type="email"
                          placeholder="Your Email"
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all resize-none bg-background text-foreground placeholder:text-muted-foreground"
                      ></textarea>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium"
                      >
                        Send Message
                      </motion.button>
                    </form>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card p-4 rounded-xl shadow-lg h-full min-h-[600px] border border-border">
                <div className="w-full h-full rounded-lg overflow-hidden relative">
                  {/* Google Maps Embed with proper center and zoom */}
                  <iframe
                    id="swinburne-map"
                    src="https://maps.google.com/maps?q=Swinburne%20University%20of%20Technology%20Sarawak%20Campus,%20Jalan%20Simpang%20Tiga,%2093350%20Kuching,%20Sarawak,%20Malaysia&t=&z=17&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '500px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                  
                  {/* Recenter Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      // Reload the iframe to recenter
                      const iframe = document.getElementById('swinburne-map') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = iframe.src;
                      }
                    }}
                    className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-10"
                    title="Recenter Map"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Floating Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="absolute top-8 right-8 bg-card p-3 rounded-lg shadow-xl max-w-[200px] border border-border"
              >
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs font-semibold text-foreground">VisHeart HQ</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Cardiac imaging innovation center
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>📍 Swinburne University</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      </main>

      {/* Floating Command Search Button */}
      <div className="fixed top-20 right-15 z-50">
        <div className="relative">
          <button
            onMouseEnter={() => setShowCommandDropdown(true)}
            onMouseLeave={() => setShowCommandDropdown(false)}
            className="bg-black dark:bg-white text-white dark:text-black border border-border hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 rounded-full p-4 shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Command Dropdown */}
          <AnimatePresence>
            {showCommandDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
                onMouseEnter={() => setShowCommandDropdown(true)}
                onMouseLeave={() => setShowCommandDropdown(false)}
              >
                <Command className="w-full">
                  <CommandInput placeholder="Search sections..." className="border-0" />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem onSelect={() => navigateToSection('hero-intro-section')}>
                        <span>Home</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('info-section')}>
                        <span>About Us</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('services-section')}>
                        <span>Services</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('faq-section')}>
                        <span>FAQ</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('gallery-section')}>
                        <span>Gallery</span>
                      </CommandItem>
                      <CommandItem onSelect={() => navigateToSection('contact-section')}>
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
    </>
  );
}