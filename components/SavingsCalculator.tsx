"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

// "Хэмнэлтийн тооцоолуур": estimates fuel vs. electricity savings for the
// visitor's current car. "БОНУС АВАХ" carries the inputs to /register/.

const MAKERS: Record<string, string[]> = {
  Toyota: ["Prius", "Camry", "Crown", "Harrier", "RAV4", "Land Cruiser", "Alphard", "Sienta"],
  Nissan: ["Leaf", "Note", "X-Trail", "Serena", "Tiida", "March", "Patrol", "Vanette"],
  Kia: ["K5", "K7", "Sportage", "Sorento", "Bongo", "Morning", "Carnival", "Rio"],
  Hyundai: ["Porter", "Tucson", "Santa Fe", "Sonata", "Accent", "Starex", "Avante", "Mighty"],
  Mazda: ["Demio", "CX-5", "CX-9", "Axela", "Atenza", "Bongo", "Familia"],
  Mitsubishi: ["Outlander", "Pajero", "Delica", "Lancer", "RVR", "Fuso Canter", "L200"]
};

const MESSAGES: Record<string, string> = {
  maker: "Үйлдвэрлэгчээ сонгоно уу.",
  model: "Эхлээд үйлдвэрлэгчээ сонгоод, дараа нь загвараа сонгоно уу.",
  year: "Үйлдвэрлэсэн оноо оруулна уу.",
  consumption: "Түлшний зарцуулалтаа оруулна уу.",
  distance: "Өдөрт явдаг зайгаа оруулна уу."
};

export const SAVINGS_STORAGE_KEY = "savingsVehicle";
export type SavedVehicle = { maker: string; model: string; year: string; consumption: string; distance: string };

const fmt = (value: number) => new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 0 }).format(Math.round(value));
const money = (value: number) => `${fmt(value)} ₮`;

type Result = SavedVehicle & {
  monthlyLitres: number; yearlyLitres: number; monthlySaving: number; yearlySaving: number; serviceSaving: number; yearlyHours: number;
};

function calculate(v: SavedVehicle): Result {
  const dailyKm = Number(v.distance), consumption = Number(v.consumption);
  const monthlyKm = dailyKm * 30, yearlyKm = dailyKm * 365;
  const monthlyLitres = (monthlyKm * consumption) / 100, yearlyLitres = (yearlyKm * consumption) / 100;
  const fuelCost = monthlyLitres * 3700, electricityCost = monthlyKm * 0.22 * 280;
  const monthlySaving = Math.max(0, fuelCost - electricityCost);
  return {
    ...v, monthlyLitres, yearlyLitres, monthlySaving, yearlySaving: monthlySaving * 12,
    serviceSaving: yearlyKm * 45, yearlyHours: ((monthlyLitres / 50) * 0.5) * 12
  };
}

const SavingsContext = createContext<() => void>(() => {});

export function SavingsTrigger() {
  const open = useContext(SavingsContext);
  return (
    <button type="button" className="btn btn--secondary saving-calculator__trigger" aria-haspopup="dialog" onClick={open}>
      Хэмнэлтийн тооцоолуур
    </button>
  );
}

