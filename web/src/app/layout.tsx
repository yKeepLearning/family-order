import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家庭厨房",
  description: "家庭内部点菜系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="max-w-lg mx-auto min-h-screen bg-white">{children}</body>
    </html>
  );
}
