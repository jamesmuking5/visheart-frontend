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
        {/* Hero/Intro Section - Main introduction with VisHeart branding and key features */}
        <section aria-label="Hero introduction" className="hero-intro-section">
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
                className="hero-header text-6xl md:text-7xl lg:text-8xl font-light tracking-wider text-white m-0 drop-shadow-lg text-left"
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
                  <a href="#info-section"
                    className="hero-button px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:-translate-y-1 scroll-smooth inline-flex items-center group"
                  >
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
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
          <div id="info-section" className="info-section py-24 px-8 bg-[#FFFCF6]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Info Description */}
              <div className="info-desc w-full lg:w-1/2 lg:sticky lg:top-8">
                <h2 className="text-3xl font-light mb-8 text-[#3A4454]">
                  About Us
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
        <section aria-label="VisHeart Services" className="services-section">
          <div className="py-24 px-8 bg-[#3A4454]">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-light mb-6 text-white">
                  Services
                </h2>
                <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
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
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-all duration-300">
                    <svg className="w-8 h-8 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">AI Cardiac Segmentation</h3>
                  <p className="text-white/80 leading-relaxed">
                    Advanced machine learning algorithms automatically identify and segment cardiac structures from medical imaging data with unprecedented accuracy.
                  </p>
                </motion.div>

                {/* Service 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-all duration-300">
                    <svg className="w-8 h-8 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 8a1 1 0 01-1-1V8a1 1 0 00-1-1H8a1 1 0 00-1 1v4a1 1 0 01-1 1h6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Real-time Analysis</h3>
                  <p className="text-white/80 leading-relaxed">
                    Instant processing and analysis of cardiac imaging data, providing immediate insights to support clinical decision-making in critical situations.
                  </p>
                </motion.div>

                {/* Service 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-all duration-300">
                    <svg className="w-8 h-8 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Cloud Integration</h3>
                  <p className="text-white/80 leading-relaxed">
                    Seamless cloud-based platform enabling secure collaboration between specialists worldwide with enterprise-grade data protection.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Frequently Asked Questions */}
        <section aria-label="Frequently Asked Questions" className="faq-section">
          <div className="py-24 px-8 bg-[#FFFCF6]">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-light mb-6 text-[#3A4454]">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-[#3A4454]/80 max-w-3xl mx-auto leading-relaxed">
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
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#A87C5F]/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-[#3A4454] mb-4">
                    How accurate is VisHeart's AI segmentation technology?
                  </h3>
                  <p className="text-[#3A4454]/80 leading-relaxed">
                    VisHeart achieves over 95% accuracy in cardiac structure identification, validated through extensive clinical trials and peer-reviewed studies. Our AI models are trained on diverse datasets from leading medical institutions worldwide.
                  </p>
                </motion.div>

                {/* FAQ 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#A87C5F]/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-[#3A4454] mb-4">
                    What imaging modalities does VisHeart support?
                  </h3>
                  <p className="text-[#3A4454]/80 leading-relaxed">
                    VisHeart is compatible with multiple imaging modalities including MRI, CT, echocardiography, and nuclear imaging. Our platform automatically adapts to different image formats and resolutions for seamless integration.
                  </p>
                </motion.div>

                {/* FAQ 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#A87C5F]/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-[#3A4454] mb-4">
                    How long does the implementation process take?
                  </h3>
                  <p className="text-[#3A4454]/80 leading-relaxed">
                    Implementation typically takes 2-4 weeks depending on your existing infrastructure. This includes system integration, staff training, and workflow optimization. Our dedicated support team ensures a smooth transition with minimal disruption.
                  </p>
                </motion.div>

                {/* FAQ 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#A87C5F]/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-[#3A4454] mb-4">
                    Is patient data secure in the cloud platform?
                  </h3>
                  <p className="text-[#3A4454]/80 leading-relaxed">
                    Absolutely. VisHeart employs enterprise-grade encryption, HIPAA compliance, and advanced security protocols. All data is encrypted both in transit and at rest, with strict access controls and audit trails for complete transparency.
                  </p>
                </motion.div>

                {/* FAQ 5 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#A87C5F]/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-[#3A4454] mb-4">
                    What kind of training and support do you provide?
                  </h3>
                  <p className="text-[#3A4454]/80 leading-relaxed">
                    We offer comprehensive training programs including hands-on workshops, online tutorials, and personalized sessions. Our 24/7 technical support team provides ongoing assistance, regular software updates, and continuous optimization recommendations.
                  </p>
                </motion.div>

                {/* FAQ 6 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#A87C5F]/10 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-[#3A4454] mb-4">
                    Can VisHeart integrate with existing hospital systems?
                  </h3>
                  <p className="text-[#3A4454]/80 leading-relaxed">
                    Yes, VisHeart seamlessly integrates with most PACS, EMR, and hospital information systems through standard DICOM protocols and HL7 interfaces. Our technical team works closely with your IT department to ensure smooth integration.
                  </p>
                </motion.div>
              </div>

              {/* Contact CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <div className="bg-[#3A4454] rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Still have questions?
                  </h3>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Our team of experts is ready to help you understand how VisHeart can transform your cardiac imaging workflow.
                  </p>
                  <button className="px-8 py-4 bg-white text-[#3A4454] rounded-full font-semibold hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center group">
                    Contact Our Team
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        {/* ... other sections from LandingPage.jsx can be added here ... */}
      </main>
      <Footer />
    </>
  );
}