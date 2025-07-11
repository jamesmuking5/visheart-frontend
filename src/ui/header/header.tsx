"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "../theme-toggle";
import visheartLogo from "@/../public/visheart_logo.svg";
import { useAuth } from "@/context/auth-context";
import { AuthenticatedUserView } from "@/components/AuthenticatedUserView";
import { LoginForm } from "@/components/LoginForm";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Heart,
  User,
  Settings,
  FileText,
  Info,
  Zap,
} from "lucide-react";

// Constants for menu items to avoid recreation on each render
const MOBILE_MENU_ITEMS = [
  {
    title: "Tools",
    items: [
      {
        title: "2D Cardiac Segmentation",
        href: "/cardiac-segmentation",
        icon: Heart,
        badge: "Active",
      },
      {
        title: "3D Cardiac Segmentation",
        href: "#",
        icon: Settings,
        isComingSoon: true,
      },
    ],
  },
  {
    title: "Information",
    items: [
      {
        title: "Documentation",
        href: "/doc",
        icon: FileText,
        badge: "Updated",
      },
      {
        title: "About Us",
        href: "/about",
        icon: Info,
      },
    ],
  },
] as const;

// Animation constants
const ANIMATION_CONSTANTS = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.6,
  },
  delay: {
    initial: 0.1,
    userSection: 0.2,
    menuBase: 0.3,
    sectionMultiplier: 0.1,
    itemBase: 0.4,
    itemMultiplier: 0.05,
  },
} as const;

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);

  // Function to close all navigation menus
  const closeNavigationMenus = () => {
    // Trigger a click outside the navigation to close it
    if (navigationRef.current) {
      const event = new Event("click", { bubbles: true });
      document.dispatchEvent(event);
    }
  };

  // Constants for header heights
  const HEADER_HEIGHT_NORMAL = 64; // h-16 = 64px
  const HEADER_HEIGHT_SCROLLED = 40; // h-10 = 40px
  const SCROLL_THRESHOLD = 20;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          duration: ANIMATION_CONSTANTS.duration.slow,
          ease: "easeOut",
        }}
        className={cn(
          "fixed top-0 right-0 left-0 z-[60] transition-all duration-300 ease-in-out",
          "supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur-md",
          isScrolled
            ? "bg-background/95 border-border/80 h-10 shadow-sm"
            : "bg-background/50 border-border/40 h-16",
        )}
      >
        <div className="container mx-auto h-full px-4">
          <div className="flex h-full items-center justify-between">
            {/* Logo and Brand */}
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: ANIMATION_CONSTANTS.duration.fast }}
            >
              <Link
                href="/"
                className="group flex items-center space-x-2 transition-all duration-200"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Image
                      src={visheartLogo}
                      width={isScrolled ? 28 : 32}
                      height={isScrolled ? 28 : 32}
                      alt="VisHeart Logo"
                      className="transition-all duration-300"
                    />
                  </motion.div>
                  <motion.div
                    className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
                  VisHeart
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden items-center md:flex">
              <NavigationMenu ref={navigationRef}>
                <NavigationMenuList className="space-x-1">
                  <ToolsDropDown onMenuInteraction={closeNavigationMenus} />
                  <HomeDropDown onMenuInteraction={closeNavigationMenus} />
                  <ProfileDropDown onMenuInteraction={closeNavigationMenus} />
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2">
              <ThemeToggle iconSize={isScrolled ? 1.25 : 1.75} />

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{
                        duration: ANIMATION_CONSTANTS.duration.fast,
                      }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{
                        duration: ANIMATION_CONSTANTS.duration.fast,
                      }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: ANIMATION_CONSTANTS.duration.fast }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: ANIMATION_CONSTANTS.duration.normal,
                ease: "easeOut",
              }}
              className="bg-background fixed top-0 right-0 h-full w-80 border-l shadow-lg"
            >
              <div className="flex items-center justify-between border-b p-4">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under fixed header */}
      <motion.div
        animate={{
          height: isScrolled ? HEADER_HEIGHT_SCROLLED : HEADER_HEIGHT_NORMAL,
        }}
        transition={{ duration: ANIMATION_CONSTANTS.duration.normal }}
      />
    </>
  );
}

