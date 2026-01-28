import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bugable - Find bugs before your users do",
  description: "AI that continuously tests your website for UX issues, security vulnerabilities, and broken user flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
