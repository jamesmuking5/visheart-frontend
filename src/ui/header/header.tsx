"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import ThemeToggle from "../theme-toggle";
import visheartLogo from "@/../public/visheart_logo.svg";
import { useAuth } from "@/context/auth-context";
import { AuthenticatedUserView } from "@/components/AuthenticatedUserView";
import { LoginForm } from "@/components/LoginForm";

export default function Header() {
  return (
    <header
      className="bg-background/50 border-border/40 sticky top-0 z-50 flex h-16 border-b backdrop-blur-sm"
      suppressHydrationWarning
    >
      {/* Navigation Bar */}
      <div className="ml-1 flex h-16 w-full">
        <NavigationMenu className="">
          <NavigationMenuList className="">
            {/* Home Logo */}
            <HomeDropDown />
            {/* Tools */}
            <ToolsDropDown />
            {/* Login/Profile */}
            <ProfileDropDown />
          </NavigationMenuList>
        </NavigationMenu>
        {/* Theme Toggle */}
      </div>
      <div className="mr-1 flex items-center">
        <ThemeToggle iconSize={1.75} />
      </div>
    </header>
  );
}

// ListItem component for Navigation Menu
const ListItem = React.memo(function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & { href: string; title: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="text-lg font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});

// HomeDropDown component for the home link
const HomeDropDown = React.memo(function HomeDropDown() {
  return (
    <NavigationMenuItem>
      <Link href="/">
        <NavigationMenuTrigger className="hover:!bg-background/20 h-14 w-full !bg-transparent text-lg transition-all duration-200 hover:cursor-pointer hover:backdrop-blur-sm">
          <Image
            src={visheartLogo}
            width={36}
            height={36}
            alt="VisHeart Logo"
            className="mr-2"
          />
          <div className="flex flex-row">
            <span className="text-red-500">VisHeart</span>
          </div>
        </NavigationMenuTrigger>
      </Link>
      <NavigationMenuContent className="!bg-background/80 backdrop-blur-md border-border/40">
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          <li className="row-span-3">
            <NavigationMenuLink asChild>
              <Link
                className="from-muted/50 to-muted flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none focus:shadow-md"
                href="/"
              >
                <div className="mb-2 mt-4 text-lg font-bold">VisHeart</div>
                <p className="text-muted-foreground text-sm leading-tight">
                  A Cardiac Component Segmentation Web Application
                </p>
              </Link>
            </NavigationMenuLink>
          </li>
          <ListItem href="/docs" title="Documentation">
            How to use the VisHeart application, its features and components
          </ListItem>
          <ListItem href="/about" title="About">
            About the VisHeart team, project and its goals
          </ListItem>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
});

// ProfileDropDown component for user profile and settings
const ProfileDropDown = React.memo(function ProfileDropDown() {
  const { user } = useAuth();
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="hover:!bg-background/20 h-14 w-full !bg-transparent text-lg transition-all duration-200 hover:backdrop-blur-sm">
        Account
      </NavigationMenuTrigger>
      <NavigationMenuContent className="!bg-background/80 backdrop-blur-md border-border/40 py-5">
        {user ? <AuthenticatedUserView /> : <LoginForm />}
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
});

// ToolsDropDown component for tools navigation
const ToolsDropDown = React.memo(function ToolsDropDown() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="hover:!bg-background/20 h-14 w-full !bg-transparent text-lg transition-all duration-200 hover:backdrop-blur-sm">
        Tools
      </NavigationMenuTrigger>
      <NavigationMenuContent className="!bg-background/80 backdrop-blur-md border-border/40">
        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
          <ListItem href="/cardiac-segmentation" title="2D Cardiac Segmentation">
            Start a new project to segment Cardiac Components using YOLO &
            MedSAM.
          </ListItem>
          <ListItem href="#" title="3D Cardiac Segmentation">
            Coming soon.
          </ListItem>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
});

// Check if user is logged in and return name if true
export function getUserName() {
  // This is a placeholder function. Add logic to get user name.
  // Might be moved to utils
  return "Profile"; // Replace with actual user name retrieval logic
}
