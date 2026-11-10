import Link from "next/link";
import type { ComponentProps } from "react";

const styles = "inline-flex min-h-11 min-w-60 items-center justify-center rounded-xl border border-brand bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-brand focus-ring";
export function Button({ className = "", ...props }: ComponentProps<"button">) { return <button className={`${styles} ${className}`} {...props} />; }
export function ButtonLink({ className = "", ...props }: ComponentProps<typeof Link>) { return <Link className={`${styles} ${className}`} {...props} />; }
