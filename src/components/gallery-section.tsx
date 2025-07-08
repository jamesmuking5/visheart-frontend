"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GallerySection() {
  return (
    <section id="gallery-section" aria-label="VisHeart Gallery" className="gallery-section">
        <div className="py-24 px-8 bg-gradient-to-br from-background to-muted">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
                >
                <h2 className="text-4xl font-light mb-6 text-foreground">
                    Gallery
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Explore our advanced cardiac imaging capabilities and see how VisHeart transforms medical visualization for better patient outcomes.
                </p>
                </motion.div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Gallery Item 1 - Cardiac MRI Segmentation */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                >
                    <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                        <div className="relative h-48 overflow-hidden">
                        <Image
                            src="/image-1.png"
                            alt="Cardiac MRI Segmentation"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute top-4 right-4">
                        <CardAction>
                            <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-primary/20 backdrop-blur-sm p-2 rounded-full border border-primary/30 hover:bg-primary/30 transition-all duration-300"
                            >
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                            </svg>
                            </motion.button>
                        </CardAction>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        Cardiac MRI Segmentation
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                        Advanced AI-powered segmentation of cardiac structures from MRI imaging with unprecedented precision and accuracy.
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all duration-300"
                        >
                        View Details
                        </motion.button>
                    </CardFooter>
                    </Card>
                </motion.div>

                {/* Gallery Item 2 - High-Resolution Imaging */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="group"
                >
                    <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                        <div className="relative h-48 overflow-hidden">
                        <Image
                            src="/image-2.png"
                            alt="High-Resolution Cardiac Imaging"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute top-4 right-4">
                        <CardAction>
                            <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-secondary/20 backdrop-blur-sm p-2 rounded-full border border-secondary/30 hover:bg-secondary/30 transition-all duration-300"
                            >
                            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                            </svg>
                            </motion.button>
                        </CardAction>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        High-Resolution Imaging
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                        Crystal-clear cardiac visualization with enhanced detail and precision for superior diagnostic capabilities.
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all duration-300"
                        >
                        View Details
                        </motion.button>
                    </CardFooter>
                    </Card>
                </motion.div>

                {/* Gallery Item 3 - Specialist Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="group"
                >
                    <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative p-0">
                        <div className="relative h-48 overflow-hidden">
                        <Image
                            src="/image-3.png"
                            alt="Doctor Interface"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute top-4 right-4">
                        <CardAction>
                            <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-accent/20 backdrop-blur-sm p-2 rounded-full border border-accent/30 hover:bg-accent/30 transition-all duration-300"
                            >
                            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                            </svg>
                            </motion.button>
                        </CardAction>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                        Specialist Interface
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                        Intuitive user interface designed specifically for medical professionals with streamlined workflows.
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all duration-300"
                        >
                        View Details
                        </motion.button>
                    </CardFooter>
                    </Card>
                </motion.div>

                {/* Gallery Item 4 - AI-Powered Analytics (Large Card) */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="md:col-span-2 group"
                >
                    <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                        <div className="absolute top-4 right-4">
                        <CardAction>
                            <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-primary/20 backdrop-blur-sm p-2 rounded-full border border-primary/30 hover:bg-primary/30 transition-all duration-300"
                            >
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                            </svg>
                            </motion.button>
                        </CardAction>
                        </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 min-h-[300px]">
                        <div className="text-center">
                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <CardTitle className="text-2xl font-semibold text-foreground mb-4">
                            AI-Powered Analytics
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                            Advanced machine learning algorithms provide real-time cardiac analysis and diagnostic support for enhanced clinical decision-making.
                        </CardDescription>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6">
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium"
                        >
                        Explore AI Features
                        </motion.button>
                    </CardFooter>
                    </Card>
                </motion.div>

                {/* Gallery Item 5 - Cloud Integration */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="group"
                >
                    <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                        <div className="absolute top-4 right-4">
                        <CardAction>
                            <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-secondary/20 backdrop-blur-sm p-2 rounded-full border border-secondary/30 hover:bg-secondary/30 transition-all duration-300"
                            >
                            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                            </svg>
                            </motion.button>
                        </CardAction>
                        </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-secondary/30 to-primary/30 min-h-[200px]">
                        <div className="text-center">
                        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                            Cloud Integration
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                            Seamless cloud-based collaboration platform
                        </CardDescription>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6">
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all duration-300"
                        >
                        Learn More
                        </motion.button>
                    </CardFooter>
                    </Card>
                </motion.div>

                {/* Gallery Item 6 - Real-time Processing */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="group"
                >
                    <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                        <div className="absolute top-4 right-4">
                        <CardAction>
                            <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-accent/20 backdrop-blur-sm p-2 rounded-full border border-accent/30 hover:bg-accent/30 transition-all duration-300"
                            >
                            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                            </svg>
                            </motion.button>
                        </CardAction>
                        </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-accent/30 to-secondary/30 min-h-[200px]">
                        <div className="text-center">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                            Real-time Processing
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                            Instant analysis and diagnostic insights
                        </CardDescription>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6">
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all duration-300"
                        >
                        Learn More
                        </motion.button>
                    </CardFooter>
                    </Card>
                </motion.div>

                {/* Gallery Item 7 - Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    viewport={{ once: true }}
                    className="md:col-span-2 lg:col-span-1 group"
                >
                    <Card className="h-full hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="relative">
                        <div className="absolute top-4 right-4">
                        <CardAction>
                            <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-destructive/20 backdrop-blur-sm p-2 rounded-full border border-destructive/30 hover:bg-destructive/30 transition-all duration-300"
                            >
                            <svg className="w-4 h-4 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                            </svg>
                            </motion.button>
                        </CardAction>
                        </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 bg-gradient-to-br from-destructive/20 to-primary/20 min-h-[250px]">
                        <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold text-foreground mb-2"
                        >
                            95%+
                        </motion.div>
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                            Accuracy Rate
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                            Clinically validated precision in cardiac segmentation
                        </CardDescription>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6">
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 text-sm bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all duration-300"
                        >
                        View Statistics
                        </motion.button>
                    </CardFooter>
                    </Card>
                </motion.div>
                </div>

                {/* Gallery CTA */}
                <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-center mt-16"
                >
                <Card className="p-8">
                    <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold text-foreground mb-4">
                        See VisHeart in Action
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Experience the future of cardiac imaging with our interactive demo. Discover how VisHeart can transform your medical practice.
                    </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 inline-flex items-center justify-center group"
                    >
                        Schedule Demo
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 inline-flex items-center justify-center group"
                    >
                        View Documentation
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </motion.button>
                    </CardFooter>
                </Card>
                </motion.div>
            </div>
        </div>
    </section>
  );
}