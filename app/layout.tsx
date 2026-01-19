import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dixa Tools Hub",
  description: "Internal tools and resources for Dixa team",
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
