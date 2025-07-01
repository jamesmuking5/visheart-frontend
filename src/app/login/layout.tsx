import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VisHeart Frontend Login Page",
  description:
    "VisHeart Frontend Application Login Page for Cardiac Component Segmentation",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}