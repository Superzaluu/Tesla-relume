"use server";
// Server actions for /admin. Every write runs with the signed-in user's session,
// so Supabase Row Level Security only lets admins (table public.admins) through.
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer, requireAdmin } from "@/lib/supabase-auth";
import type { Stat } from "@/data/types";

type Supabase = Awaited<ReturnType<typeof createSupabaseServer>>;

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
};
const int = (form: FormData, name: string, fallback = 0) => {
  const value = Number.parseInt(text(form, name) ?? "", 10);
  return Number.isFinite(value) ? value : fallback;
};

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

/** Make the change visible on the site right away and return to the form. */
function done(path: string): never {
  revalidateTag("content");
  revalidatePath("/", "layout");
  redirect(`${path}?saved=1`);
}

/** Uploads an image to the public "site-images" bucket. Returns its URL, or null when no file was chosen. */
async function upload(supabase: Supabase, file: FormDataEntryValue | null, folder: string, back: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 4 * 1024 * 1024) fail(back, "Зураг 4 MB-аас том байна. Жижигрүүлээд дахин оруулна уу.");
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) fail(back, "Зөвхөн JPG, PNG, WebP зураг оруулна.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, { contentType: file.type });
  if (error) fail(back, `Зураг хадгалахад алдаа гарлаа: ${error.message}`);
  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}

// ---------- Sign in / out ----------

export async function signIn(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: text(form, "email") ?? "",
    password: (form.get("password") as string) ?? ""
  });
  if (error) return { error: "И-мэйл эсвэл нууц үг буруу байна." };
  redirect("/admin/");
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login/");
}

// ---------- Cards (model_listings + models) ----------

type StatInput = { value: string; unit: string; label: string; note: string; pValue: string; pUnit: string; pLabel: string };

function parseStats(json: string | null): Stat[] {
  const rows = JSON.parse(json || "[]") as StatInput[];
  const both = (cargo: string, passenger: string) =>
    passenger.trim() && passenger.trim() !== cargo.trim() ? { cargo: cargo.trim(), passenger: passenger.trim() } : cargo.trim();
  return rows
    .filter((row) => row.value.trim() || row.label.trim())
    .map((row) => {
      const stat: Stat = { value: both(row.value, row.pValue), unit: both(row.unit, row.pUnit), label: both(row.label, row.pLabel) };
      const note = Number.parseInt(row.note, 10);
      if (Number.isFinite(note)) stat.note = note;
      return stat;
    });
}

/** Spec table typed as lines: "Мөрийн нэр | утга 1 | утга 2". */
function parseSpec(value: string | null): string[][] | null {
  if (!value) return null;
  const rows = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
  return rows.length > 0 ? rows : null;
}

const QUICK_TYPES = ["van", "flatbed", "flatbed4", "box", "refrigerator"];
const DRIVES = ["FWD", "RWD", "AWD"];

function modelFields(form: FormData) {
  const quickType = text(form, "quick_type");
  const drive = text(form, "drive");
  return {
    name: text(form, "name"),
    description: text(form, "description"),
    tagline: text(form, "tagline"),
    quick_type: quickType && QUICK_TYPES.includes(quickType) ? quickType : null,
    quick_label: text(form, "quick_label"),
    drive: drive && DRIVES.includes(drive) ? drive : null,
    fuel: text(form, "fuel"), size: text(form, "size"), range: text(form, "range"), doors: text(form, "doors"),
    door_label: text(form, "door_label"), charge: text(form, "charge"), seats: text(form, "seats"),
    payload: text(form, "payload"), engine: text(form, "engine")
  };
}

export async function saveCard(form: FormData) {
  const { supabase } = await requireAdmin();
  const key = text(form, "key") ?? "";
  const slug = text(form, "model_slug") ?? "";
  const back = `/admin/cards/${encodeURIComponent(key)}/`;

  const model = modelFields(form);
  if (!model.name || !model.description) fail(back, "Нэр болон тайлбарыг заавал бөглөнө.");

  let stats: Stat[];
  try {
    stats = parseStats(text(form, "stats_json"));
  } catch {
    fail(back, "Үзүүлэлтийн мэдээлэл буруу байна.");
  }

  const image = await upload(supabase, form.get("image_file"), `models/${slug}`, back);
  const modelUpdate: Record<string, unknown> = { ...model, stats, spec: parseSpec(text(form, "spec_text")) };
  if (image) Object.assign(modelUpdate, { image_src: image, image_width: int(form, "image_file_width", 1200), image_height: int(form, "image_file_height", 720) });
  const { error: modelError } = await supabase.from("models").update(modelUpdate).eq("slug", slug);
  if (modelError) fail(back, `Загварыг хадгалахад алдаа гарлаа: ${modelError.message}`);

  const thumb = await upload(supabase, form.get("thumb_file"), `cards/${key}`, back);
  const variant = text(form, "variant");
  const listingUpdate: Record<string, unknown> = {
    category_id: text(form, "category_id"),
    description: text(form, "listing_description"),
    variant: variant === "cargo" || variant === "passenger" ? variant : null,
    sort: int(form, "sort"),
    active: form.get("active") === "on"
  };
  if (thumb) listingUpdate.thumb = thumb;
  const { error: listingError } = await supabase.from("model_listings").update(listingUpdate).eq("key", key);
  if (listingError) fail(back, `Картыг хадгалахад алдаа гарлаа: ${listingError.message}`);

  done(back);
}

