"use client";

import { motion } from 'framer-motion';

export function AboutUsSection() {
  return (
    <section aria-label="About VisHeart and key benefits" className="about-benefits-section">
      <div id="info-section" className="py-24 bg-gradient-to-br from-background via-muted/50 to-background">
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
              About <span className="text-primary font-semibold">VisHeart</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Pioneering the future of cardiac care through AI-powered medical imaging
            </p>
          </motion.div>

          {/* Main Content - Single Column Layout */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Mission Statement - Slide in from Left */}
              <motion.div
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-2xl font-semibold text-foreground mb-4 flex items-center"
                >
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    viewport={{ once: true }}
                    className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mr-3"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                    </svg>
                  </motion.div>
                  Our Mission
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="text-muted-foreground leading-relaxed"
                >
                  At VisHeart, we believe that every heartbeat matters. Our mission is to revolutionize cardiac diagnosis by providing healthcare professionals with the most advanced AI-powered imaging tools, enabling them to deliver life-saving treatments with unprecedented precision and confidence.
                </motion.p>
              </motion.div>

              {/* Key Benefits - Slide in from Right */}
              <motion.div
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="text-2xl font-semibold text-foreground mb-6 flex items-center"
                >
                  <motion.div 
                    initial={{ scale: 0, rotate: 180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    viewport={{ once: true }}
                    className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center mr-3"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </motion.div>
                  Key Benefits
                </motion.h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "AI-Powered Precision", desc: "Advanced machine learning algorithms deliver 99.7% accuracy in cardiac segmentation" },
                    { title: "Global Collaboration", desc: "Cloud-based platform connects specialists worldwide for seamless consultation" },
                    { title: "Clinical Integration", desc: "Intuitive interface designed specifically for clinical workflows and efficiency" },
                    { title: "Real-Time Processing", desc: "Instant analysis and results to support critical decision-making" }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 1.0 + (index * 0.15),
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      viewport={{ once: true }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                    >
                      <motion.div 
                        initial={{ scale: 0, rotate: -90 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 1.2 + (index * 0.15),

                        }}
                        viewport={{ once: true }}
                        className="w-6 h-6 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </motion.div>
                      <div>
                        <motion.h4 
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 1.3 + (index * 0.15) }}
                          viewport={{ once: true }}
                          className="font-semibold text-foreground mb-1"
                        >
                          {benefit.title}
                        </motion.h4>
                        <motion.p 
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 1.4 + (index * 0.15) }}
                          viewport={{ once: true }}
                          className="text-sm text-muted-foreground"
                        >
                          {benefit.desc}
                        </motion.p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}