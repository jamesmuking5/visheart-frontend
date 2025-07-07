// This is a library for react hooks related to the login functionality
// Most of the functions are used in the Login.tsx file

import { useState } from "react";
import { useAuth } from "@/context/auth-context";

export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, guestLogin, error, loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleGuestLogin = async () => {
    await guestLogin();
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
