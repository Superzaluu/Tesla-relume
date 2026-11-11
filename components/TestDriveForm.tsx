"use client";
import { useState, type FormEvent } from "react";

// TODO: Маягтын мэдээллийг серверт (жишээ нь Supabase) хадгалах.
export function TestDriveForm({ models }: { models: string[] }) {
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) setSent(true);
  };
  return (
    <form className="test-drive__form" onSubmit={onSubmit}>
      <label>Нэр<input name="name" type="text" autoComplete="name" required /></label>
      <label>Утас<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required /></label>
      <label>Сонирхож буй загвар
        <select name="model" required defaultValue="">
          <option value="">Загвараа сонгоно уу</option>
          {models.map((model) => <option key={model}>{model}</option>)}
        </select>
      </label>
      <button className="btn btn--primary" type="submit" disabled={sent}>Хүсэлт илгээх</button>
      <p className="test-drive__success" hidden={!sent} role="status">Хүсэлтийг хүлээн авлаа. Бид тантай удахгүй холбогдоно.</p>
    </form>
  );
}
