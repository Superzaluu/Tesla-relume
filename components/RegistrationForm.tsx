"use client";
import { useEffect, useState, type FormEvent } from "react";
import { SAVINGS_STORAGE_KEY, type SavedVehicle } from "@/components/SavingsCalculator";

export type ModelGroup = { id: string; label: string; options: { value: string; label: string }[] };

const MAX_PER_GROUP = 2;

// Bonus registration: prefilled from the savings calculator; the visitor may
// pick up to two models, all from one category.
// TODO: Илгээсэн мэдээллийг серверт (жишээ нь Supabase) хадгалах.
export function RegistrationForm({ groups }: { groups: ModelGroup[] }) {
  const [vehicle, setVehicle] = useState<SavedVehicle | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    try { setVehicle(JSON.parse(sessionStorage.getItem(SAVINGS_STORAGE_KEY) ?? "null")); } catch { setVehicle(null); }
  }, []);

  const activeGroup = groups.find((group) => group.options.some((option) => selected.includes(option.value)))?.id;

  const toggle = (value: string, checked: boolean) => {
    if (!checked) { setSelected((list) => list.filter((item) => item !== value)); setError(""); return; }
    const group = groups.find((g) => g.options.some((option) => option.value === value));
    const inGroup = selected.filter((item) => group?.options.some((option) => option.value === item));
    if (inGroup.length >= MAX_PER_GROUP) { setError("Нэг ангиллаас хамгийн ихдээ 2 загвар сонгоно."); return; }
    setError("");
    setSelected((list) => [...list, value]);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (selected.length === 0) { setError("Сонирхож буй дор хаяж нэг загвараа сонгоно уу."); return; }
    setError("");
    setSent(true);
  };

  const field = (id: string, name: string, label: string, value = "", full = false) => (
    <div className={`savings-field${full ? " savings-field--full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} readOnly value={value} />
    </div>
  );

  return (
    <form className="registration-form" onSubmit={onSubmit}>
      <fieldset className="registration-form__fieldset">
        <legend>Тооцооллын мэдээлэл</legend>
        <div className="registration-form__grid">
          {field("reg-maker", "previousMaker", "Үйлдвэрлэгч", vehicle?.maker)}
          {field("reg-model", "previousModel", "Загвар", vehicle?.model)}
          {field("reg-year", "previousYear", "Он", vehicle?.year)}
          {field("reg-consumption", "previousConsumption", "Түлш зарцуулалт", vehicle?.consumption ? `${vehicle.consumption} л/100 км` : "")}
          {field("reg-distance", "previousDistance", "Өдөр тутмын явалт", vehicle?.distance ? `${vehicle.distance} км` : "", true)}
        </div>
      </fieldset>

      <fieldset className="registration-form__fieldset">
        <legend>Таны мэдээлэл</legend>
        <div className="registration-form__grid">
          <div className="savings-field savings-field--full"><label htmlFor="reg-facebook">Facebook хаяг</label><input id="reg-facebook" name="facebook" autoComplete="url" placeholder="https://facebook.com/..." required /></div>
          <div className="savings-field"><label htmlFor="reg-name">Нэр</label><input id="reg-name" name="name" autoComplete="name" required /></div>
          <div className="savings-field"><label htmlFor="reg-phone">Утас</label><input id="reg-phone" name="phone" type="tel" autoComplete="tel" pattern="[0-9+ -]{8,}" placeholder="9911 2233" required /></div>
        </div>
      </fieldset>

      <fieldset className="registration-form__fieldset registration-models">
        <legend>Сонирхож буй загвар</legend>
        <p className="registration-models__hint">Нэг ангиллаас ихдээ 2 загвар сонгоно. Өөр ангиллаас зэрэг сонгох боломжгүй.</p>
        <div className="registration-models__groups">
          {groups.map((group) => {
            const blocked = !!activeGroup && activeGroup !== group.id;
            return (
              <div className={`registration-models__group${blocked ? " is-disabled" : ""}`} key={group.id}>
                <h2>{group.label}</h2>
                {group.options.map((option) => (
                  <label key={option.value}>
                    <input type="checkbox" name="models" value={option.value} disabled={blocked} checked={selected.includes(option.value)} onChange={(e) => toggle(option.value, e.target.checked)} /> {option.label}
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      </fieldset>
      <p className="registration-form__error" aria-live="polite">{error}</p>
      <button className="btn btn--primary" type="submit" disabled={sent}>БҮРТГҮҮЛЖ БОНУС АВАХ</button>
      <p className="registration-form__success" hidden={!sent}>Таны хүсэлтийг хүлээн авлаа. Манай баг тантай холбогдоно.</p>
    </form>
  );
}
