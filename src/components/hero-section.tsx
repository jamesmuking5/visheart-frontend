"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { FaHeartbeat, FaUserMd, FaFileMedical, FaMicroscope } from "react-icons/fa";

const features = [
  {
    icon: <FaHeartbeat />,
    title: "The Challenge",
    description:
      "Advanced cardiac segmentation models exist but operate as standalone systems without user-friendly interfaces. This gap hinders clinical adoption and integration into healthcare workflows, limiting the real-world impact of AI research.",
    details:
      "Current solutions lack interoperability, making it difficult for clinicians to leverage AI insights during patient care. Data privacy and workflow integration remain major hurdles.",
    gradient: "from-red-500 to-pink-500",
  },
  {
    icon: <FaUserMd />,
    title: "Our Solution",
    description:
      "VisHeart bridges this gap with an web-based platform integrating state-of-the-art models into clinical workflows, enabling seamless MRI upload, automated segmentation, and interactive refinement tools for healthcare professionals.",
    details:
      "Our platform supports DICOM uploads, real-time segmentation previews, and collaborative annotation tools. Security and compliance are built-in for clinical use.",
    gradient: "from-green-500 to-teal-500",
  },
];

export function HeroSection() {
  const { ref, inView } = useInView({
    triggerOnce: false, // re-trigger every time section is exposed
    threshold: 0.2,
  });

  return (
    <section
      ref={ref}
      id="hero-intro-section"
      aria-label="Hero introduction"
      className="hero-intro-section relative overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100/40 via-white/10 to-blue-300/30 z-0"
      >
        {/* Floating Medical Icons */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 0.6 } : { y: -30, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute top-10 left-10 text-6xl pointer-events-none select-none"
        >
          <FaHeartbeat className="text-red-500 animate-pulse" />
        </motion.div>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 0.6 } : { y: 30, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="absolute bottom-10 right-10 text-6xl pointer-events-none select-none"
        >
          <FaUserMd className="text-teal-500 animate-pulse" />
        </motion.div>
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 0.5 } : { x: -30, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="absolute top-1/2 left-4 text-5xl pointer-events-none select-none"
        >
          <FaFileMedical className="text-blue-500 animate-pulse" />
        </motion.div>
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 0.5 } : { x: 30, opacity: 0 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="absolute bottom-1/2 right-4 text-5xl pointer-events-none select-none"
        >
          <FaMicroscope className="text-purple-500 animate-pulse" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="hero-content relative z-20 flex flex-col items-center justify-center px-8 py-20">
        <div className="max-w-7xl w-full">
          {/* Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl font-extrabold text-foreground mb-4 drop-shadow-lg">
              {inView && (
                <Typewriter
                  words={["VisHeart: Medical AI for Cardiac Care"]}
                  loop={1}
                  cursor
                  cursorStyle="|"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              )}
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground text-center">
              Empowering clinicians with interactive AI tools for heart health.
            </p>
          </motion.div>

          {/* Interactive Feature Cards */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            viewport={{ once: false }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.3 },
              },
            }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                className="perspective"
              >
                <div
                  className={`relative bg-white/30 dark:bg-card/60 backdrop-blur-xl rounded-3xl p-0 border border-transparent text-center shadow-xl overflow-hidden group transition-transform duration-700`}
                  style={{
                    minHeight: "340px",
                  }}
                >
                  <div className="flex flex-col items-center justify-center p-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={inView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                      transition={{ duration: 0.6, delay: 0.4 + idx * 0.2 }}
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-3xl text-white`}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p
                      className={`text-muted-foreground leading-relaxed text-lg lg:text-xl text-justify`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Learn More Button */}
          <div className="flex justify-center mt-16 mb-0">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all"
              onClick={() => {
                const el = document.getElementById("technical-specs-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .perspective {
          perspective: 1200px;
        }
      `}</style>
    </section>
  );
}