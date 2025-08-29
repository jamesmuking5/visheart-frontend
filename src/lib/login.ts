// This is a library for react hooks related to the login functionality
// Most of the functions are used in the Login.tsx file

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function useLogin(redirectTo: string = "#") {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, guestLogin, error, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Add a minimum 1-second delay to show the signing in spinner
      await Promise.all([
        login(username, password),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      // Only redirect if redirectTo is not the default "#" value
      // This prevents double redirects when using RegistrationOnly wrapper
      if (redirectTo !== "#") {
        router.push(redirectTo);
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error("Login failed:", error);
    }
  };

  const handleGuestLogin = async () => {
    try {
      // Add a minimum 1-second delay to show the loading spinner
      await Promise.all([
        guestLogin(),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      // Only redirect if redirectTo is not the default "#" value
      // This prevents double redirects when using RegistrationOnly wrapper
      if (redirectTo !== "#") {
        router.push(redirectTo);
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error("Guest login failed:", error);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
    handleGuestLogin,
  };
}
