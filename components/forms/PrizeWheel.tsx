"use client";
// «Азын хүрд» shown after a pre-order (user test #1, 2026-11-23, item 8): the buyer spins, wins one of the
// prizes (every slot wins) and gets a voucher with a barcode and the chosen vehicle's photo, to show when the
// vehicle is handed over. The server picks the prize (spinPrize); the wheel only animates to it.
import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { spinPrize, type SpinResult } from "@/app/preorder/prize-actions";
import { prizeByKey, WHEEL } from "@/data/prizes";

const SLOT = 360 / WHEEL.length;
const FILL = ["#0f5a3a", "#ffffff", "#f2b705", "#eef5f3"];
const TEXT = ["#ffffff", "#0f5a3a", "#5c4300", "#0f5a3a"];
const SPIN_MS = 5200;

/** Messenger page for the voucher (env NEXT_PUBLIC_FACEBOOK_PAGE, e.g. "ruichimongolia"); empty = not set up yet. */
const FB_PAGE = process.env.NEXT_PUBLIC_FACEBOOK_PAGE ?? "";

function slice(i: number) {
  const a0 = ((i * SLOT - 90) * Math.PI) / 180, a1 = (((i + 1) * SLOT - 90) * Math.PI) / 180;
  const r = 150;
  return `M150 150 L${150 + r * Math.cos(a0)} ${150 + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${150 + r * Math.cos(a1)} ${150 + r * Math.sin(a1)} Z`;
}

function Wheel({ rotation, spinning }: { rotation: number; spinning: boolean }) {
  return (
    <div className="pwheel">
      <span className="pwheel__pointer" aria-hidden="true" />
      <svg
        viewBox="0 0 300 300" className="pwheel__disc" aria-hidden="true"
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(.15,.7,.1,1)` : "none" }}
      >
        {WHEEL.map((key, i) => (
          <g key={i}>
            <path d={slice(i)} fill={FILL[i % 4]} stroke="#083d28" strokeWidth="1.5" />
            {/* Along the radius, from the hub out to the rim, so long names ("Ком түлхүүр") fit. */}
            <text
              x="276" y="155" textAnchor="end" fontSize="14" fontWeight="800" fill={TEXT[i % 4]}
              transform={`rotate(${i * SLOT + SLOT / 2 - 90} 150 150)`}
            >
              {prizeByKey(key)?.short}
            </text>
          </g>
        ))}
        <circle cx="150" cy="150" r="148" fill="none" stroke="#083d28" strokeWidth="5" />
        {WHEEL.map((_, i) => {
          const a = ((i * SLOT - 90) * Math.PI) / 180;
          return <circle key={i} cx={150 + 140 * Math.cos(a)} cy={150 + 140 * Math.sin(a)} r="4" fill="#ffe58a" />;
        })}
        <circle cx="150" cy="150" r="26" fill="#083d28" />
        <text x="150" y="156" textAnchor="middle" fontSize="16" fontWeight="800" fill="#ffe58a">₮</text>
      </svg>
    </div>
  );
}

export function Barcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) JsBarcode(ref.current, value, { format: "CODE128", displayValue: false, height: 56, margin: 0, width: 2, lineColor: "#14213d", background: "transparent" });
  }, [value]);
  return <svg ref={ref} className="pvoucher__barcode" role="img" aria-label={`Бар код ${value}`} />;
}

/** The voucher card: vehicle photo, prize, code with barcode, how to claim it; printable. */
export function Voucher({ result }: { result: Extract<SpinResult, { ok: true }> }) {
  const messenger = FB_PAGE ? `https://m.me/${encodeURIComponent(FB_PAGE)}?ref=${encodeURIComponent(`voucher_${result.code}`)}` : "";
  const [copied, setCopied] = useState(false);
  return (
    <div className="pvoucher-wrap">
      <article className="pvoucher" aria-label="Шагналын купон">
        <div className="pvoucher__photo">
          <img src={result.image} alt={result.model} width={400} height={240} />
          <span className="pvoucher__brand">Ruichi</span>
        </div>
        <div className="pvoucher__body">
          <p className="pvoucher__kicker">Шагналын купон · {result.model}</p>
          <p className="pvoucher__prize">{result.prizeLabel}</p>
          <p className="pvoucher__claim">Машинаа хүлээн авахдаа энэ купоныг үзүүлж шагналаа авна. Нэг машинд нэг шагнал.</p>
          <div className="pvoucher__code">
            <Barcode value={result.code} />
            <button
              type="button" className="pvoucher__code-text" title="Хуулах"
              onClick={() => { navigator.clipboard?.writeText(result.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {}); }}
            >
              {result.code} <small>{copied ? "хуулсан ✓" : "хуулах"}</small>
            </button>
          </div>
          <p className="pvoucher__secure">🔒 Код нь таны захиалгад тусгайлан үүссэн, давтагдашгүй.</p>
        </div>
      </article>

      <div className="pvoucher__actions">
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>Хэвлэх / PDF хадгалах</button>
        {messenger
          ? <a className="btn pvoucher__messenger" href={messenger} target="_blank" rel="noopener">Messenger-ээр авах</a>
          : <span className="pvoucher__messenger is-off" title="NEXT_PUBLIC_FACEBOOK_PAGE тохируулаагүй">Messenger-ээр авах (тест: Page холбогдоогүй)</span>}
        <a className="btn btn--secondary" href={result.voucherUrl}>Купоны холбоос</a>
      </div>
      <p className="pvoucher__sent" role="status">
        {result.sent === "sent" && result.email ? `Купоныг ${result.email} хаяг руу илгээлээ.`
          : result.sent === "failed" ? "И-мэйл илгээж чадсангүй. Купоныг хэвлэж эсвэл холбоосыг хадгалаарай."
          : "Тест горим: и-мэйл илгээх (n8n) хараахан холбогдоогүй. Купоныг хэвлэж эсвэл холбоосыг хадгалаарай."}
      </p>
    </div>
  );
}

export function PrizeWheel({ preorderId }: { preorderId: string }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    const res = await spinPrize(preorderId);
    if (!res.ok) { setResult(res); setSpinning(false); return; }
    setResult(res);
    // Seven full turns, then the won slot's centre under the pointer (the pointer is at the top).
    const target = 360 * 7 + (360 - (res.slot * SLOT + SLOT / 2));
    requestAnimationFrame(() => setRotation(target));
    window.setTimeout(() => { setRevealed(true); setSpinning(false); }, SPIN_MS + 200);
  };

  if (result?.ok && revealed) {
    return (
      <section className="pwin" aria-live="polite">
        <div className="pwin__burst" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <span key={i} style={{ ["--i" as string]: i }} />)}</div>
        <p className="pwin__title">Баяр хүргэе! Та <b>{result.prizeLabel}</b> хожлоо</p>
        <Voucher result={result} />
      </section>
    );
  }

  return (
    <section className="pspin" aria-labelledby="pspin-title">
      <h3 id="pspin-title" className="pspin__title">Азын хүрдээ эргүүлээрэй</h3>
      <p className="pspin__text">Захиалга өгсөн хүн бүр заавал нэг шагнал хожно. Шагналаа машинаа хүлээн авахдаа авна.</p>
      <Wheel rotation={rotation} spinning={spinning} />
      <button type="button" className="btn btn--primary pspin__button" onClick={spin} disabled={spinning}>
        {spinning ? "Эргэж байна…" : "Хүрд эргүүлэх"}
      </button>
      {result && !result.ok && <p className="pspin__error" role="alert">{result.error}</p>}
    </section>
  );
}
