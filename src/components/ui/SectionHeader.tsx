export function SectionHeader({
  en,
  zh,
  id,
}: {
  en: string;
  zh: string;
  id?: string;
}) {
  return (
    <div className="mb-5 border-b border-line pb-3">
      <p lang="en" className="font-display text-[11px] font-semibold tracking-[0.2em] text-ink/55">
        {en}
      </p>
      <h2 id={id} className="mt-1 font-display text-[1.65rem] font-semibold leading-tight tracking-tight">
        {zh}
      </h2>
    </div>
  );
}
