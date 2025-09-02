"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Heart, Zap, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SecondSectionProps {
  className?: string;
}

export default function SecondSection({ className = '' }: SecondSectionProps) {
  return (
    <section className={cn("py-24 bg-muted/30", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="flex items-center justify-center mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mr-4"
              >
                <Heart className="w-12 h-12 text-primary" />
              </motion.div>
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <Brain className="w-12 h-12 text-primary" />
              </motion.div>
            </motion.div>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              AI-Powered Cardiac Segmentation
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Our cutting-edge platform combines the power of YOLOv11 object detection with MedSAM medical segmentation 
              to deliver unprecedented accuracy in cardiac imaging analysis.
            </motion.p>
          </motion.div>

          {/* AI Models Cards */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* YOLOv11 Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div 
                        className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Zap className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl">YOLOv11</CardTitle>
                        <CardDescription>Real-time Object Detection</CardDescription>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    The latest iteration of the YOLO architecture provides lightning-fast cardiac structure detection 
                    with enhanced accuracy. Perfect for real-time analysis and initial region identification.
                  </p>
                  <div className="space-y-3 mb-6">
                    <motion.div 
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span>Ultra-fast inference speed</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span>Improved accuracy over YOLOv10</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span>Optimized for medical imaging</span>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="https://docs.ultralytics.com/models/yolo11/" target="_blank" rel="noopener noreferrer">
                        Learn More About YOLOv11
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* MedSAM Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div 
                        className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Brain className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl">MedSAM</CardTitle>
                        <CardDescription>Medical Segment Anything</CardDescription>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    A specialized adaptation of Meta&apos;s Segment Anything Model for medical imaging. 
                    Provides precise pixel-level segmentation for detailed cardiac structure analysis.
                  </p>
                  <div className="space-y-3 mb-6">
                    <motion.div 
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span>Medical imaging specialized</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span>Pixel-perfect segmentation</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span>Prompt-based interaction</span>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="https://github.com/bowang-lab/MedSAM" target="_blank" rel="noopener noreferrer">
                        Explore MedSAM Repository
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Combined Workflow */}
          <motion.div 
            className="bg-card rounded-xl p-8 border"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.h3 
              className="text-2xl font-semibold text-foreground mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Combined AI Workflow
            </motion.h3>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-2xl font-bold text-primary">1</span>
                </motion.div>
                <h4 className="font-semibold text-foreground mb-2">Detection</h4>
                <p className="text-sm text-muted-foreground">
                  YOLOv11 rapidly identifies cardiac structures and regions of interest
                </p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-2xl font-bold text-primary">2</span>
                </motion.div>
                <h4 className="font-semibold text-foreground mb-2">Segmentation</h4>
                <p className="text-sm text-muted-foreground">
                  MedSAM provides precise pixel-level segmentation of detected regions
                </p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-2xl font-bold text-primary">3</span>
                </motion.div>
                <h4 className="font-semibold text-foreground mb-2">Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced metrics and insights extracted from segmented cardiac structures
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
