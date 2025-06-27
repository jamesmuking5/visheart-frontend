"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      {/* Logo */}
      <div className=""></div>
      {/* Navigation Bar */}
      <div className="flex items-center justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            {/* Home Logo */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>VisHeart</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mt-4 mb-2 text-lg font-medium">
                          VisHeart
                        </div>
                        <p className="text-muted-foreground text-sm leading-tight">
                          A Cardiac Component Segmentation Web Application
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/docs" title="Documentation">
                    How to use the VisHeart application, its features and
                    components
                  </ListItem>
                  <ListItem href="/about" title="About">
                    About the VisHeart team, project and its goals
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {/* Tools */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>List</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/cardiac-segmentation">
                        <div className="font-medium">
                          2D Cardiac Segmentation
                        </div>
                        <div className="text-muted-foreground">
                          Segment Cardiac Components using YOLO or MedSAM.
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">
                        <div className="font-medium">
                          3D Cardiac Segmentation
                        </div>
                        <div className="text-muted-foreground">
                          Coming soon.
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
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