// Enhanced ListItem component with icons and better styling
const ListItem = React.memo(function ListItem({
  title,
  children,
  href,
  icon: Icon,
  badge,
  isComingSoon = false,
  className,
  onMenuInteraction,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & {
  href: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  isComingSoon?: boolean;
  className?: string;
  onMenuInteraction?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (isComingSoon) {
      e.preventDefault();
    } else if (onMenuInteraction) {
      // Small delay to allow navigation to start before closing menu
      setTimeout(onMenuInteraction, 100);
    }
  };

  return (
    <li className={cn("flex", className)}>
      <NavigationMenuLink asChild>
        <Link
          href={isComingSoon ? "#" : href}
          className={cn(
            "group relative flex h-full w-full flex-col space-y-1 rounded-lg p-4 leading-none no-underline transition-all duration-200 outline-none select-none",
            "hover:bg-accent/50 hover:scale-[1.02] hover:shadow-md",
            "focus:bg-accent focus:text-accent-foreground",
            "hover:border-border/50 border border-transparent",
            isComingSoon && "cursor-not-allowed opacity-60",
          )}
          onClick={handleClick}
          {...props}
        >
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="bg-primary/10 group-hover:bg-primary/20 flex-shrink-0 rounded-md p-2 transition-colors">
                <Icon className="text-primary h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="group-hover:text-primary truncate text-base font-semibold transition-colors">
                  {title}
                </span>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
                {isComingSoon && (
                  <Badge variant="outline" className="text-xs">
                    Soon
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 flex-1 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});

// Enhanced HomeDropDown component
const HomeDropDown = React.memo(function HomeDropDown({
  onMenuInteraction,
}: {
  onMenuInteraction?: () => void;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="group hover:bg-accent/50 data-[state=open]:bg-accent/50 h-10 bg-transparent px-4 py-2 transition-all duration-200">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4" />
          <span>About</span>
        </div>
      </NavigationMenuTrigger>
      <NavigationMenuContent className="bg-background/95 border shadow-lg backdrop-blur-md">
        <div className="grid w-[500px] gap-3 p-6 lg:w-[600px] lg:grid-cols-[1fr_1.5fr]">
          <div className="row-span-3">
            <NavigationMenuLink asChild>
              <Link
                className="group flex h-full w-full flex-col justify-center rounded-lg border border-red-200/50 bg-gradient-to-br from-red-50 to-pink-50 p-6 no-underline transition-all duration-200 outline-none select-none hover:scale-[1.02] hover:shadow-md dark:border-red-800/50 dark:from-red-950/50 dark:to-pink-950/50"
                href="/"
                onClick={() =>
                  onMenuInteraction && setTimeout(onMenuInteraction, 100)
                }
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="rounded-lg bg-red-500/10 p-2">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="text-xl font-bold text-red-500">VisHeart</div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Advanced Cardiac Component Segmentation using AI-powered tools
                  for medical imaging analysis.
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-red-500 transition-colors group-hover:text-red-600">
                  Learn more →
                </div>
              </Link>
            </NavigationMenuLink>
          </div>
          <ul className="flex h-full list-none flex-col">
            <ListItem
              href="/doc"
              title="Documentation"
              icon={FileText}
              badge="Updated"
              className="flex-1"
              onMenuInteraction={onMenuInteraction}
            >
              Complete guide on using VisHeart's features, tools, and best
              practices for cardiac imaging.
            </ListItem>
            <ListItem
              href="/about"
              title="About Us"
              icon={Info}
              className="min-h-36 flex-1"
              onMenuInteraction={onMenuInteraction}
            >
              Meet the VisHeart team and learn about our mission to advance
              cardiac imaging technology.
            </ListItem>
          </ul>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
});

// Enhanced ProfileDropDown component
const ProfileDropDown = React.memo(function ProfileDropDown({
  onMenuInteraction,
}: {
  onMenuInteraction?: () => void;
}) {
  const { user } = useAuth();

  const handleButtonClick = () => {
    if (onMenuInteraction) {
      setTimeout(onMenuInteraction, 100);
    }
  };

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="group hover:bg-accent/50 data-[state=open]:bg-accent/50 h-10 bg-transparent px-4 py-2 transition-all duration-200">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{user ? "Profile" : "Sign In"}</span>
        </div>
      </NavigationMenuTrigger>
      <NavigationMenuContent className="bg-background/95 border shadow-lg backdrop-blur-md">
        <div className="p-4" onClick={handleButtonClick}>
          {user ? <AuthenticatedUserView /> : <LoginForm />}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
});

// Enhanced ToolsDropDown component
const ToolsDropDown = React.memo(function ToolsDropDown({
  onMenuInteraction,
}: {
  onMenuInteraction?: () => void;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="group hover:bg-accent/50 data-[state=open]:bg-accent/50 h-10 bg-transparent px-4 py-2 transition-all duration-200">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>Tools</span>
        </div>
      </NavigationMenuTrigger>
      <NavigationMenuContent className="bg-background/95 min-h-72 border shadow-lg backdrop-blur-md">
        <div className="grid w-[500px] gap-3 p-6 md:w-[600px] md:grid-cols-1 lg:w-[700px]">
          <div className="mb-4">
            <h3 className="text-primary mb-2 text-lg font-semibold">
              AI-Powered Segmentation Tools
            </h3>
            <p className="text-muted-foreground text-sm">
              Advanced tools for cardiac imaging analysis and segmentation
            </p>
          </div>
          <div className="grid list-none grid-cols-1 gap-3 md:grid-cols-2">
            <ListItem
              href="/cardiac-segmentation"
              title="2D Cardiac Segmentation"
              icon={Heart}
              badge="Active"
              className="min-h-36"
              onMenuInteraction={onMenuInteraction}
            >
              Advanced <span className="text-green-500">2D</span> cardiac
              component segmentation using YOLO and MedSAM for precise medical
              imaging analysis.
            </ListItem>
            <ListItem
              href="#"
              title="3D Cardiac Segmentation"
              icon={Settings}
              isComingSoon={true}
              className="min-h-36"
              onMenuInteraction={onMenuInteraction}
            >
              Upcoming <span className="text-red-500">3D</span> cardiac imaging
              capabilities with enhanced depth analysis and volumetric
              segmentation.
            </ListItem>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
});

// Mobile Menu Component with enhanced animations
const MobileMenu = React.memo(function MobileMenu({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        className="space-y-6 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: ANIMATION_CONSTANTS.delay.initial,
          duration: ANIMATION_CONSTANTS.duration.normal,
        }}
      >
        {/* User Section */}
        <motion.div
          className="border-b pb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: ANIMATION_CONSTANTS.delay.userSection,
            duration: ANIMATION_CONSTANTS.duration.normal,
          }}
        >
          {user ? (
            <div className="space-y-3">
              <AuthenticatedUserView />
            </div>
          ) : (
            <div className="space-y-3">
              <LoginForm />
            </div>
          )}
        </motion.div>

        {/* Menu Sections */}
        {MOBILE_MENU_ITEMS.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            className="space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay:
                ANIMATION_CONSTANTS.delay.menuBase +
                sectionIndex * ANIMATION_CONSTANTS.delay.sectionMultiplier,
              duration: ANIMATION_CONSTANTS.duration.normal,
            }}
          >
            <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.title}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    delay:
                      ANIMATION_CONSTANTS.delay.itemBase +
                      sectionIndex *
                        ANIMATION_CONSTANTS.delay.sectionMultiplier +
                      itemIndex * ANIMATION_CONSTANTS.delay.itemMultiplier,
                    duration: ANIMATION_CONSTANTS.duration.normal,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={item.isComingSoon ? "#" : item.href}
                    onClick={
                      item.isComingSoon ? (e) => e.preventDefault() : onClose
                    }
                    className={cn(
                      "flex items-center space-x-3 rounded-lg p-3 transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      item.isComingSoon && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <div className="bg-primary/10 flex-shrink-0 rounded-md p-2">
                      <item.icon className="text-primary h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="truncate font-medium">
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.isComingSoon && (
                          <Badge variant="outline" className="text-xs">
                            Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});
