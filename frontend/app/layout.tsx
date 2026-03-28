import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "URBANOPS // CHICAGO OPERATIONS CENTER",
  description: "Real-time city operations platform for Chicago",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-screen w-screen overflow-hidden bg-black">
        {children}
      </body>
    </html>
  );
}
