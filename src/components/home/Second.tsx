import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Heart, Zap, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SecondSectionProps {
  className?: string;
}

export default function SecondSection({ className = '' }: SecondSectionProps) {
  return (
    <section className={cn("py-24 bg-muted/30", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-primary mr-4" />
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              AI-Powered Cardiac Segmentation
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our cutting-edge platform combines the power of YOLOv11 object detection with MedSAM medical segmentation 
              to deliver unprecedented accuracy in cardiac imaging analysis.
            </p>
          </div>

          {/* AI Models Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* YOLOv11 Card */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">YOLOv11</CardTitle>
                      <CardDescription>Real-time Object Detection</CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  The latest iteration of the YOLO architecture provides lightning-fast cardiac structure detection 
                  with enhanced accuracy. Perfect for real-time analysis and initial region identification.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Ultra-fast inference speed</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Improved accuracy over YOLOv10</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Optimized for medical imaging</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="https://docs.ultralytics.com/models/yolo11/" target="_blank" rel="noopener noreferrer">
                    Learn More About YOLOv11
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* MedSAM Card */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">MedSAM</CardTitle>
                      <CardDescription>Medical Segment Anything</CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  A specialized adaptation of Meta's Segment Anything Model for medical imaging. 
                  Provides precise pixel-level segmentation for detailed cardiac structure analysis.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Medical imaging specialized</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Pixel-perfect segmentation</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Prompt-based interaction</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="https://github.com/bowang-lab/MedSAM" target="_blank" rel="noopener noreferrer">
                    Explore MedSAM Repository
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Combined Workflow */}
          <div className="bg-card rounded-xl p-8 border">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Combined AI Workflow
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Detection</h4>
                <p className="text-sm text-muted-foreground">
                  YOLOv11 rapidly identifies cardiac structures and regions of interest
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Segmentation</h4>
                <p className="text-sm text-muted-foreground">
                  MedSAM provides precise pixel-level segmentation of detected regions
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced metrics and insights extracted from segmented cardiac structures
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
