import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    <section className={cn("min-h-screen flex items-center justify-center bg-muted-background", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">{title}</h1>

          {/* Subtitle */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-muted-foreground mb-8">{subtitle}</h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">{description}</p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-base">
                Get Started
              </Button>
            </Link>
            <Link href="/doc">
              <Button variant="outline" size="lg" className="text-base">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Optional Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Precise Analysis</h3>
              <p className="text-muted-foreground">Advanced AI algorithms for accurate cardiac segmentation</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Fast Processing</h3>
              <p className="text-muted-foreground">Real-time segmentation with optimized performance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Easy Integration</h3>
              <p className="text-muted-foreground">Seamless workflow integration for medical professionals</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
