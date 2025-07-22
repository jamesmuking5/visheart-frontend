// This is a library for react hooks related to the login functionality
// Most of the functions are used in the Login.tsx file

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function useLogin(redirectTo: string = "/") {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, guestLogin, error, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      router.push(redirectTo);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleGuestLogin = async () => {
    try {
      await guestLogin();
      router.push(redirectTo);
    } catch (error) {
      // Error is handled by the auth context
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
