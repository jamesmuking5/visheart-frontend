import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// UI Imports
import Footer from "@/ui/footer/footer";
import Header from "@/ui/header/header";

import type { ViewPort } from "next";

import { ThemeProvider } from "@/lib/theme-provider";

import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "VisHeart",
  description: "VisHeart Web Application for Cardiac Component Segmentation",
};

// Toasts
import { Toaster } from "sonner";

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            {children}
            <Footer />
          </AuthProvider>
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