export async function createCard(form: FormData) {
  const { supabase } = await requireAdmin();
  const back = "/admin/cards/new/";
  const categoryId = text(form, "category_id");
  if (!categoryId) fail(back, "Ангилал сонгоно уу.");

  let slug = text(form, "model_slug");
  if (!slug || slug === "__new") {
    slug = (text(form, "new_slug") ?? "").toLowerCase();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(back, "Хаяг (slug) зөвхөн латин жижиг үсэг, тоо, зураастай байна. Жишээ: ec75-max");
    const name = text(form, "new_name");
    const description = text(form, "new_description");
    if (!name || !description) fail(back, "Шинэ загварын нэр, тайлбарыг бөглөнө үү.");
    const { error } = await supabase.from("models").insert({ slug, name, description, quick_type: "van", drive: "RWD", stats: [] });
    if (error) fail(back, error.code === "23505" ? `"${slug}" хаягтай загвар аль хэдийн байна.` : `Загвар нэмэхэд алдаа гарлаа: ${error.message}`);
  }

  const variant = text(form, "variant");
  const base = variant === "cargo" || variant === "passenger" ? `${slug}-${variant}` : slug;
  const { data: taken } = await supabase.from("model_listings").select("key").like("key", `${base}%`);
  const used = new Set((taken ?? []).map((row: { key: string }) => row.key));
  let key = base;
  for (let i = 2; used.has(key); i++) key = `${base}-${i}`;

  const thumb = await upload(supabase, form.get("thumb_file"), `cards/${key}`, back);
  const { data: last } = await supabase.from("model_listings").select("sort").eq("category_id", categoryId).order("sort", { ascending: false }).limit(1);
  const { error } = await supabase.from("model_listings").insert({
    key, category_id: categoryId, model_slug: slug,
    variant: variant === "cargo" || variant === "passenger" ? variant : null,
    description: text(form, "listing_description"), thumb,
    sort: ((last?.[0] as { sort: number } | undefined)?.sort ?? -1) + 1, active: true
  });
  if (error) fail(back, `Карт нэмэхэд алдаа гарлаа: ${error.message}`);

  done(`/admin/cards/${encodeURIComponent(key)}/`);
}

/** Hide or restore a card (rows are never deleted). */
export async function setCardActive(form: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("model_listings").update({ active: form.get("active") === "true" }).eq("key", text(form, "key") ?? "");
  if (error) fail("/admin/cards/", error.message);
  done("/admin/cards/");
}

// ---------- Hero slides ----------

export async function saveHero(form: FormData) {
  const { supabase } = await requireAdmin();
  const slug = text(form, "model_slug") ?? "";
  const back = `/admin/hero/${encodeURIComponent(slug)}/`;
  const theme = text(form, "theme") === "dark" ? "dark" : "light";
  const themeSm = text(form, "theme_sm");
  const update: Record<string, unknown> = {
    sort: int(form, "sort"),
    active: form.get("active") === "on",
    theme,
    theme_sm: themeSm === "dark" || themeSm === "light" ? themeSm : null,
    sky: text(form, "sky") ?? "#d7e4ec",
    eyebrow: text(form, "eyebrow"),
    subtitle: text(form, "subtitle"),
    href: text(form, "href"),
    image_alt: text(form, "image_alt"),
    image_position: text(form, "image_position"),
    messages: (text(form, "messages") ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  };
  const image = await upload(supabase, form.get("image_file"), `hero/${slug}`, back);
  if (image) Object.assign(update, { image_src: image, image_width: int(form, "image_file_width", 1920), image_height: int(form, "image_file_height", 1080) });
  const { error } = await supabase.from("hero_slides").update(update).eq("model_slug", slug);
  if (error) fail(back, `Хадгалахад алдаа гарлаа: ${error.message}`);
  done(back);
}

export async function createHero(form: FormData) {
  const { supabase } = await requireAdmin();
  const back = "/admin/hero/";
  const slug = text(form, "model_slug");
  if (!slug) fail(back, "Загвар сонгоно уу.");
  const image = await upload(supabase, form.get("image_file"), `hero/${slug}`, back);
  if (!image) fail(back, "Слайдын зургийг оруулна уу.");
  const { data: last } = await supabase.from("hero_slides").select("sort").order("sort", { ascending: false }).limit(1);
  const { error } = await supabase.from("hero_slides").insert({
    model_slug: slug, image_src: image,
    image_width: int(form, "image_file_width", 1920), image_height: int(form, "image_file_height", 1080),
    theme: text(form, "theme") === "dark" ? "dark" : "light",
    sort: ((last?.[0] as { sort: number } | undefined)?.sort ?? -1) + 1, active: true
  });
  if (error) fail(back, error.code === "23505" ? "Энэ загварт слайд аль хэдийн байна." : `Слайд нэмэхэд алдаа гарлаа: ${error.message}`);
  done(`/admin/hero/${encodeURIComponent(slug)}/`);
}

/** Hide or restore a slide (rows are never deleted). */
export async function setHeroActive(form: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("hero_slides").update({ active: form.get("active") === "true" }).eq("model_slug", text(form, "model_slug") ?? "");
  if (error) fail("/admin/hero/", error.message);
  done("/admin/hero/");
}
