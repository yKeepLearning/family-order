"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="bg-white pt-12 pb-8 text-center">
        <div className="text-5xl mb-3">🏠</div>
        <h1 className="text-xl font-semibold mb-1">家庭厨房</h1>
        <p className="text-base font-semibold mt-2">饱腹训练即将开始！</p>
      </div>

      <div className="flex-1 px-4 pb-8">
        <p className="text-xs text-muted-foreground text-center mb-5">请选择你的身份</p>

        <button
          onClick={() => router.push("/chef")}
          className="w-full border rounded-2xl p-5 flex items-center gap-4 active:bg-muted/40 transition-colors shadow-sm mb-3"
          style={{ background: "#CC0000" }}
        >
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
            👨‍🍳
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-base text-white">主厨</p>
            <p className="text-xs text-white/80 mt-0.5">发布菜品 · 管理菜单 · 接收订单</p>
          </div>
          <ChevronRight size={18} className="text-white/60" />
        </button>

        <button
          onClick={() => router.push("/diner")}
          className="w-full border rounded-2xl p-5 flex items-center gap-4 active:bg-muted/40 transition-colors shadow-sm"
          style={{ background: "#FF6B35" }}
        >
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
            😋
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-base text-white">吃货</p>
            <p className="text-xs text-white/80 mt-0.5">浏览菜单 · 加入购物车 · 提交订单</p>
          </div>
          <ChevronRight size={18} className="text-white/60" />
        </button>

        <p className="text-center text-xs text-muted-foreground mt-8">
          无需支付 · 只有期待与享受 ✨
        </p>
      </div>
    </div>
  );
}
