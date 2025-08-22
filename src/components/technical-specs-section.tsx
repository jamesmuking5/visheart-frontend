"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeartbeat, FaBrain, FaMicroscope, FaFolderOpen } from "react-icons/fa";
import { MdSegment, Md3dRotation } from "react-icons/md";
import { Typewriter } from "react-simple-typewriter";
import { useInView } from "react-intersection-observer"

export function TechnicalSpecsSection() {
  const { ref, inView } = useInView({
    triggerOnce: false, // re-trigger every time section is exposed
    threshold: 0.2,
  });
  
  const [showComponents, setShowComponents] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showSegTypes, setShowSegTypes] = useState<string | boolean>(false);

// Supported formats data
  const supportedFormats = [
    {
      abbr: (
        <a
          href="https://en.wikipedia.org/wiki/DICOM"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-700 hover:text-blue-900 transition"
        >
          DICOM
        </a>
      ),
      icon: <FaFolderOpen className="text-xl text-primary" />,
      desc: "Standard medical imaging format (.dcm)"
    },
    {
      abbr: (
        <a
          href="https://en.wikipedia.org/wiki/Neuroimaging_Informatics_Technology_Initiative"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-700 hover:text-blue-900 transition"
        >
          NifTI
        </a>
      ),
      icon: <FaFolderOpen className="text-xl text-primary" />,
      desc: "Neuroimaging format (.nii, .nii.gz)"
    }
  ];

  // Cardiac components data
  const cardiacComponents = [
    {
      abbr: "LVC",
      name: "Left Ventricle Cavity",
      color: "text-red-500",
      icon: <FaHeartbeat className="text-2xl text-red-400" />,
    },
    {
      abbr: "MYO",
      name: "Myocardium",
      color: "text-green-500",
      icon: <FaBrain className="text-2xl text-green-400" />,
    },
    {
      abbr: "RV",
      name: "Right Ventricle",
      color: "text-blue-500",
      icon: <FaHeartbeat className="text-2xl text-blue-400" />,
    }
  ];

  // AI models data
  const aiModels = [
    {
      abbr: (
        <a
          href="https://docs.ultralytics.com/models/yolo11/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-700 hover:text-blue-900 transition"
        >
          YOLOv11
        </a>
      ),
      icon: <FaMicroscope className="text-xl text-primary" />,
      desc: "Real-time object detection for medical imaging."
    },
    {
      abbr: (
        <a
          href="https://github.com/bowang-lab/MedSAM"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-700 hover:text-green-900 transition"
        >
          MedSAM
        </a>
      ),
      icon: <FaBrain className="text-xl text-primary" />,
      desc: "Medical image segmentation using SAM."
    }
  ];

  // Segmentation types data
  const segmentationTypes = [
    {
      abbr: "2D Segmentation",
      icon: <MdSegment className="text-xl text-primary" />,
      desc: "Slice-by-slice image analysis."
    },
    {
      abbr: "3D Segmentation",
      icon: <Md3dRotation className="text-xl text-primary" />,
      desc: "Volumetric analysis for deeper insights."
    }
  ];

  // Platform features (copied from AboutUsSection)
  const systemFeatures = [
    { title: "Industry-Standard Framework", desc: "Built with MERN stack for scalability and reliability" },
    { title: "Python Integration", desc: "Seamless integration with AI models and medical imaging libraries" },
    { title: "Responsive Design", desc: "Optimized for various devices and screen sizes" },
    { title: "User-Centric Interface", desc: "Non-cluttered UI designed specifically for medical professionals" },
    { title: "Data Security", desc: "Comprehensive patient anonymity and secure data handling" },
    { title: "Account Management", desc: "Optional user accounts with secure data storage and deletion" },
    { title: "GPU-Accelerated AI", desc: "Utilizes a dedicated Cloud GPU server for accelerated AI model inferencing and analysis" },
    { title: "Scalable Cloud Deployment", desc: "Hosted on Amazon Web Services (AWS) for a secure, reliable, and scalable infrastructure" }
  ];

  return (
    <section
      ref={ref}
      id="technical-specs-section"
      aria-label="Technical Specifications"
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
              words={["Technical Specifications"]}
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
          Explore <span className="font-bold text-primary">VisHeart</span>'s medical capabilities at a glance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 max-w-6xl mx-auto">
        {/* Cardiac Components */}
        <div
          className="text-center relative group"
          onMouseEnter={() => setShowComponents(true)}
          onMouseLeave={() => setShowComponents(false)}
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            className="w-full flex flex-col items-center justify-center bg-white/60 dark:bg-card/70 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-xl py-8 px-4 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="text-4xl font-bold text-primary mb-2">3</div>
            <div className="text-base font-semibold text-muted-foreground flex items-center justify-center mb-1 gap-2">
              <FaHeartbeat className="text-red-400" />
              Cardiac Components
            </div>
            <div className="flex justify-center w-full mt-1">
              <svg
                className={`w-5 h-5 mx-auto transition-transform duration-200 ${showComponents ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
          <AnimatePresence>
            {showComponents && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-8 py-3 z-20 min-w-[340px] max-w-[440px]" // slightly shorter width
              >
                <div className="flex flex-row items-start justify-center gap-8">
                  {cardiacComponents.map((comp) => (
                    <div key={comp.abbr} className="flex flex-col items-center group">
                      {/* {comp.icon} */}
                      <span className={`font-bold text-lg ${comp.color}`}>{comp.abbr}</span>
                      <span className="text-base text-gray-400 mt-1 group-hover:text-primary transition text-center">{comp.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Models Integrated */}
        <div
          className="text-center relative group"
          onMouseEnter={() => setShowModels(true)}
          onMouseLeave={() => setShowModels(false)}
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            className="w-full flex flex-col items-center justify-center bg-white/60 dark:bg-card/70 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-xl py-8 px-4 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <div className="text-base font-semibold text-muted-foreground flex items-center justify-center mb-1 gap-2">
              <FaMicroscope className="text-blue-400" />
              AI Models Integrated
            </div>
            <div className="flex justify-center w-full mt-1">
              <svg
                className={`w-5 h-5 mx-auto transition-transform duration-200 ${showModels ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
          <AnimatePresence>
            {showModels && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-8 py-3 z-20 min-w-[340px] max-w-[440px]" // slightly shorter width
              >
                <div className="flex flex-row items-start justify-center gap-8">
                  {aiModels.map((model) => (
                    <div key={typeof model.abbr === "string" ? model.abbr : "ai-model"} className="flex flex-col items-center group">
                      {/* {model.icon} */}
                      <span className="font-bold text-lg text-primary">{model.abbr}</span>
                      <span className="text-base text-gray-400 mt-1 group-hover:text-primary transition">{model.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Supported Formats (moved before Segmentation Types) */}
        <div
          className="text-center relative group"
          onMouseEnter={() => setShowSegTypes("formats")}
          onMouseLeave={() => setShowSegTypes(false)}
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            className="w-full flex flex-col items-center justify-center bg-white/60 dark:bg-card/70 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-xl py-8 px-4 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <div className="text-base font-semibold text-muted-foreground flex items-center justify-center mb-1 gap-2">
              <FaFolderOpen className="text-yellow-500" />
              Supported Formats
            </div>
            <div className="flex justify-center w-full mt-1">
              <svg
                className={`w-5 h-5 mx-auto transition-transform duration-200 ${showSegTypes === "formats" ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
          <AnimatePresence>
            {showSegTypes === "formats" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-8 py-3 z-20 min-w-[340px] max-w-[440px]" // slightly shorter width
              >
                <div className="flex flex-row items-start justify-center gap-8">
                  {supportedFormats.map((format) => (
                    <div key={format.abbr} className="flex flex-col items-center group">
                      {/* {format.icon} */}
                      <span className="font-bold text-lg text-primary">{format.abbr}</span>
                      <span className="text-base text-gray-400 mt-1 group-hover:text-primary transition">{format.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Segmentation Types (moved after Supported Formats) */}
        <div
          className="text-center relative group"
          onMouseEnter={() => setShowSegTypes("segmentation")}
          onMouseLeave={() => setShowSegTypes(false)}
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            className="w-full flex flex-col items-center justify-center bg-white/60 dark:bg-card/70 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-xl py-8 px-4 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <div className="text-base font-semibold text-muted-foreground flex items-center justify-center mb-1 gap-2">
              <MdSegment className="text-purple-400" />
              Segmentation Types
            </div>
            <div className="flex justify-center w-full mt-1">
              <svg
                className={`w-5 h-5 mx-auto transition-transform duration-200 ${showSegTypes === "segmentation" ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
          <AnimatePresence>
            {showSegTypes === "segmentation" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-8 py-3 z-20 min-w-[340px] max-w-[440px]" // slightly shorter width
              >
                <div className="flex flex-row items-start justify-center gap-8">
                  {segmentationTypes.map((type) => (
                    <div key={type.abbr} className="flex flex-col items-center group">
                      {/* {type.icon} */}
                      <span className="font-bold text-lg text-primary">{type.abbr}</span>
                      <span className="text-base text-gray-400 mt-1 group-hover:text-primary transition">{type.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center w-full">
                  <span className="text-sm text-muted-foreground font-medium">
                    Both support automated and manual processing.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add more vertical spacing before platform features */}
      <div className="h-36" /> {/* Increased spacing above platform features */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        viewport={{ once: false }}
        className="max-w-5xl mx-auto mb-16"
      >
        <h3 className="text-5xl font-extrabold text-foreground mb-8 drop-shadow-lg text-center">
          {inView && (
            <Typewriter
              words={["Platform Features"]}
              loop={1}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {systemFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7 + (index * 0.1), duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, x: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
              className="flex items-start space-x-5 p-6 rounded-2xl bg-white/80 dark:bg-card/80 border-2 border-primary/30 shadow-lg hover:bg-primary/5 transition-all duration-300"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8 + (index * 0.1), duration: 0.3 }}
                viewport={{ once: true }}
                className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md"
              >
                {/* Smaller check icon */}
                <svg className="w-4 h-4 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </motion.div>
              <div>
                <motion.h4 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + (index * 0.1), duration: 0.3 }}
                  viewport={{ once: true }}
                  className="font-extrabold text-2xl text-primary mb-2"
                >
                  {feature.title}
                </motion.h4>
                <motion.p 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + (index * 0.1), duration: 0.3 }}
                  viewport={{ once: true }}
                  className="text-lg text-muted-foreground leading-relaxed"
                >
                  {feature.desc}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}