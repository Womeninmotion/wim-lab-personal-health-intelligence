import Link from "next/link";

export function Placeholder({
  en,
  zh,
  lede,
  points,
  note,
}: {
  en: string;
  zh: string;
  lede: string;
  points: string[];
  note?: string;
}) {
  return (
    <article>
      <p className="inline-block bg-soft px-2 py-1 text-[11px] font-medium tracking-wide">
        占位 · 这一页还没做完
      </p>
      <p lang="en" className="mt-4 font-display text-[11px] font-semibold tracking-[0.18em] text-ink/50">
        {en}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{zh}</h1>
      <p className="mt-4 max-w-2xl text-base leading-8">{lede}</p>
      {note ? <p className="mt-4 max-w-2xl border-l-2 border-orange pl-3 text-sm leading-6">{note}</p> : null}
      <ul className="mt-6 max-w-2xl list-disc space-y-2 pl-5 text-sm leading-6">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-8 inline-block text-sm underline decoration-orange decoration-2 underline-offset-4"
      >
        回到今日
      </Link>
    </article>
  );
}
