"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeartbeat, FaBrain, FaMicroscope } from "react-icons/fa";
import { MdSegment, Md3dRotation } from "react-icons/md";

export function QuickStatsSection() {
  const [showComponents, setShowComponents] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showSegTypes, setShowSegTypes] = useState(false);

  // Cardiac components data
  const cardiacComponents = [
    {
      abbr: "LVC",
      name: "Left Ventricle Cavity",
      color: "text-red-500",
      icon: <FaHeartbeat className="text-2xl text-red-400" />,
      desc: "Main pumping chamber of the heart."
    },
    {
      abbr: "MYO",
      name: "Myocardium",
      color: "text-green-500",
      icon: <FaBrain className="text-2xl text-green-400" />,
      desc: "Muscular tissue of the heart."
    },
    {
      abbr: "RV",
      name: "Right Ventricle",
      color: "text-blue-500",
      icon: <FaHeartbeat className="text-2xl text-blue-400" />,
      desc: "Pumps blood to the lungs."
    }
  ];

  // AI models data
  const aiModels = [
    {
      abbr: "YOLOv11",
      icon: <FaMicroscope className="text-xl text-primary" />,
      desc: "Real-time object detection for medical imaging."
    },
    {
      abbr: "MedSAM",
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

  return (
    <section
      id="quick-stats-section"
      aria-label="Quick stats"
      className="relative overflow-hidden py-20 min-h-[90vh] scroll-mt-[80px] bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-card dark:to-gray-800"
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl font-extrabold text-foreground mb-4 drop-shadow-lg flex items-center justify-center gap-2">
          <FaHeartbeat className="text-pink-500 animate-pulse" />
          Quick Stats
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground text-center">
          Explore <span className="font-bold text-primary">VisHeart</span>'s medical capabilities at a glance.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
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
                className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-6 py-4 z-20 min-w-[320px]"
              >
                <div className="flex flex-row items-start justify-center gap-8">
                  {cardiacComponents.map((comp) => (
                    <div key={comp.abbr} className="flex flex-col items-center group">
                      {comp.icon}
                      <span className={`font-bold text-lg ${comp.color}`}>{comp.abbr}</span>
                      <span className="text-xs text-muted-foreground mt-1 text-center">{comp.name}</span>
                      <span className="text-[10px] text-gray-400 mt-1 group-hover:text-primary transition">{comp.desc}</span>
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
                className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-6 py-4 z-20 min-w-[220px]"
              >
                <div className="flex flex-row items-start justify-center gap-8">
                  {aiModels.map((model) => (
                    <div key={model.abbr} className="flex flex-col items-center group">
                      {model.icon}
                      <span className="font-bold text-lg text-primary">{model.abbr}</span>
                      <span className="text-[10px] text-gray-400 mt-1 group-hover:text-primary transition">{model.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Segmentation Types */}
        <div
          className="text-center relative group"
          onMouseEnter={() => setShowSegTypes(true)}
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
                className={`w-5 h-5 mx-auto transition-transform duration-200 ${showSegTypes ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
          <AnimatePresence>
            {showSegTypes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-6 py-4 z-20 min-w-[220px]"
              >
                <div className="flex flex-row items-start justify-center gap-8">
                  {segmentationTypes.map((type) => (
                    <div key={type.abbr} className="flex flex-col items-center group">
                      {type.icon}
                      <span className="font-bold text-lg text-primary">{type.abbr}</span>
                      <span className="text-[10px] text-gray-400 mt-1 group-hover:text-primary transition">{type.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}