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

export default function ThemeToggle() {
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
          className="h-9 w-9 text-foreground hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
          suppressHydrationWarning
        >
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
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
