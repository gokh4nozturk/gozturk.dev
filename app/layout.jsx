import { cn } from "@lib/utils";
import "@styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "components/Header";
import Navigation from "components/Navigation";
import { ThemeProvider } from "components/ThemeProvider";
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
  description: "Personal website of Gökhan Öztürk, a developer and crafter.",
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
    "developer",
    "crafter",
    "web developer",
    "software engineer",
    "programmer",
    "frontend developer",
  ],
  metadataBase: new URL("https://gozturk.dev"),
  openGraph: {
    description: "Personal website of Gökhan Öztürk, a developer and crafter.",
    images: [
      {
        alt: "Gökhan Öztürk – Developer, crafter",
        height: 630,
        type: "image/png",
        url: "https://gozturk.dev/api/og",
        width: 1200,
      },
    ],
    title: "Gökhan Öztürk – Developer, crafter",
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
    default: "Gökhan Öztürk – Developer, crafter",
    template: "%s | Gökhan Öztürk – Developer, crafter",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@gokh4nozturk",
    description: "Personal website of Gökhan Öztürk, a developer and crafter.",
    images: [
      {
        url: "https://gozturk.dev/api/og",
      },
    ],
    site: "@gokh4nozturk",
    title: "Gökhan Öztürk – Developer, crafter",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "https://gozturk.dev/#person",
      "@type": "Person",
      description: "Personal website of Gökhan Öztürk, a developer and crafter.",
      jobTitle: "Developer",
      name: "Gökhan Öztürk",
      sameAs: ["https://github.com/gokh4nozturk", "https://twitter.com/gokh4nozturk"],
      url: "https://gozturk.dev",
    },
    {
      "@id": "https://gozturk.dev/#website",
      "@type": "WebSite",
      description: "Personal website of Gökhan Öztürk, a developer and crafter.",
      inLanguage: "en",
      name: "Gökhan Öztürk – Developer, crafter",
      publisher: { "@id": "https://gozturk.dev/#person" },
      url: "https://gozturk.dev",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw injection
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      </head>
      <body
        className={cn(
          "mx-auto grid h-dvh grid-rows-[auto_1fr] items-center bg-p3-background-light px-4 pt-4 font-sans text-p3-text",
          "tracking-tight selection:bg-p3-primary-light selection:text-p3-text sm:max-w-3xl sm:px-10 sm:pt-10",
          "dark:bg-p3-background dark:text-p3-text-dark dark:selection:bg-p3-accent-dark dark:selection:text-p3-text-dark",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Header />
          <main className="flex h-full flex-col justify-between">{children}</main>
          <Navigation />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <Toaster offset={64} />
      </body>
    </html>
  );
}
