import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
export const metadata: Metadata = { title: "Ruichi — Цахилгаан автомашин", description: "Ruichi цахилгаан арилжааны автомашин" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="mn"><body><SiteHeader />{children}<SiteFooter /></body></html>; }
