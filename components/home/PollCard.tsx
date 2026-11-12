"use client";
import { useEffect, useState } from "react";
import { VideoPoster } from "@/components/ui/VideoPoster";

const STORAGE_KEY = "ruichi-home-poll";

// "Монголын хүйтэн цахилгаан машин хэр бэ?" poll next to the −30°C test video.
// TODO: Санал хураалтыг серверт (жишээ нь Supabase) хадгалдаг болгох — одоо зөвхөн тухайн хөтөчид хадгалагдана.
export function PollCard({ choices }: { choices: string[] }) {
  const [votes, setVotes] = useState<number[]>(() => choices.map(() => 0));
  const [voted, setVoted] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved && Array.isArray(saved.votes) && saved.votes.length === choices.length) {
        setVotes(saved.votes);
        setVoted(saved.choice);
      }
    } catch { /* storage unavailable */ }
  }, [choices.length]);

  const vote = (choice: number) => {
    if (voted !== null) return;
    const next = votes.map((count, i) => (i === choice ? count + 1 : count));
    setVotes(next);
    setVoted(choice);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ votes: next, choice })); } catch { /* storage unavailable */ }
  };

  const total = votes.reduce((sum, count) => sum + count, 0);

  return (
    <div className="poll-card">
      <div className="poll-card__content">
        <div className="poll-card__top">
          <div className="section-title section-title--tagline">
            <p className="tagline">EC75 · −30°C хүйтний туршилт</p>
            <div className="section-title__text">
              <h2 className="h2">Монголын хүйтэн цахилгаан машин хэр бэ?</h2>
              <p className="text-medium">Та юу гэж бодож байгаагаа үлдүүнэ үү</p>
            </div>
          </div>
          <div className="poll-card__results">
            {choices.map((label, i) => (
              <div className="poll-card__result" key={label}>
                <p className="h2">{total ? Math.round((votes[i] / total) * 100) : 0}%</p>
                <p className="text-regular">{votes[i]} · {label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="actions actions--gap-24">
          {choices.map((label, i) => (
            <button className="btn btn--secondary" type="button" key={label} disabled={voted !== null} onClick={() => vote(i)}>{label}</button>
          ))}
        </div>
      </div>
      <VideoPoster className="poll-card__media" src="/assets/ec75-cold-test.mp4" label="EC75 −30°C хүйтний туршилтын видео тоглуулах">
        <img className="poll-card__image" src="/assets/ec75-cold-poster.jpg" alt="" loading="lazy" />
        <span className="poll-card__overlay" />
        <img className="poll-card__play" src="/assets/play-button.svg" width={64} height={64} alt="" />
      </VideoPoster>
    </div>
  );
}
