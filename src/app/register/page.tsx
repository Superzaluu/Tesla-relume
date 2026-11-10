import { LeadForm } from "@/components/Forms";
export const metadata = { title: "Бүртгэл — Ruichi" };
export default function RegisterPage() { return <main className="bg-brand-mist pt-28"><section className="page-shell section"><p className="font-semibold text-brand">Ruichi</p><h1 className="mt-2 text-4xl font-bold">Урьдчилсан бүртгэл</h1><p className="mt-3 max-w-2xl text-slate-600">Сонирхож буй загвар болон холбоо барих мэдээллээ үлдээгээрэй.</p><div className="mt-8"><LeadForm registration /></div></section></main>; }
