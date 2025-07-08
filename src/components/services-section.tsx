"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export function ServicesSection() {
  return (
    <section id="services-section" aria-label="VisHeart Services" className="services-section">
      <div className="py-24 bg-gradient-to-br from-background to-muted">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light mb-6 text-foreground">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              ...
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-64 hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden bg-card backdrop-blur-sm rounded-2xl border border-border shadow-lg">
                {/* Empty container for future pictures */}
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">2D Cardiac Segmentation</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ...
                </p>
                <Link 
                  href="/services/ai-segmentation" 
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 group"
                >
                  <span className="mr-2">Go to 2D Cardiac Segmentation</span>
                  <svg 
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Service 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-64 hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden bg-card backdrop-blur-sm rounded-2xl border border-border shadow-lg">
                {/* Empty container for future pictures */}
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">3D Cardiac Segmentation</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ...
                </p>
                <Link 
                  href="/services/real-time-analysis" 
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 group"
                >
                  <span className="mr-2">Go to 3D Cardiac Segmentation</span>
                  <svg 
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Service 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-64 hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden bg-card backdrop-blur-sm rounded-2xl border border-border shadow-lg">
                {/* Empty container for future pictures */}
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Consultation & Support</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ...
                </p>
                <Link 
                  href="/services/cloud-integration" 
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 group"
                >
                  <span className="mr-2">Go to Consultation & Support</span>
                  <svg 
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}