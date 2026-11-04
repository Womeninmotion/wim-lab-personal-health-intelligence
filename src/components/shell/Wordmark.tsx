import Image from "next/image";
import Link from "next/link";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="WendyInMotion 首页" className="block">
      <Image
        src="/wendyinmotion-logo.png"
        alt="WendyInMotion"
        width={1305}
        height={280}
        priority
        className={compact ? "h-auto w-[128px]" : "h-auto w-[192px] max-w-full"}
      />
    </Link>
  );
}
