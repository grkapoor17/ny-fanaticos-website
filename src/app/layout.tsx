import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = "https://nyfanaticos.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NY Fanaticos | New York City Football Club",
    template: "%s | NY Fanaticos",
  },
  description:
    "Official website of NY Fanaticos, an independent football club competing in New York City. Fixtures, results, squad, club news and more.",
  openGraph: {
    title: "NY Fanaticos | New York City Football Club",
    description:
      "Official website of NY Fanaticos, an independent football club competing in New York City. Fixtures, results, squad, club news and more.",
    url: siteUrl,
    siteName: "NY Fanaticos",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NY Fanaticos | New York City Football Club",
    description:
      "Official website of NY Fanaticos, an independent football club competing in New York City.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bebas.variable} ${inter.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
