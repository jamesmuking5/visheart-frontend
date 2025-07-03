// app/contact/layout.tsx
import type { Metadata } from "next";

/** Segment‑level SEO (inherits from root, can be overridden by pages) */
export const metadata: Metadata = {
  title: "Empty Page",
  description:
    "Empty debug page used to avoid rendering other elements and can be used to populate with random outputs instead of using console",
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
