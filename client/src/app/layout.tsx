import type { Metadata } from "next";
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";

export const metadata: Metadata = {
  title: "DevAudit AI - AI-Powered Code Review Platform",
  description: "DevAudit AI reviews every Pull Request like a 10x developer — catching bugs, security issues, and code smells before they hit production.",
  keywords: ["code review", "AI", "GitHub", "pull request", "security", "DevAudit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-gh-bg text-gh-text">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
