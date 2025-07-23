"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function QuickStatsSection() {
  // Add dropdown state
  const [showComponents, setShowComponents] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showSegTypes, setShowSegTypes] = useState(false);

  // Cardiac components data
  const cardiacComponents = [
    { abbr: "LVC", name: "Left Ventricle Cavity", color: "text-red-500" },
    { abbr: "MYO", name: "Myocardium", color: "text-green-500" },
    { abbr: "RV", name: "Right Ventricle", color: "text-blue-500" }
  ];

  // AI models data
  const aiModels = [
    { abbr: "YOLOv11" },
    { abbr: "MedSAM" }
  ];

  // Segmentation types data
  const segmentationTypes = [
    { abbr: "2D Segmentation" },
    { abbr: "3D Segmentation" }
  ];

  return (
    <section
      id="quick-stats-section"
      aria-label="Quick stats"
      className="relative overflow-hidden py-20 min-h-[90vh] scroll-mt-[80px]"
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl font-extrabold text-foreground mb-4 drop-shadow-lg">
          Quick Stats
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground text-center">
          Explore VisHeart's medical capabilities at a glance.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {/* Cardiac Components with Dropdown */}
        <div
          className="text-center relative group"
          onMouseEnter={() => setShowComponents(true)}
          onMouseLeave={() => setShowComponents(false)}
        >
          <div className="w-full flex flex-col items-center justify-center bg-white/40 dark:bg-card/60 backdrop-blur-xl rounded-3xl border border-transparent shadow-xl py-8 px-4 transition-all duration-300 hover:shadow-2xl">
            <div className="text-4xl font-bold text-primary mb-2">3</div>
            <div className="text-base font-semibold text-muted-foreground flex items-center justify-center mb-1">
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
          </div>
          {showComponents && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-6 py-4 z-20 min-w-[320px]">
              <div className="flex flex-row items-start justify-center gap-8">
                {cardiacComponents.map((comp) => (
                  <div key={comp.abbr} className="flex flex-col items-center">
                    <span className={`font-bold text-lg ${comp.color}`}>{comp.abbr}</span>
                    <span className="text-xs text-muted-foreground mt-1 text-center">{comp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Models Integrated with Dropdown */}
        <div
          className="text-center relative group"
          onMouseEnter={() => setShowModels(true)}
          onMouseLeave={() => setShowModels(false)}
        >
          <div className="w-full flex flex-col items-center justify-center bg-white/40 dark:bg-card/60 backdrop-blur-xl rounded-3xl border border-transparent shadow-xl py-8 px-4 transition-all duration-300 hover:shadow-2xl">
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <div className="text-base font-semibold text-muted-foreground flex items-center justify-center mb-1">
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
          </div>
          {showModels && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-6 py-4 z-20 min-w-[220px]">
              <div className="flex flex-row items-start justify-center gap-8">
                {aiModels.map((model) => (
                  <div key={model.abbr} className="flex flex-col items-center">
                    <span className="font-bold text-lg text-primary">{model.abbr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Segmentation Types with Dropdown */}
        <div
          className="text-center relative group"
          onMouseEnter={() => setShowSegTypes(true)}
          onMouseLeave={() => setShowSegTypes(false)}
        >
          <div className="w-full flex flex-col items-center justify-center bg-white/40 dark:bg-card/60 backdrop-blur-xl rounded-3xl border border-transparent shadow-xl py-8 px-4 transition-all duration-300 hover:shadow-2xl">
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <div className="text-base font-semibold text-muted-foreground flex items-center justify-center mb-1">
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
          </div>
          {showSegTypes && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-6 py-4 z-20 min-w-[220px]">
              <div className="flex flex-row items-start justify-center gap-8">
                {segmentationTypes.map((type) => (
                  <div key={type.abbr} className="flex flex-col items-center">
                    <span className="font-bold text-lg text-primary">{type.abbr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}