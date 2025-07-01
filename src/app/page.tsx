"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

            {/* Map Section - remains the same */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card p-4 rounded-xl shadow-lg h-full min-h-[600px] border border-border">
                <div className="w-full h-full rounded-lg overflow-hidden">
                  {/* Google Maps Embed */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6089548267394!2d110.40089737577631!3d1.4059746985999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31fba7190df94e35%3A0x318e978ce8b73b!2sSwinburne%20University%20of%20Technology%20Sarawak%20Campus!5e0!3m2!1sen!2smy!4v1704067200000!5m2!1sen!2smy"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '500px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </div>

              {/* Floating Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="absolute top-8 left-8 bg-card p-4 rounded-lg shadow-xl max-w-xs border border-border"
              >
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-destructive rounded-full mr-2"></div>
                  <span className="text-sm font-semibold text-foreground">VisHeart HQ</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leading cardiac imaging innovation center
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}