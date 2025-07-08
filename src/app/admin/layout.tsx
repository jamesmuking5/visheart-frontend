"use client";

import type { Metadata } from "next";
import { Shield, Users, BarChart3, Settings, Database, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Define admin navigation structure for scalability
const adminNavigation = [
  {
    title: "User Management",
    href: "/admin/user-management",
    icon: Users,
    description: "Manage users, roles, and permissions",
    status: "active" as const,
  },
  {
    title: "Analytics",
    href: "/admin/analytics", 
    icon: BarChart3,
    description: "View system analytics and reports",
    status: "coming-soon" as const,
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings, 
    description: "Configure system-wide settings",
    status: "coming-soon" as const,
  },
  {
    title: "Database Management",
    href: "/admin/database",
    icon: Database,
    description: "Manage database operations and backups",
    status: "coming-soon" as const,
  },
  {
    title: "System Monitor",
    href: "/admin/monitor",
    icon: Activity,
    description: "Monitor system health and performance",
    status: "coming-soon" as const,
  },
] as const;

// Generate breadcrumb items based on current path
function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  // Always start with Admin root
  breadcrumbs.push({
    label: "Admin",
    href: "/admin",
    isActive: pathname === "/admin"
  });
  
  // Add sub-paths
  if (paths.length > 1) {
    const subPath = paths[1];
    const navItem = adminNavigation.find(item => 
      item.href.includes(subPath)
    );
    
    if (navItem) {
      breadcrumbs.push({
        label: navItem.title,
        href: navItem.href,
        isActive: pathname === navItem.href
      });
    }
  }
  
  return breadcrumbs;
}

// Admin navigation card component for the dashboard
function AdminNavigationCard({ 
  item, 
  isActive 
}: { 
  item: typeof adminNavigation[0]; 
  isActive: boolean;
}) {
  const Icon = item.icon;
  const isComingSoon = item.status === "coming-soon";
  
  const cardContent = (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200",
      isActive && "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
      !isComingSoon && "hover:shadow-md hover:scale-[1.02] cursor-pointer",
      isComingSoon && "opacity-60 cursor-not-allowed"
    )}>
      {/* Coming soon badge */}
      {isComingSoon && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-lg transition-colors",
            isActive 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            !isComingSoon && "group-hover:bg-blue-100 group-hover:text-blue-600"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Wrap with Link only if not coming soon
  if (isComingSoon) {
    return cardContent;
  }
  
  return (
    <Link href={item.href} className="block">
      {cardContent}
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const isAdminRoot = pathname === "/admin";
  
  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-950/30">
      {/* Admin Panel Header - Sticky for consistent navigation */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          {/* Header with title and breadcrumbs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">
                  System administration and management
                </p>
              </div>
            </div>
          </div>
          
          {/* Breadcrumb navigation for better UX */}
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={crumb.href}>
                  {crumb.isActive ? (
                    <BreadcrumbPage className="font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        href={crumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      
      {/* Main content area with proper spacing and responsive design */}
      <main className="container mx-auto px-6 py-8">
        {isAdminRoot ? (
          // Admin dashboard with navigation cards
          <div className="space-y-8">
            {/* Welcome section */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome to the Admin Dashboard
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage your VisHeart system efficiently with our comprehensive admin tools. 
                Select a module below to get started.
              </p>
            </div>
            
            {/* Navigation grid - responsive layout */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {adminNavigation.map((item) => (
                <AdminNavigationCard
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                />
              ))}
            </div>
            
            {/* Quick stats or additional info could go here */}
            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🚀 System Status
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                All admin modules are operational. New features are being developed and will be available soon.
              </p>
            </div>
          </div>
        ) : (
          // Render child pages (like user-management)
          <div className="space-y-6">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
