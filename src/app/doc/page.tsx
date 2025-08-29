"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Zap, Info, Users, Play } from "lucide-react";

const DocPage = () => {
  return (
    <div className="flex h-screen">
      <Tabs defaultValue="introduction" orientation="vertical" className="w-full flex flex-row">
        {/* Navigation Sidebar */}
        <div className="w-80 border-r bg-muted/30 flex flex-col flex-shrink-0">
          <div className="p-6 border-b">
            <h2 className="font-semibold text-lg">Documentation</h2>
            <p className="text-sm text-muted-foreground">VisHeart Platform Guide</p>
          </div>
          <ScrollArea className="flex-1">
            <TabsList className="flex flex-col h-auto w-full bg-transparent p-4 space-y-1 items-stretch">
              <TabsTrigger value="introduction" className="w-full justify-start text-left h-auto py-2 px-3 data-[state=active]:bg-secondary">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Introduction</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="getting-started" className="w-full justify-start text-left h-auto py-2 px-3 data-[state=active]:bg-secondary">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Getting Started</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="w-full justify-start text-left h-auto py-2 px-3 data-[state=active]:bg-secondary">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Accounts</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="how-it-works" className="w-full justify-start text-left h-auto py-2 px-3 data-[state=active]:bg-secondary">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">How It Works</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabsContent value="introduction" className="flex-1 m-0 h-full">
            <ScrollArea className="h-full w-full">
              <div className="p-8 w-full">
                <div className="space-y-6 max-w-none">
                  <div>
                    <h1 className="text-3xl font-bold mb-4">Introduction to VisHeart</h1>
                    <p className="text-muted-foreground mb-6">
                      VisHeart is a cutting-edge cardiac segmentation platform designed to revolutionize medical image analysis through advanced artificial intelligence and intuitive user interfaces.
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        About VisHeart
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Our platform combines state-of-the-art deep learning algorithms with user-friendly visualization tools to provide accurate cardiac structure segmentation from medical imaging
                        data.
                      </p>
                      <div className="grid gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">AI</div>
                          <div>
                            <h4 className="font-semibold">AI-Powered Analysis</h4>
                            <p className="text-sm text-muted-foreground">Advanced neural networks trained on extensive cardiac imaging datasets.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">3D</div>
                          <div>
                            <h4 className="font-semibold">
                              3D Visualization{" "}
                              <Badge variant="outline" className="ml-2">
                                Upcoming
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground">Interactive 3D rendering of cardiac structures for comprehensive analysis.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">⚡</div>
                          <div>
                            <h4 className="font-semibold">Fast Processing</h4>
                            <p className="text-sm text-muted-foreground">Efficient algorithms that deliver results in minutes, not hours.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Key Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• Automated cardiac segmentation</li>
                          <li>
                            • Real-time 3D visualization{" "}
                            <Badge variant="outline" className="ml-2">
                              Upcoming
                            </Badge>
                          </li>
                          <li>• Multi-format support</li>
                          <li>• Cloud-based processing</li>
                          <li>• Export capabilities</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Target Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• Cardiologists</li>
                          <li>• Radiologists</li>
                          <li>• Medical researchers</li>
                          <li>• Clinical technicians</li>
                          <li>• Healthcare institutions</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Use Cases</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• Diagnostic imaging</li>
                          <li>• Treatment planning</li>
                          <li>• Research studies</li>
                          <li>• Education & training</li>
                          <li>• Clinical trials</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="getting-started" className="flex-1 m-0 h-full">
            <ScrollArea className="h-full w-full">
              <div className="p-8 w-full">
                <div className="space-y-6 max-w-none">
                  <div>
                    <h1 className="text-3xl font-bold mb-4">Getting Started with VisHeart</h1>
                    <p className="text-muted-foreground mb-6">
                      Welcome to VisHeart, a comprehensive cardiac segmentation platform that combines advanced AI-powered image analysis with intuitive visualization tools.
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Quick Start
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                          <div>
                            <h4 className="font-semibold">Create an Account</h4>
                            <p className="text-sm text-muted-foreground">Sign up for a new account or log in with existing credentials.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                          <div>
                            <h4 className="font-semibold">Upload Medical Images</h4>
                            <p className="text-sm text-muted-foreground">Upload your DICOM or NIfTI files for analysis.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                          <div>
                            <h4 className="font-semibold">Run Segmentation</h4>
                            <p className="text-sm text-muted-foreground">Let our AI analyze your cardiac images automatically.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
                          <div>
                            <h4 className="font-semibold">View Results</h4>
                            <p className="text-sm text-muted-foreground">Analyze the segmented results with our interactive visualization tools.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <Card className="col-span-1 md:col-span-1 lg:col-span-1">
                      <CardHeader>
                        <CardTitle>System Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                          <li>• Stable internet connection</li>
                          <li>• JavaScript enabled</li>
                          <li>• Minimum 4GB RAM recommended</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="col-span-1 md:col-span-1 lg:col-span-1">
                      <CardHeader>
                        <CardTitle>Supported Formats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">DICOM</Badge>
                          <Badge variant="secondary">NIfTI</Badge>
                          <Badge variant="secondary">.nii.gz</Badge>
                          <Badge variant="secondary">.dcm</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="accounts" className="flex-1 m-0 h-full">
            <ScrollArea className="h-full w-full">
              <div className="p-8 w-full">
                <div className="space-y-6 max-w-none">
                  <div>
                    <h1 className="text-3xl font-bold mb-4">Account Types</h1>
                    <p className="text-muted-foreground mb-6">Compare the features and capabilities available for Guest and Registered User accounts.</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Feature Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/3">Feature</TableHead>
                            <TableHead className="text-center">Guest Account</TableHead>
                            <TableHead className="text-center">User Account</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">File Upload</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Cardiac Segmentation</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              3D Visualization{" "}
                              <Badge variant="outline" className="ml-2">
                                Upcoming
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">✓</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Export Results</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">File Saving</TableCell>
                            <TableCell className="text-center">✗</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Project Management</TableCell>
                            <TableCell className="text-center">✗</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Processing History</TableCell>
                            <TableCell className="text-center">✗</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Cloud Storage</TableCell>
                            <TableCell className="text-center">✗</TableCell>
                            <TableCell className="text-center">✓</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Guest Account</CardTitle>
                        <Badge variant="secondary" className="w-fit">
                          Free
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Perfect for trying out the platform and performing quick analysis tasks.</p>
                        <ul className="space-y-2 text-sm">
                          <li>• Immediate access without registration</li>
                          <li>• Full segmentation capabilities</li>
                          <li>• Limited to session-based work</li>
                          <li>• No data persistence</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>User Account</CardTitle>
                        <Badge variant="default" className="w-fit">
                          Free Registration
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Full platform access with data persistence and project management.</p>
                        <ul className="space-y-2 text-sm">
                          <li>• All guest features included</li>
                          <li>• Save and organize projects</li>
                          <li>• Access processing history</li>
                          <li>• Cloud storage integration</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="how-it-works" className="flex-1 m-0 h-full">
            <ScrollArea className="h-full w-full">
              <div className="p-8 w-full">
                <div className="space-y-8 max-w-none">
                  <div>
                    <h1 className="text-3xl font-bold mb-4">How the Segmentation System Works</h1>
                    <p className="text-muted-foreground mb-6">
                      Follow this comprehensive guide to understand the complete workflow from project creation to cardiac segmentation results.
                    </p>
                  </div>

                  {/* Step 1: Getting Started */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                        Welcome to VisHeart
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Start your journey with VisHeart&apos;s intuitive homepage. Here you&apos;ll find the main entry points to access the platform.
                      </p>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <Image 
                          src="/images/doc/homescreen.png" 
                          alt="VisHeart Homepage - Welcome screen showing platform features and Get Started button" 
                          width={1200}
                          height={800}
                          className="w-full rounded-md border shadow-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">The VisHeart homepage with key features highlighted and easy access to get started.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Dashboard Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                        Dashboard Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Your dashboard provides a comprehensive overview of your projects, GPU status, and system statistics.
                      </p>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <Image 
                          src="/images/doc/dashboard-overview.png" 
                          alt="Dashboard Overview - Statistics cards showing total projects, completed segmentations, pending jobs, and GPU status" 
                          width={1200}
                          height={800}
                          className="w-full rounded-md border shadow-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Dashboard overview showing project statistics, GPU status, and quick access to new project creation.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: New Project State */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                        Starting Fresh
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        When you first access the Projects tab, you&apos;ll see a clean interface ready for your first medical imaging project.
                      </p>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <Image 
                          src="/images/doc/dashboard-project-no-projects.png" 
                          alt="Empty Projects Dashboard - Clean interface showing no projects with Upload New Project button" 
                          width={1200}
                          height={800}
                          className="w-full rounded-md border shadow-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Empty projects dashboard with clear call-to-action to upload your first project.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Upload Process */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                        Upload Your Medical Images
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        The upload process is straightforward - simply drag and drop or click to browse for your medical imaging files.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <Image 
                            src="/images/doc/dashboard-project-upload-new-project.png" 
                            alt="Upload Dialog - File upload interface with drag and drop zone" 
                            width={600}
                            height={400}
                            className="w-full rounded-md border shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Upload dialog with drag-and-drop interface for medical imaging files.</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <Image 
                            src="/images/doc/dashboard-project-upload-new-project-with-file-added.png" 
                            alt="Upload Dialog with File - Shows selected file with metadata and project details form" 
                            width={600}
                            height={400}
                            className="w-full rounded-md border shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Upload dialog showing selected file with metadata and project configuration options.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 5: Project Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                        Project Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Once uploaded, your projects appear in the dashboard with detailed information and management options.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <Image 
                            src="/images/doc/dashboard-project-with-1-project.png" 
                            alt="Project Card - Shows project with No Masks status and project actions" 
                            width={600}
                            height={400}
                            className="w-full rounded-md border shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Project card showing uploaded project with &quot;No Masks&quot; status, ready for segmentation.</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <Image 
                            src="/images/doc/dashboard-project-with-1-project-saved.png" 
                            alt="Saved Project Card - Shows project marked as Saved with edit icon" 
                            width={600}
                            height={400}
                            className="w-full rounded-md border shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Project card showing saved project with persistent storage status.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 6: Project Details & Segmentation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                        Project Details & AI Segmentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Access detailed project information and start the AI-powered segmentation process with a single click.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <Image 
                            src="/images/doc/project-overview.png" 
                            alt="Project Overview - Detailed project view with technical specifications and Start Segmentation button" 
                            width={600}
                            height={400}
                            className="w-full rounded-md border shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Detailed project overview showing technical specifications and segmentation controls.</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <Image 
                            src="/images/doc/project-overview-segmentation-done.png" 
                            alt="Completed Segmentation - Project view showing available masks and Edit Segmentation option" 
                            width={600}
                            height={400}
                            className="w-full rounded-md border shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Project view after successful segmentation showing available masks and editing options.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 7: Image Viewer & Manual Editing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">7</div>
                        Advanced Visualization & Manual Editing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Use our advanced MRI viewer to examine your cardiac images and manually edit segmentation masks with precision tools.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <Image 
                            src="/images/doc/project-preview.png" 
                            alt="MRI Viewer - Medical image viewer with frame navigation and zoom controls" 
                            width={600}
                            height={400}
                            className="w-full rounded-md border shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">MRI viewer interface with frame navigation, zoom controls, and image display options.</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <Image 
                            src="/images/doc/project-segmentation.png" 
                            alt="Manual Segmentation Tools - Advanced editing interface with drawing tools and mask overlays" 
                            width={600}
                            height={400}
                            className="w-full rounded-md border shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Manual segmentation interface with precision drawing tools, brush settings, and real-time mask editing.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Workflow Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Complete Workflow Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                          <span className="text-sm">Start from the homepage and navigate to the dashboard</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                          <span className="text-sm">Upload your medical imaging files (NIfTI, DICOM)</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                          <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                          <span className="text-sm">Review project details and start AI segmentation</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                          <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">4</div>
                          <span className="text-sm">Use advanced tools to view and manually edit results</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                        <p className="text-sm font-medium mb-1">Pro Tip</p>
                        <p className="text-sm text-muted-foreground">
                          Register for a user account to save your projects permanently and access advanced project management features.
                          Guest accounts provide full functionality but projects are only available during your session.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DocPage;
