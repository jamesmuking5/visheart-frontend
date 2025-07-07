// Login component (located in the navbar dropdown menu) for user authentication

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertCircleIcon } from "lucide-react";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLogin } from "@/lib/login";

// TEST
import { LogOut, Settings, Shield, User, UserCheck } from "lucide-react";
import {
  ShowForAdmin,
  ShowForUser,
  ShowForGuest,
} from "@/components/RoleGuard";

export function LoginCard() {
  const { user, logout } = useAuth();
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
    handleGuestLogin,
  } = useLogin();

  if (user) {
    const getRoleIcon = () => {
      switch (user.role) {
        case "admin":
          return <Shield className="h-4 w-4 text-blue-600" />;
        case "user":
          return <UserCheck className="h-4 w-4 text-green-600" />;
        case "guest":
          return <User className="h-4 w-4 text-gray-500" />;
        default:
          return <User className="h-4 w-4" />;
      }
    };

    const getRoleBadge = () => {
      const roleColors = {
        admin: "bg-blue-100 text-blue-800 border-blue-200",
        user: "bg-green-100 text-green-800 border-green-200",
        guest: "bg-gray-100 text-gray-800 border-gray-200",
      };

      return (
        <span
          className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
            roleColors[user.role as keyof typeof roleColors] || roleColors.guest
          }`}
        >
          {getRoleIcon()}
          <span className="ml-1 capitalize">{user.role}</span>
        </span>
      );
    };

    return (
      <div className="w-[400px] py-12 select-none">
        <CardHeader className="pb-4 text-center">
          <div className="en flex items-center">
            <div className="flex-1">
              <CardTitle className="text-left text-lg">Welcome back!</CardTitle>
              <p className="text-muted-foreground text-left text-sm">
                {user.username}
              </p>
            </div>
            {getRoleBadge()}
          </div>
        </CardHeader>

        <CardContent className="grid gap-3">
          {/* Role-specific content */}
          <ShowForGuest fallback={null}>
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircleIcon className="h-4 w-4 stroke-black text-orange-600" />
              <AlertDescription className="text-orange-800">
                <span className="text-left">
                  You're in guest mode. Your work won't be saved.
                  <Link href="/register" className="ml-1 font-medium underline">
                    Create an account now.
                  </Link>
                </span>
              </AlertDescription>
            </Alert>
          </ShowForGuest>

          <ShowForAdmin fallback={null}>
            <Alert className="border-blue-200 bg-blue-50 py-2">
              <AlertDescription className="flex items-center justify-center text-blue-800">
                <Shield className="mr-2 h-4 w-4 stroke-blue-600 text-blue-600" />
                Admin privileges active
              </AlertDescription>
            </Alert>
          </ShowForAdmin>

          {/* Action buttons */}
          <div className="grid gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                My Dashboard
              </Button>
            </Link>

            <ShowForAdmin fallback={null}>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            </ShowForAdmin>
            <ShowForUser fallback={null}>
              <Link href="/profile">
                <Button variant="outline" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Button>
              </Link>
            </ShowForUser>
            <ShowForGuest>
              <Link href="/register">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Upgrade Account
                </Button>
              </Link>
            </ShowForGuest>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardFooter>
      </div>
    );
  }

  return (
    <div className="z-10 w-[300px] py-10 select-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>No Account? Register Now!</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="mt-5 grid gap-6">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircleIcon className="h-4 w-4 stroke-black" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-3">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="mt-5 grid gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="hover:cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Link href="/register">
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-500 hover:cursor-pointer"
            >
              Register
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                className="bg-red-500 hover:cursor-pointer hover:bg-red-700"
              >
                Continue as Guest
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex flex-row items-center gap-2">
                  <AlertCircleIcon className="h-4 w-4" />
                  Guest Login
                </AlertDialogTitle>
                <AlertDialogDescription className="m-0 flex p-0">
                  Guest login gives access to tools, but your data and projects
                  won't be saved. Register now to save your work.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <Link href="/register">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-500 hover:cursor-pointer"
                  >
                    Register
                  </Button>
                </Link>
                <Button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="bg-red-500 hover:cursor-pointer hover:bg-red-700"
                >
                  <strong>Proceed</strong>
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </form>
    </div>
  );
}
