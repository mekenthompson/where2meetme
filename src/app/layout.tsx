import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "@fontsource-variable/material-symbols-outlined";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Where2Meet.Me — Find Your Fair Midpoint",
  description:
    "Find the perfectly fair meeting point for 2-6 people based on real travel times. No more arguing about where to meet.",
  openGraph: {
    title: "Where2Meet.Me — Find Your Fair Midpoint",
    description:
      "Find the perfectly fair meeting point based on real travel times.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000666",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <style
          dangerouslySetInnerHTML={{
            __html: `.material-symbols-outlined {
  font-family: 'Material Symbols Outlined Variable' !important;
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'liga';
}`,
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-surface text-on-surface font-body antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                      console.log('SW registered:', registration.scope);
                    },
                    (error) => {
                      console.log('SW registration failed:', error);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
