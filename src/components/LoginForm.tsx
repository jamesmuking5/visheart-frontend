"use client";

import { useState } from "react";
import Link from "next/link";
import { useLogin } from "@/lib/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

export const LoginForm = () => {
  const { username, setUsername, password, setPassword, error, loading, handleLogin, handleGuestLogin } = useLogin();

  return (
    <div className="z-10 w-[300px] select-none ">
      <CardHeader className="text-center">
        <CardTitle>Login</CardTitle>
        <CardDescription>No Account? Register Now!</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-6 mt-5">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircleIcon className="h-4 w-4" />
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
        <CardFooter className="grid gap-2 mt-5">
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
              className="border-gray-500 w-full hover:cursor-pointer"
            >
              Register
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                className="bg-red-500 hover:bg-red-700 hover:cursor-pointer"
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
                <AlertDialogDescription className="p-0 m-0 flex">
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
                    className="border-gray-500 w-full hover:cursor-pointer"
                  >
                    Register
                  </Button>
                </Link>
                <Button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-700 hover:cursor-pointer"
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
};
