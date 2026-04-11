import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import SiteBackgroundEffects from "./_components/SiteBackgroundEffects";
import ScrollToTop from "./_components/ScrollToTop";

export const metadata: Metadata = {
  title: "RankersHub — Best Commerce Classes in Pune",
  description:
    "Join Maharashtra Board-focused 11th & 12th Commerce Coaching at RankersHub, Pune. Top faculty, 3X revision, and expert mentorship for CA/CS aspirants.",
  keywords: "commerce classes pune, 11th 12th commerce coaching pune, rankershub, accountancy coaching pune",
  openGraph: {
    title: "RankersHub — Best Commerce Classes in Pune",
    description: "Maharashtra Board-focused 11th & 12th Commerce Coaching with top faculty.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteBackgroundEffects />
        <ScrollToTop />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
