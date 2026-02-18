import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Bookmark - Save & Organize Your Bookmarks",
  description:
    "A real-time bookmark manager. Save, organize, and access your bookmarks across devices with Google sign-in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Inter',sans-serif] antialiased">
        {children}
      </body>
    </html>
  );
}
