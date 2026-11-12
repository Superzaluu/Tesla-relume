import type { Metadata } from "next";
import { RegistrationForm, type ModelGroup } from "@/components/forms/RegistrationForm";

export const metadata: Metadata = { title: "Бонус бүртгэл — Ruichi" };

const groups: ModelGroup[] = [
  { id: "passenger", label: "Зорчигч тээвэр", options: [
    { value: "EC75", label: "EC75" }, { value: "EC75 Pro", label: "EC75 Pro" }, { value: "R5 зорчигч", label: "R5 зорчигч" }, { value: "R5 Pro зорчигч", label: "R5 Pro зорчигч" }
  ] },
  { id: "van", label: "Ачаа хүргэлт фургон", options: [
    { value: "EC75 ачаа", label: "EC75" }, { value: "EC35II", label: "EC35II" }, { value: "R5 ачаа", label: "R5" }, { value: "R5 Pro ачаа", label: "R5 Pro" }
  ] },
  { id: "flatbed", label: "Задгай тэвштэй", options: [
    { value: "C5", label: "C5" }, { value: "C5L", label: "C5L" }, { value: "C3", label: "C3" }, { value: "ED71S", label: "ED71S" }
  ] },
  { id: "special", label: "Тусгай зориулалт", options: [
    { value: "C3 хөргүүртэй", label: "C3 хөргүүртэй" }, { value: "R5 үйлчилгээ", label: "R5 үйлчилгээ" }, { value: "C5 дрон", label: "C5 дрон" }
  ] }
];

export default function RegisterPage() {
  return (
    <main className="registration-page">
      <section className="registration">
        <div className="registration__inner">
          <div className="registration__bonus" aria-hidden="true">
            <div className="registration__dollars">{Array.from({ length: 6 }, (_, i) => <i key={i}>$</i>)}</div>
            <span>100,000 ₮</span>
            <strong>БОНУС ЭРХ</strong>
          </div>
          <div className="registration__content">
            <p className="tagline">БОНУС БҮРТГЭЛ</p>
            <h1 className="h1">100,000 ₮ БОНУСАА АВААРАЙ</h1>
            <p className="text-medium">Доорх мэдээллээ илгээгээд өөрт тохирох цахилгаан автомашины зөвлөгөө болон бонус эрхээ аваарай.</p>
          </div>
          <RegistrationForm groups={groups} />
        </div>
      </section>
    </main>
  );
}
