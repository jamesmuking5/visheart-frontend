import { useState } from "react";
import { authApi } from "@/lib/api";

export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authApi.login(username, password);
      console.log("Login successful:", result);

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.response) {
        setError(err.response.data.message || "Invalid username or password.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const result = await authApi.guestLogin();
      console.log("Guest login successful:", result);

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error("Guest login error:", err);
      setError("An error occurred while logging in as guest.");
    } finally {
      setLoading(false);
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
