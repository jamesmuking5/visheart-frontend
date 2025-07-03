"use client";

// app/contact/page.tsx
import { useAuth } from "@/context/auth-context";

function getUser() {
  // Get required functions from useAuth
  const { user, logout, loading, error } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user logged in.</p>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Role: {user.role}</p>
      <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>

      <button onClick={logout} className="border bg-muted-foreground m-4 rounded p-4">Logout</button>
    </div>
  );
}

export default function DebugPage() {
  return <>{getUser()}</>;
}
