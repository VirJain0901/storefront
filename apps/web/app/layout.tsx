import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Storefront — The Zero-Ops E-Commerce Builder",
  description: "An agentic storefront builder that sets up, markets, and optimizes your store from a single conversation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
