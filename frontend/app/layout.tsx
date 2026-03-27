import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UrbanOps — Smart City Operations",
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
      </head>
      <body className="h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
