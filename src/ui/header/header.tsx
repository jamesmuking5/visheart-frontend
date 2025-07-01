"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { CircleUser, KeyRound, UserCog } from "lucide-react";
import ThemeToggle from "../theme-toggle";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-12 w-full bg-background flex justify-center items-center" suppressHydrationWarning>
      {/* Navigation Bar */}
      <div className="flex items-center justify-center bg-background">
        <NavigationMenu>
          <NavigationMenuList>
            {/* Home Logo */}
            <HomeDropDown />
            {/* Tools */}
            <ToolsDropDown />
            {/* Login/Profile */}
            <ProfileDropDown />
          </NavigationMenuList>
        </NavigationMenu>
        {/* Theme Toggle */}
        <ThemeToggle />
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
      <NavigationMenuTrigger>
        <span className="text-red-500">VisHeart</span>
      </NavigationMenuTrigger>
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
// Should change when 
function ProfileDropDown() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        Account
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <LoginCard />
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

// Within Profile Dropdown
function LoginCard() {
  return (
    <Card className="z-10 w-[300px] select-none">
      <CardHeader className="text-center">
        <CardTitle>
          Login
        </CardTitle>
        <CardDescription>
          No Account? Click on the Register button!
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input id="username" defaultValue="Username" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
      </CardContent>
      <CardFooter className="grid gap-2">
        <Button>Login</Button>
        <Button className="bg-red-500 hover:bg-red-700"><Link href='/register' >Register</Link></Button>
      </CardFooter>
    </Card>
  )
}

// ToolsDropDown component for tools navigation
function ToolsDropDown() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
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
