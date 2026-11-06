import { Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import {ConvexClientProvider } from "./ConvexClientProvider";
const geistSans = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://codedevai.vercel.app"),
  title: {
    default: "CodeDevAI - Browser IDE that turns prompts into running React apps",
    template: "%s | CodeDevAI",
  },
  description:
    "CodeDevAI is a browser IDE that turns a written prompt into a running React project. Describe what you want, AI writes the files, and the result opens in an editor with a live preview. No local setup, no build step.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://codedevai.vercel.app/",
    siteName: "CodeDevAI",
    title: "CodeDevAI - Browser IDE that turns prompts into running React apps",
    description:
      "Describe what you want, AI writes the files, and the result opens in an editor with a live preview. No local setup, no build step.",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
        alt: "CodeDevAI",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "CodeDevAI - Browser IDE that turns prompts into running React apps",
    description:
      "Describe what you want, AI writes the files, and the result opens in an editor with a live preview. No local setup, no build step.",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CodeDevAI",
  url: "https://codedevai.vercel.app/",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Browser IDE that turns a written prompt into a running React project with a live preview. No local setup, no build step.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Siva Dheeraj",
    url: "https://sivadheeraj.vercel.app/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ConvexClientProvider>
        <Provider>
           {children}
        </Provider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
