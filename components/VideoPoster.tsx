"use client";
import { useState, type ReactNode } from "react";

// Shows a poster button; clicking it swaps in the video player (keeps the page light until then).
export function VideoPoster({ src, label, className, children }: { src: string; label: string; className: string; children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <div className={className}>
        <video className="poll-card__video" src={src} controls autoPlay playsInline aria-label={label} ref={(node) => node?.focus()} />
      </div>
    );
  }
  return (
    <button className={className} type="button" aria-label={label} onClick={() => setPlaying(true)}>
      {children}
    </button>
  );
}
