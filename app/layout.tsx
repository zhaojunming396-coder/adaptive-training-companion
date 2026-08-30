import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "训练助手",
  description: "数据驱动的训练记录与重量更新反馈工具。",
  icons: {
    icon: "/src/pages/workouts/icons/icon-192.png",
    shortcut: "/src/pages/workouts/icons/icon-192.png",
    apple: "/src/pages/workouts/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
