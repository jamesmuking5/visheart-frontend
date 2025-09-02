"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";

interface FirstSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export default function FirstSection({
  title = "Welcome to VisHeart",
  subtitle = "Advanced Cardiac Segmentation Platform",
  description = "Revolutionizing cardiac imaging analysis with cutting-edge AI technology for precise heart segmentation and medical insights.",
  className = "",
}: FirstSectionProps) {
  return (
    <section className={cn("min-h-screen flex items-start justify-center pt-30 bg-muted-background relative", className)}>
      <AnimatedBackground />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div className="text-center max-w-4xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, staggerChildren: 0.3, delayChildren: 0.2 }}>
          {/* Main Title */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl font-medium text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {subtitle}
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {description}
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Button size="lg" className="text-base">
                  Get Started
                </Button>
              </motion.div>
            </Link>
            <Link href="/doc">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Button variant="outline" size="lg" className="text-base">
                  Learn More
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Optional Feature Highlights */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1 }}>
            <motion.div className="text-center" whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
              <motion.div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <CheckCircle className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Precise Analysis</h3>
              <p className="text-muted-foreground">Advanced AI algorithms for accurate cardiac segmentation</p>
            </motion.div>

            <motion.div className="text-center" whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
              <motion.div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Zap className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Fast Processing</h3>
              <p className="text-muted-foreground">Real-time segmentation with optimized performance</p>
            </motion.div>

            <motion.div className="text-center" whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
              <motion.div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Settings className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Easy Integration</h3>
              <p className="text-muted-foreground">Seamless workflow integration for medical professionals</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
