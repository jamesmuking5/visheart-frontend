"use client";

import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import ThemeToggle from "../theme-toggle";
import { Button } from "@/components/ui/button";
import visheartLogo from "@/../public/visheart_logo.svg";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 h-16 bg-background/50 backdrop-blur-sm border-b border-border/40 flex"
      suppressHydrationWarning
    >
      {/* Navigation Bar */}
      <div className="flex h-16 w-full ml-1">
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
      <div className="mr-1">
        <ThemeToggle iconSize={1.75} />
      </div>
    </header>
  );
}

// ListItem component for Navigation Menu taken from shadcn/ui example
function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

// HomeDropDown component for the home link
function HomeDropDown() {
  return (
    <NavigationMenuItem>
      <Link href="/">
        <NavigationMenuTrigger className="hover:cursor-pointer h-14 w-full text-xl !bg-transparent hover:!bg-background/20 hover:backdrop-blur-sm transition-all duration-200">
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
      <NavigationMenuContent>
        <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          <li className="row-span-3">
            <NavigationMenuLink asChild>
              <Link
                className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                href="/"
              >
                <div className="mt-4 mb-2 text-lg font-medium">VisHeart</div>
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
}

// ProfileDropDown component for user profile and settings
import { LoginCard } from "@/components/Login";

function ProfileDropDown() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="w-full h-14 text-xl !bg-transparent hover:!bg-background/20 hover:backdrop-blur-sm transition-all duration-200">
        Account
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <LoginCard />
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

// ToolsDropDown component for tools navigation
function ToolsDropDown() {
  return (
    <NavigationMenuItem className="">
      <NavigationMenuTrigger className="w-full h-14 text-xl !bg-transparent hover:!bg-background/20 hover:backdrop-blur-sm transition-all duration-200">
        Tools
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[300px] gap-4">
          <li>
            <NavigationMenuLink asChild>
              <Link href="/cardiac-segmentation">
                <div className="font-medium">
                  <span className="text-green-500">2D</span> Cardiac
                  Segmentation
                </div>
                <div className="text-muted-foreground">
                  Start a new project to segment Cardiac Components using YOLO &
                  MedSAM.
                </div>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="#">
                <div className="font-medium">
                  <span className="text-red-500">3D</span> Cardiac Segmentation
                </div>
                <div className="text-muted-foreground">Coming soon.</div>
              </Link>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

// Check if user is logged in and return name if true
export function getUserName() {
  // This is a placeholder function. Add logic to get user name.
  // Might be moved to utils
  return "Profile"; // Replace with actual user name retrieval logic
}
