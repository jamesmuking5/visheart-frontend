// app/contact/layout.tsx
import type { Metadata } from "next";

/** Segment‑level SEO (inherits from root, can be overridden by pages) */
export const metadata: Metadata = {
  title: "VisHeart Dashboard",
  description: "VisHeart Account Settings",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* Keep this minimal for now; add nav, sidebar, etc. later */
    <section className="mx-auto max-w-3xl p-6">
      <h1>This section can be populated with debug and test elements.</h1>
      {children}
    </section>
  );
}
