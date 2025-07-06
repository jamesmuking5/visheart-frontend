// This component toggles between light and dark themes using Next.js's `next-themes` package.
// To choose the size of the icons, you can pass an `iconSize` prop in rem units.
// Example:
// <ThemeToggle iconSize={0.75} />  // 0.75rem icons
// <ThemeToggle iconSize={1.5} />   // 1.5rem icons

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

enum Theme {
  Light = "light",
  Dark = "dark",
}

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// Define the props for the ThemeToggle component
interface ThemeToggleProps {
  iconSize?: number; // size in rem units
}

// ThemeToggle component that allows users to switch between light and dark themes
// Default icon size is set to 1rem, but can be customized via the `iconSize` prop
export default function ThemeToggle({ iconSize = 1 }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();

  // Get opposite theme
  const getOppositeTheme = () => {
    return theme === Theme.Light ? Theme.Dark : Theme.Light;
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light)
          }
          className="h-9 w-9 text-foreground !bg-transparent hover:!bg-background/20 hover:backdrop-blur-sm transition-all duration-200"
          suppressHydrationWarning
          style={
            {
              "--icon-size": `${iconSize}rem`,
              width: `${iconSize * 2.25}rem`,
              height: `${iconSize * 2.25}rem`,
            } as React.CSSProperties
          }
        >
          {theme === "light" ? (
            <Sun
              style={{ width: `${iconSize}rem`, height: `${iconSize}rem` }}
            />
          ) : (
            <Moon
              style={{ width: `${iconSize}rem`, height: `${iconSize}rem` }}
            />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-48">
        <div className="text-sm">Toggle Theme</div>
        <p className="text-muted-foreground">
          Switch to <span className="capitalize">{getOppositeTheme()}</span>{" "}
          mode.
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}
