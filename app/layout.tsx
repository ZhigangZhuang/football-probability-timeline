import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "比赛胜率走势 | Football Probability Timeline",
  description: "横版短视频风格的足球胜平负概率走势可视化"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
