import { cn } from "@lib/utils";
import { Geist, Geist_Mono } from "next/font/google";
import "@styles/globals.css";
import Navigation from "@components/Navigation";
import { Sidebar } from "@components/Sidebar";
import { ThemeProvider } from "@components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

export const metadata = {
  alternates: {
    canonical: "/",
  },
  authors: [
    {
      name: "Gökhan Öztürk",
      url: "https://gozturk.dev",
    },
  ],
  creator: "Gökhan Öztürk",
  description:
    "Gökhan Öztürk is a software engineer in İstanbul who builds iOS apps, web products and open source tools.",
  icon: [
    {
      rel: "icon",
      type: "image/x-icon",
      url: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      sizes: "32x32",
      type: "image/png",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      sizes: "16x16",
      type: "image/png",
      url: "/favicon-16x16.png",
    },
  ],
  keywords: [
    "Gökhan Öztürk",
    "gokhanozturk",
    "gokh4nozturk",
    "software engineer",
    "iOS developer",
    "web developer",
    "open source",
    "software engineer",
    "programmer",
    "frontend developer",
  ],
  metadataBase: new URL("https://gozturk.dev"),
  openGraph: {
    description:
      "Gökhan Öztürk is a software engineer in İstanbul who builds iOS apps, web products and open source tools.",
    images: [
      {
        alt: "Gökhan Öztürk – Software engineer in İstanbul",
        height: 630,
        type: "image/png",
        url: "https://gozturk.dev/api/og",
        width: 1200,
      },
    ],
    title: "Gökhan Öztürk – Software engineer",
    url: "/",
  },
  publisher: "Gökhan Öztürk",
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
    nocache: true,
  },
  title: {
    default: "Gökhan Öztürk – Software engineer",
    template: "%s | Gökhan Öztürk",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@gokh4nozturk",
    description:
      "Gökhan Öztürk is a software engineer in İstanbul who builds iOS apps, web products and open source tools.",
    images: [
      {
        url: "https://gozturk.dev/api/og",
      },
    ],
    site: "@gokh4nozturk",
    title: "Gökhan Öztürk – Software engineer",
  },
};

// Self-hosted variable fonts; exposed as CSS variables for --font-sans/--font-mono.
const geistSans = Geist({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "https://gozturk.dev/#person",
      "@type": "Person",
      description:
        "Gökhan Öztürk is a software engineer in İstanbul who builds iOS apps, web products and open source tools.",
      jobTitle: "Software Engineer",
      name: "Gökhan Öztürk",
      sameAs: ["https://github.com/gokh4nozturk", "https://twitter.com/gokh4nozturk"],
      url: "https://gozturk.dev",
    },
    {
      "@id": "https://gozturk.dev/#website",
      "@type": "WebSite",
      description:
        "Gökhan Öztürk is a software engineer in İstanbul who builds iOS apps, web products and open source tools.",
      inLanguage: "en",
      name: "Gökhan Öztürk – Software engineer",
      publisher: { "@id": "https://gozturk.dev/#person" },
      url: "https://gozturk.dev",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html className={cn(geistSans.variable, geistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw injection
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      </head>
      <body
        className={cn(
          "mx-auto min-h-dvh max-w-6xl bg-p3-background-light px-4 font-sans text-p3-text antialiased",
          "selection:bg-p3-primary-light selection:text-p3-text sm:px-10",
          "dark:bg-p3-background dark:text-p3-text-dark dark:selection:bg-p3-accent-dark dark:selection:text-p3-text-dark",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <div className="lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-20">
            <Sidebar />
            <main className="min-w-0 pt-4 pb-40 lg:pt-14">{children}</main>
          </div>
          <Navigation />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <Toaster offset={64} />
      </body>
    </html>
  );
}
