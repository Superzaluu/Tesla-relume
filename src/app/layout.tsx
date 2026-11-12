import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/site.css";
import "@/styles/model.css";
import "./globals.css";
import { SavingsProvider } from "@/components/forms/SavingsCalculator";
import { SiteChromeProvider } from "@/components/layout/SiteChrome";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { navigation } from "@/data/navigation";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Ruichi — Цахилгаан автомашин", template: "%s" },
  description: "Цахилгаан болон зай сунгагчтай Ruichi ачааны машин, фургон загварын танилцуулга, цэнэглэлт ба баталгааны мэдээлэл.",
  icons: { icon: "/assets/brand-logo-transparent.png" }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn" className={inter.variable}>
      <body>
        <SiteChromeProvider>
          <SavingsProvider>
            <SiteHeader navigation={navigation} />
            {children}
            <SiteFooter />
          </SavingsProvider>
        </SiteChromeProvider>
      </body>
    </html>
  );
}
