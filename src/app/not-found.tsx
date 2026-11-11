import Link from "next/link";

export default function NotFound() {
  return (
    <main className="tw section grid min-h-[70vh] place-items-center pt-[calc(var(--navbar-height)+4rem)]">
      <div className="section-title section-title--narrow">
        <p className="tagline">404</p>
        <h1 className="h2">Хуудас олдсонгүй</h1>
        <p className="text-medium">Хаяг буруу эсвэл хуудас шилжсэн байж магадгүй.</p>
        <div className="actions justify-center">
          <Link className="btn btn--primary" href="/">Нүүр хуудас руу буцах</Link>
        </div>
      </div>
    </main>
  );
}
