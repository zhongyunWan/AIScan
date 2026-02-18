import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_NAME} | 4x20 AI Radar`,
  description: "四大方向各 20 条 AI 趋势，中文摘要 + 原文链接。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
