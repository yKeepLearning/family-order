"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Minus, Trash2, X } from "lucide-react";
import {
  getDishes, addDish, updateDish, deleteDish,
  getOrders, updateOrder,
  Dish, Order,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CATEGORIES = ["火锅", "凉菜", "热菜", "汤羹", "酒水", "水果"];

const SEED = [
  { name: "毛肚", emoji: "🫕", category: "火锅", description: "七上八下，爽脆弹牙", isAvailable: true, cookTime: 10 },
  { name: "鱿鱼", emoji: "🦑", category: "火锅", description: "鲜嫩爽滑，Q弹可口", isAvailable: true, cookTime: 10 },
  { name: "牛蛙", emoji: "🐸", category: "火锅", description: "肉质细腻，入口即化", isAvailable: true, cookTime: 15 },
  { name: "火腿肠", emoji: "🌭", category: "火锅", description: "经典搭配，老少皆宜", isAvailable: true, cookTime: 5 },
  { name: "午餐肉", emoji: "🥫", category: "火锅", description: "厚切大块，满足感爆棚", isAvailable: true, cookTime: 5 },
  { name: "墨鱼仔", emoji: "🐙", category: "火锅", description: "小巧玲珑，一口一个", isAvailable: true, cookTime: 8 },
  { name: "土豆", emoji: "🥔", category: "火锅", description: "软糯入味，火锅必点", isAvailable: true, cookTime: 10 },
  { name: "莲藕", emoji: "🪷", category: "火锅", description: "清脆拉丝，口感独特", isAvailable: true, cookTime: 8 },
  { name: "萝卜", emoji: "🥕", category: "火锅", description: "清甜多汁，解腻首选", isAvailable: true, cookTime: 8 },
  { name: "西红柿", emoji: "🍅", category: "火锅", description: "酸甜开胃，汤底必备", isAvailable: true, cookTime: 5 },
  { name: "凉拌黄瓜", emoji: "🥒", category: "凉菜", description: "清脆爽口，解腻神器", isAvailable: true, cookTime: 5 },
  { name: "烧椒皮蛋", emoji: "🥚", category: "凉菜", description: "烧椒拌皮蛋，香气四溢", isAvailable: true, cookTime: 8 },
  { name: "辣拌凉面", emoji: "🍝", category: "凉菜", description: "麻辣鲜香，夏日必备", isAvailable: true, cookTime: 10 },
  { name: "油酥花生", emoji: "🥜", category: "凉菜", description: "酥脆咸香，下酒好菜", isAvailable: true, cookTime: 5 },
  { name: "红烧土鸡", emoji: "🍗", category: "热菜", description: "土鸡慢炖，肉烂汤浓", isAvailable: true, cookTime: 40 },
  { name: "青椒土豆丝", emoji: "🥔", category: "热菜", description: "酸辣脆爽，家常美味", isAvailable: true, cookTime: 10 },
  { name: "冬瓜排骨汤", emoji: "🍖", category: "汤羹", description: "清甜滋润，秋燥克星", isAvailable: true, cookTime: 30 },
  { name: "酸萝卜老鸭汤", emoji: "🦆", category: "汤羹", description: "酸香开胃，暖心暖胃", isAvailable: true, cookTime: 40 },
  { name: "啤酒", emoji: "🍺", category: "酒水", description: "冰镇啤酒，火锅绝配", isAvailable: true, cookTime: 0 },
  { name: "米酒", emoji: "🍶", category: "酒水", description: "甘甜醇厚，暖身养胃", isAvailable: true, cookTime: 0 },
  { name: "可乐", emoji: "🥤", category: "酒水", description: "冰爽刺激，快乐加倍", isAvailable: true, cookTime: 0 },
  { name: "雪碧", emoji: "🧊", category: "酒水", description: "透心凉，心飞扬", isAvailable: true, cookTime: 0 },
  { name: "西瓜", emoji: "🍉", category: "水果", description: "甜蜜多汁，解暑神器", isAvailable: true, cookTime: 0 },
  { name: "葡萄", emoji: "🍇", category: "水果", description: "晶莹剔透，酸甜可口", isAvailable: true, cookTime: 0 },
  { name: "提子", emoji: "🍇", category: "水果", description: "脆甜无籽，一口爆汁", isAvailable: true, cookTime: 0 },
  { name: "火龙果", emoji: "🐉", category: "水果", description: "清甜细腻，营养丰富", isAvailable: true, cookTime: 0 },
  { name: "榴莲", emoji: "🫒", category: "水果", description: "王者之果，爱者自爱", isAvailable: true, cookTime: 0 },
];

export default function ChefPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"menu" | "orders">("orders");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>("pending");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", emoji: "🍜", category: "火锅", description: "" });

  const load = useCallback(async () => {
    const [d, o] = await Promise.all([getDishes(), getOrders()]);
    setDishes(d);
    setOrders(o);
  }, []);

  useEffect(() => { load(); }, [load]);

  const seedDishes = async () => {
    for (const d of SEED) await addDish(d);
    load();
  };

  const filteredOrders = orders.filter((o) => o.status === orderFilter);

  const advanceOrder = async (id: string) => {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    const next = { pending: "cooking", cooking: "served", served: "served" } as const;
    await updateOrder(id, { status: next[o.status] });
    load();
  };

  const newCount = orders.filter((o) => o.status === "pending").length;
  const cookingCount = orders.filter((o) => o.status === "cooking").length;
  const SEGS = [
    { key: "pending", label: "新订单", count: newCount },
    { key: "cooking", label: "制作中", count: cookingCount },
    { key: "served", label: "已出餐", count: orders.filter((o) => o.status === "served").length },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* NavBar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="h-11" />
        <div className="h-11 flex items-center px-3 gap-2 relative">
          <button onClick={() => router.push("/")} className="flex items-center gap-0.5 text-primary text-sm font-medium">
            <ChevronLeft size={20} />返回
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-base">
            {tab === "menu" ? "菜品管理" : "订单管理"}
          </span>
          {tab === "menu" && (
            <button onClick={() => setShowAdd(true)} className="ml-auto text-primary text-sm font-medium">
              + 添加
            </button>
          )}
          {tab === "menu" && dishes.length === 0 && (
            <button onClick={seedDishes} className="ml-auto text-green-600 text-sm font-medium">
              初始化菜品
            </button>
          )}
        </div>
      </div>

      <div className="pt-3">
        {/* ── Menu Tab ── */}
        {tab === "menu" && (
          <div>
            {dishes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <span className="text-5xl">🍽️</span>
                <p className="text-muted-foreground text-sm">还没有菜品，点击右上角添加或初始化</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground px-4 py-2">共 {dishes.length} 道菜</p>
                <div className="bg-card divide-y divide-border">
                  {CATEGORIES.map((cat) => {
                    const catDishes = dishes.filter((d) => d.category === cat);
                    if (catDishes.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p className="text-xs text-muted-foreground bg-muted/50 px-4 py-2">{cat}</p>
                        {catDishes.map((d) => (
                          <div key={d.id} className="flex items-center px-4 py-3 gap-3">
                            <span className="text-2xl w-9 text-center flex-shrink-0">{d.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{d.name}</p>
                              <p className="text-xs text-muted-foreground">{d.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => updateDish(d.id, { isAvailable: !d.isAvailable }).then(load)}
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                  d.isAvailable ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {d.isAvailable ? "已上架" : "已下架"}
                              </button>
                              <button onClick={() => deleteDish(d.id).then(load)} className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === "orders" && (
          <div>
            <div className="bg-card border-b border-border flex">
              {SEGS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setOrderFilter(s.key)}
                  className={`flex-1 py-3 text-sm font-medium relative ${
                    orderFilter === s.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                  {s.count > 0 && (
                    <span className="ml-1 bg-destructive text-white text-[10px] font-bold px-1 rounded-full">{s.count}</span>
                  )}
                </button>
              ))}
            </div>
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <span className="text-5xl">📭</span>
                <p className="text-muted-foreground text-sm">暂无订单</p>
              </div>
            ) : (
              <div className="pt-3 space-y-3 px-4">
                {filteredOrders.map((o) => (
                  <div key={o.id} className="bg-card border border-border">
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">{o.dinerName || "匿名"}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            o.status === "pending"
                              ? "bg-yellow-50 text-yellow-600"
                              : o.status === "cooking"
                              ? "bg-orange-50 text-orange-500"
                              : "bg-secondary text-primary"
                          }`}
                        >
                          {{ pending: "待制作", cooking: "制作中", served: "已出餐" }[o.status]}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {Object.entries(
                        o.items.reduce(
                          (acc, ci) => {
                            const cat = dishes.find((d) => d.id === ci.id)?.category || "其他";
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(ci);
                            return acc;
                          },
                          {} as Record<string, typeof o.items>
                        )
                      ).map(([cat, items]) => (
                        <div key={cat}>
                          <p className="text-xs text-muted-foreground mb-1">{cat}</p>
                          {items.map((ci, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span>{ci.emoji}</span>
                              <span className="flex-1">{ci.name}</span>
                              <span className="text-muted-foreground">× {ci.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      {o.notes && (
                        <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mt-1">备注：{o.notes}</p>
                      )}
                    </div>
                    {o.status !== "served" && (
                      <div className="px-4 pb-4 flex justify-end">
                        <button
                          onClick={() => advanceOrder(o.id)}
                          className="rounded-full bg-primary text-primary-foreground text-sm px-6 py-2.5 font-medium"
                        >
                          {o.status === "pending" ? "开始制作 🔥" : "出餐完成 ✅"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TabBar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border flex pb-safe">
        <button onClick={() => setTab("menu")} className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${tab === "menu" ? "text-primary" : "text-muted-foreground"}`}>
          <span className="text-xl">📋</span>
          <span className="text-xs">菜单</span>
        </button>
        <button onClick={() => setTab("orders")} className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${tab === "orders" ? "text-primary" : "text-muted-foreground"}`}>
          <span className="text-xl">🛎️</span>
          <span className="text-xs">订单{newCount + cookingCount > 0 && <span className="ml-1 bg-destructive text-white text-[10px] px-1 rounded-full">{newCount + cookingCount}</span>}</span>
        </button>
      </div>

      {/* Add Dish Sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-card rounded-t-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-base">添加菜品</span>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground"><X size={20} /></button>
            </div>
            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">菜名 *</label>
                <input className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="例如：红烧肉" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">表情符号</label>
                  <input className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">分类</label>
                  <select className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">简介</label>
                <input className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="简单描述..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button
                onClick={() => { addDish({ ...form, isAvailable: true, cookTime: 15 }).then(() => { setShowAdd(false); load(); }); }}
                disabled={!form.name.trim()}
                className="w-full rounded-full bg-primary text-white py-2.5 text-sm font-medium disabled:opacity-40"
              >
                确认添加
              </button>
              <div className="pb-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
