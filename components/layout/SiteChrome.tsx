"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

// Lets the homepage hero tell the navbar whether the current slide is light
// (dark navbar text) or dark (white navbar text).
type Chrome = { heroLight: boolean; setHeroLight: (light: boolean) => void };

const ChromeContext = createContext<Chrome>({ heroLight: false, setHeroLight: () => {} });

export function SiteChromeProvider({ children }: { children: ReactNode }) {
  const [heroLight, setHeroLight] = useState(false);
  return <ChromeContext.Provider value={{ heroLight, setHeroLight }}>{children}</ChromeContext.Provider>;
}

export const useSiteChrome = () => useContext(ChromeContext);
