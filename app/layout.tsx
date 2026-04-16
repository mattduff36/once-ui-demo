import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Block Stack",
  description:
    "A fast, mobile-first falling-block puzzle game with modern controls and polished touch support.",
  applicationName: "Block Stack",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Block Stack"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" }]
  },
  manifest: "/site.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
