import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "今日 · Personal Health Intelligence",
    template: "%s · Personal Health Intelligence",
  },
  description:
    "WendyInMotion 的个人健康情报原型。当前界面使用虚构示例，未连接设备、日历或 AI。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hans" className={`${montserrat.variable} ${poppins.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-body">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
