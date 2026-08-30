import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "训练助手",
  description: "数据驱动的训练记录与重量更新反馈工具。",
};

export default function Home() {
  redirect("/src/pages/workouts/index.html#today");
}
