import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import AIAgentWidget from "@/components/AIAgentWidget";

export const metadata: Metadata = {
  title: "Lumina Real Estate",
  description: "Exclusive Property Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <AIAgentWidget />
      </body>
    </html>
  );
}

