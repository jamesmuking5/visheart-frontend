import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Panel - VisHeart",
  description: "VisHeart Admin Panel - System Administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen">
        <Shield className="h-7 w-7 text-blue-500" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      {/* Content area with consistent container */}
      <div className="container mx-auto px-6 py-6">{children}</div>
    </>
  );
}