export function SavingsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [maker, setMaker] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const makerRef = useRef<HTMLSelectElement>(null);
  const router = useRouter();

  const show = () => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setMaker("");
    setResult(null);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    lastFocus.current?.focus();
  };

  useEffect(() => {
    document.body.classList.toggle("savings-modal-open", open);
    if (!open) return;
    makerRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "");
    setResult(calculate({ maker: get("maker"), model: get("model"), year: get("year"), consumption: get("consumption"), distance: get("distance") }));
  };

  const claimBonus = () => {
    if (!result) return;
    const { maker: m, model, year, consumption, distance } = result;
    try { sessionStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify({ maker: m, model, year, consumption, distance })); } catch { /* storage unavailable */ }
    setOpen(false);
    router.push("/register/");
  };

  // Custom Mongolian validation messages instead of the browser defaults.
  const validation = {
    onInvalid: (event: FormEvent<HTMLInputElement | HTMLSelectElement>) => {
      const field = event.currentTarget;
      field.setCustomValidity(MESSAGES[field.name] ?? "");
    },
    onInput: (event: FormEvent<HTMLInputElement | HTMLSelectElement>) => event.currentTarget.setCustomValidity("")
  };

  const models = MAKERS[maker] ?? [];

  return (
    <SavingsContext.Provider value={show}>
      {children}
      <div className="savings-modal" hidden={!open}>
        <div className="savings-modal__backdrop" onClick={close} />
        <section className="savings-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="savings-title">
          <button className="savings-modal__close" type="button" aria-label="Хаах" onClick={close}>×</button>
          <header className="savings-modal__header">
            <h2 className="savings-modal__title" id="savings-title">Хэмнэлтийн тооцоолуур</h2>
            <p className="savings-modal__intro">Одоогийн машиныхаа мэдээллийг оруулаад цахилгаан машинд шилжихэд гарах ойролцоох хэмнэлтээ тооцоолоорой.</p>
          </header>

          {open && !result && (
            <form className="savings-form" onSubmit={onSubmit}>
              <div className="savings-field">
                <label htmlFor="saving-maker">Үйлдвэрлэгч</label>
                <select id="saving-maker" name="maker" required ref={makerRef} value={maker} {...validation} onChange={(event) => { event.currentTarget.setCustomValidity(""); setMaker(event.target.value); }}>
                  <option value="">Сонгоно уу</option>
                  {Object.keys(MAKERS).map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="savings-field">
                <label htmlFor="saving-model">Загвар</label>
                <select id="saving-model" name="model" required disabled={!models.length} {...validation} onChange={(event) => event.currentTarget.setCustomValidity("")} key={maker}>
                  <option value="">{models.length ? "Сонгоно уу" : "Эхлээд үйлдвэрлэгчээ сонгоно уу"}</option>
                  {models.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="savings-field">
                <label htmlFor="saving-year">Он</label>
                <input id="saving-year" name="year" type="number" min={1980} max={2026} placeholder="Жишээ: 2018" required {...validation} />
              </div>
              <div className="savings-field">
                <label htmlFor="saving-consumption">Түлш зарцуулалт (л/100 км)</label>
                <input id="saving-consumption" name="consumption" type="number" min={1} max={50} step=".1" inputMode="decimal" placeholder="Жишээ: 10.5" required {...validation} />
              </div>
              <div className="savings-field savings-field--full">
                <label htmlFor="saving-distance">Өдөр таны явдаг зай (км)</label>
                <input id="saving-distance" name="distance" type="number" min={1} max={2000} inputMode="decimal" placeholder="Жишээ: 60" required {...validation} />
              </div>
              <button className="btn btn--primary savings-form__submit" type="submit">ТООЦОО ГАРГАХ</button>
            </form>
          )}

          {result && (
            <div className="savings-results" aria-live="polite">
              <p className="savings-results__vehicle">Таны машин: <strong>{`${result.maker} ${result.model} (${result.year})`}</strong></p>
              <h3 className="savings-results__title">Та энэ загвараар ойролцоогоор хэмнэнэ</h3>
              <div className="savings-results__grid">
                <ResultItem label="Сарын түлшний хэрэглээ" value={`${fmt(result.monthlyLitres)} л`} />
                <ResultItem label="Жилийн түлшний хэрэглээ" value={`${fmt(result.yearlyLitres)} л`} />
                <ResultItem label="Сарын мөнгөн хэмнэлт" value={money(result.monthlySaving)} />
                <ResultItem label="Жилийн мөнгөн хэмнэлт" value={money(result.yearlySaving)} />
                <ResultItem label="Үйлчилгээний зардлын хэмнэлт" value={`${money(result.serviceSaving)} / жил`} />
                <ResultItem label="Колонкид очерлох цагийн хэмнэлт" value={`${fmt(result.yearlyHours)} цаг / жил`} />
              </div>
              <p className="savings-results__note">Тооцоо нь таны оруулсан түлшний зарцуулалт, шатахууны жишиг үнэ 3,700 ₮/л, цахилгаан зарцуулалт 22 кВт·ц/100 км, цэнэгийн үнэ 280 ₮/кВт·ц гэсэн таамагт үндэслэнэ.</p>
              <div className="savings-choice">
                <p className="savings-choice__text">Та энэ мэдээллээ бүртгүүлж 100,000 ₮ бонус эрх аваарай</p>
                <div className="savings-choice__buttons">
                  <button className="btn btn--primary" type="button" onClick={claimBonus}>БОНУС АВАХ</button>
                  <button className="btn btn--secondary" type="button" onClick={close}>ГАРАХ</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </SavingsContext.Provider>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="savings-result">
      <span className="savings-result__label">{label}</span>
      <strong className="savings-result__value">{value}</strong>
    </div>
  );
}
