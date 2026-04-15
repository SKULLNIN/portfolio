import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#245edc",
};

export const metadata: Metadata = {
  title: "Laxmesh Ankola — Portfolio (Windows XP)",
  description:
    "Robotics & autonomous systems portfolio — PX4, ROS 2, Jetson, SLAM — in a Windows XP desktop.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/xp.css@0.2.6/dist/XP.css"
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
