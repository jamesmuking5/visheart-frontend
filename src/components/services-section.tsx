"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Typewriter } from "react-simple-typewriter";
import { useInView } from "react-intersection-observer";

export function ServicesSection() {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

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
    <section
      ref={ref}
      id="services-section"
      aria-label="VisHeart Services"
      className="relative overflow-hidden py-20 min-h-[60vh] scroll-mt-[80px] bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-card dark:to-gray-800"
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h2 className="text-5xl font-extrabold text-foreground mb-4 drop-shadow-lg">
          {inView && (
            <Typewriter
              words={["Our Services"]}
              loop={1}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          )}
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground text-center">
          Comprehensive cardiac MRI analysis solutions powered by state-of-the-art AI models, designed to bridge the gap between research and clinical practice.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            viewport={{ once: false }}
            className="relative bg-white/60 dark:bg-card/70 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-xl p-8 flex flex-col items-center justify-center hover:shadow-2xl transition-all duration-300"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-full flex items-center justify-center mb-4 shadow-lg text-3xl`}>
              <span>{service.icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2 text-center group-hover:text-primary transition-colors duration-300">
              {service.title}
            </h3>
            <p className="text-muted-foreground text-base mb-4 text-center">
              {service.description}
            </p>
            <div className="w-full mb-4">
              <h4 className="font-semibold text-primary mb-2 text-center text-base">
                Key Features
              </h4>
              <ul className="space-y-2">
                {service.features.map((feature, featureIdx) => (
                  <li
                    key={featureIdx}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full inline-block`}></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={service.link}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 font-medium mt-auto"
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
          </motion.div>
        ))}
      </div>
    </section>
  );
}