export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <img
        src="/wordmark-placeholder.svg"
        alt="WendyInMotion 临时字标。这不是正式标志。"
        width={180}
        height={36}
        className="h-9 w-auto"
      />
      <p className="mt-2 text-[11px] leading-4 text-ink/65">
        临时字标 · 正式标志可替换 public/wordmark-placeholder.svg
      </p>
      {compact ? null : (
        <p className="mt-1 text-[11px] leading-4 text-ink/50">
          当前文件不是官方标志，界面没有改绘它。
        </p>
      )}
    </div>
  );
}
