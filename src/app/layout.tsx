import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import AppShell from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Momentum — Habit Tracker",
  description:
    "Build lasting habits with streak tracking, calendar heatmaps, charts, achievements and reminders.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Momentum",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c12" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const THEME_INIT = `
(function () {
  try {
    var stored = localStorage.getItem('habit-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg text-text" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <AppShell>{children}</AppShell>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            },
          }}
        />
      </body>
    </html>
  );
}
