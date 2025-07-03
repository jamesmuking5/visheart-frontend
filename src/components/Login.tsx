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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api";
// Used to check if user is logged in
import { useAuth } from "@/context/auth-context";

// Within Profile Dropdown
export function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get user and logout function from useAuth
  const { user, logout } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authApi.login(username, password);

      // If login success
      console.log("Login successful:", result);

      // Force refresh current page after 500ms
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle different error scenarios
      if (err.response) {
        setError(err.response.data.message || "Invalid username or password.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  function LoginForm() {
    return (
      <div className="z-10 w-[300px] select-none py-8">
        <CardHeader className="text-center">
          <CardTitle>Login</CardTitle>
          <CardDescription>No Account? Register Now!</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-6">
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
              className="hover:pointer-cursor"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button type="button" className="bg-red-500 hover:bg-red-700">
              <Link href="/register">Register</Link>
            </Button>
          </CardFooter>
        </form>
      </div>
    );
  }

  function ProfileMenu() {
    return (
      <div>
        <CardHeader></CardHeader>
        <CardFooter></CardFooter>
        </div>
    );
  }

  return (
    <>
      {/* Return LoginForm if not logged in else return ProfileMenu */}
      {user ? <ProfileMenu /> : <LoginForm />}
    </>
  );
}
