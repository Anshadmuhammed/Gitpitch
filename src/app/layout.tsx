import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"

export const metadata: Metadata = {
  title: "Gitpitch — India's GitHub-powered Tech Talent Platform",
  description: "Find and recruit top software engineers in India based on actual GitHub commits and code, not resumes. Skip LinkedIn and hire proven talent.",
  openGraph: {
    title: "Gitpitch — Tech Talent Network",
    description: "India's best engineers aren't on LinkedIn. They're on GitHub.",
    url: "https://gitpitch.demo",
    siteName: "Gitpitch",
    images: [{ url: "https://gitpitch.demo/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gitpitch — Tech Talent Network",
    description: "Hire India's top software engineers based on real code.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
