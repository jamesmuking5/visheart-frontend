"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export function ServicesSection() {
  // Service data based on your FYP objectives
  const services = [
    {
      id: 1,
      title: "2D Cardiac Segmentation",
      description: "Slice-by-slice analysis of cardiac MRI images with AI-powered detection and segmentation of LVC, MYO, and RV components using YOLOv11 and MedSAM models.",
      features: [
        "DICOM & NifTI format support",
        "YOLOv11 object detection",
        "MedSAM precise segmentation",
        "Interactive ROI refinement"
      ],
      link: "/services/ai-segmentation",
      linkText: "Go to 2D Cardiac Segmentation",
      icon: "🫀",
      gradient: "from-red-500 to-pink-500"
    },
    {
      id: 2,
      title: "3D Cardiac Reconstruction",
      description: "Advanced 3D modeling and visualization from 2D segmentation results, enabling comprehensive cardiac analysis and motion tracking capabilities.",
      features: [
        "3D volume reconstruction",
        "Multi-slice integration",
        "Cardiac motion estimation",
        "Disease classification support"
      ],
      link: "/services/real-time-analysis",
      linkText: "Go to 3D Cardiac Reconstruction",
      icon: "🏗️",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      title: "Clinical Integration & Support",
      description: "Comprehensive support for healthcare professionals with secure data handling, anonymization, and seamless integration into clinical workflows.",
      features: [
        "Patient data anonymization",
        "Clinical workflow integration",
        "Secure cloud processing",
        "Expert consultation support"
      ],
      link: "/services/cloud-integration",
      linkText: "Go to Clinical Support",
      icon: "🏥",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section id="services-section" aria-label="VisHeart Services" className="services-section">
      <div className="py-24 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-foreground">
              Our <span className="text-primary font-semibold">Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Comprehensive cardiac MRI analysis solutions powered by state-of-the-art AI models, 
              designed to bridge the gap between research and clinical practice.
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * (index + 1) }}
                viewport={{ once: true }}
                className="group"
              >
                {/* Service Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-card/50 backdrop-blur-sm rounded-2xl border border-border shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header with Icon */}
                  <div className={`h-48 bg-gradient-to-br ${service.gradient} p-8 flex items-center justify-center relative overflow-hidden`}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="text-6xl filter drop-shadow-lg"
                    >
                      {service.icon}
                    </motion.div>
                    {/* Animated background patterns */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 rounded-full"></div>
                      <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/10 rounded-full"></div>
                      <div className="absolute top-1/2 right-8 w-8 h-8 bg-white/15 rounded-full"></div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                      {service.description}
                    </p>

                    {/* Key Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-foreground mb-3">Key Features:</h4>
                      <div className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) + (featureIndex * 0.05), duration: 0.3 }}
                            viewport={{ once: true }}
                            className="flex items-center space-x-2"
                          >
                            <div className={`w-1.5 h-1.5 bg-gradient-to-r ${service.gradient} rounded-full`}></div>
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Link */}
                    <Link 
                      href={service.link}
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 group/link font-medium"
                    >
                      <span className="mr-2 text-sm">{service.linkText}</span>
                      <motion.svg 
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </motion.svg>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}