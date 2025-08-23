"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Info, Clock, Users, Database, Lock } from "lucide-react";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we handle your information in our university final-year project demonstration.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Information We Collect */}
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-foreground leading-relaxed">This web app may collect basic information such as names, emails, or login credentials for demonstration purposes.</p>
              <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Info className="h-4 w-4" />
                  <span className="font-medium text-sm">Demo Purpose Only</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">All data collection is purely for academic demonstration purposes.</p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Lock className="h-5 w-5 text-green-500" />
                </div>
                2. How We Use Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">The information is used only to demonstrate app functionality as part of a university final-year project.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">We do not sell, share, or use the information for any other purpose.</p>
                </li>
              </ul>
              <div className="bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                <p className="text-sm text-muted-foreground font-medium">🛡️ Your data is strictly for educational demonstration and will never be used commercially.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                3. Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-foreground leading-relaxed">All data will be deleted after the project is completed.</p>
              <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium text-sm">Temporary Storage</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">This is a time-limited academic project. All data has an expiration date.</p>
              </div>
            </CardContent>
          </Card>

          {/* Third Parties */}
          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                4. Third Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-foreground leading-relaxed">We do not share information with any third parties.</p>
              <div className="bg-purple-500/5 p-4 rounded-lg border border-purple-500/20">
                <p className="text-sm text-muted-foreground font-medium">🔒 Zero third-party data sharing. Your information stays within this demonstration environment.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="bg-muted/50 p-6 rounded-xl border">
            <h3 className="font-semibold text-foreground mb-2">Academic Project Notice</h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              This application is developed as part of a final-year university project for educational purposes. It is not intended for commercial use, and all data handling practices are designed
              with privacy and security in mind for demonstration purposes only.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
