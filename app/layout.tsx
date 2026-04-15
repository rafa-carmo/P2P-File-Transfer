import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "P2P Transfer — Secure File Transfer",
  description:
    "Transfer files directly between peers via WebRTC with end-to-end AES-256-GCM encryption. No server, no size limit, fully private.",
  openGraph: {
    title: "P2P Transfer — Secure File Transfer",
    description:
      "Transfer files directly between peers via WebRTC with end-to-end AES-256-GCM encryption. No server, no size limit, fully private.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "P2P Transfer — Secure File Transfer",
    description:
      "Transfer files directly between peers via WebRTC with end-to-end AES-256-GCM encryption. No server, no size limit, fully private.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
