import type { Metadata } from "next";
import { SavingsPage } from "@/components/savings/SavingsPage";
import { getCalculatorModel } from "@/data/content";

// «Хэмнэлтийн тооцоолуур» on its own page (user test #1, 2026-11-23, item 6). Model pages link here with their
// model (?model=ec75&variant=cargo); the models and fuel prices come from the root layout's SavingsProvider.
export const metadata: Metadata = {
  title: "Хэмнэлтийн тооцоолуур — Ruichi",
  description: "Өдөрт явах зайгаа оруулаад Ruichi цахилгаан машинаар жилд хэр их түлшний зардал хэмнэхээ хараарай."
};

export default async function Page({ searchParams }: { searchParams: Promise<{ model?: string; variant?: string }> }) {
  const { model = "", variant = "" } = await searchParams;
  const slug = model.replace(/[^a-z0-9-]/gi, "");
  // A model page whose model is not in the menu (C9) still gets its own entry.
  const extra = slug ? await getCalculatorModel(slug) : undefined;
  const initial = slug ? `${slug}|${variant === "cargo" || variant === "passenger" ? variant : ""}` : undefined;
  return (
    <main className="savings-main">
      <SavingsPage initial={initial} extra={extra} />
    </main>
  );
}
