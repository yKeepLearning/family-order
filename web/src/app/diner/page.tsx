"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Minus, ShoppingCart, X } from "lucide-react";
import { getDishes, createOrder, getOrders, Dish, Order } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CATEGORIES = ["火锅", "凉菜", "热菜", "汤羹", "酒水", "水果"];

interface CartItem {
  dishId: string;
  dish: Dish;
  quantity: number;
}

export default function DinerPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"menu" | "orders">("menu");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [category, setCategory] = useState("火锅");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [dinerName, setDinerName] = useState("小雪");
  const [note, setNote] = useState("");
  const [editingName, setEditingName] = useState(false);

  const load = useCallback(async () => {
    const [d, o] = await Promise.all([getDishes(), getOrders()]);
    setDishes(d.filter((x) => x.isAvailable));
    setOrders(o);
  }, []);

  useEffect(() => { load(); }, [load]);

  const myOrders = orders.filter((o) => o.dinerName === dinerName);
  const filtered = dishes.filter((d) => d.category === category);
  const cartTotal = cart.reduce((s, c) => s + c.quantity, 0);

  const add = (dish: Dish) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.dishId === dish.id);
      return ex
        ? prev.map((c) => (c.dishId === dish.id ? { ...c, quantity: c.quantity + 1 } : c))
        : [...prev, { dishId: dish.id, dish, quantity: 1 }];
    });
  };

  const remove = (dishId: string) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.dishId === dishId);
      if (!ex) return prev;
      return ex.quantity === 1 ? prev.filter((c) => c.dishId !== dishId) : prev.map((c) => (c.dishId === dishId ? { ...c, quantity: c.quantity - 1 } : c));
    });
  };

  const groupedCart = useMemo(() => {
    const g: Record<string, CartItem[]> = {};
    for (const c of cart) {
      const cat = c.dish.category;
      if (!g[cat]) g[cat] = [];
      g[cat].push(c);
    }
    return Object.entries(g).map(([cat, items]) => ({ cat, items }));
  }, [cart]);

  const submitOrder = async () => {
    if (!cart.length) return;
    const items = cart.map((c) => ({ id: c.dishId, name: c.dish.name, emoji: c.dish.emoji, quantity: c.quantity }));
    await createOrder({ dinerName, items, notes: note, status: "pending" });
    setCart([]);
    setNote("");
    setCartOpen(false);
    setTab("orders");
    load();
  };

  const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: "等待接单", color: "bg-yellow-50 text-yellow-600", icon: "⏳" },
    cooking: { label: "制作中", color: "bg-orange-50 text-orange-500", icon: "🔥" },
    served: { label: "已出餐", color: "bg-secondary text-primary", icon: "✅" },
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* NavBar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="h-12 flex items-center px-3 gap-2 relative">
          <button onClick={() => router.push("/")} className="flex items-center gap-0.5 text-primary text-sm font-medium">
            <ChevronLeft size={20} />返回
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-base">
            {tab === "menu" ? "今日菜单" : "我的订单"}
          </span>
          {editingName ? (
            <input autoFocus className="ml-auto text-sm border rounded-lg px-2 py-0.5 w-20 outline-none" value={dinerName} onChange={(e) => setDinerName(e.target.value)} onBlur={() => setEditingName(false)} />
          ) : (
            <button onClick={() => setEditingName(true)} className="ml-auto text-xs text-muted-foreground flex items-center gap-0.5">
              👤 {dinerName}
            </button>
          )}
        </div>
      </div>

      {/* ── Menu Tab ── */}
      {tab === "menu" && (
        <>
          <div className="sticky top-[48px] z-40 bg-card border-b border-border flex gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  category === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="pt-3 pb-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <span className="text-5xl">🍽️</span>
                <p className="text-muted-foreground text-sm">暂无菜品</p>
              </div>
            ) : (
              <div className="bg-card divide-y divide-border">
                {filtered.map((d) => {
                  const q = cart.find((c) => c.dishId === d.id)?.quantity ?? 0;
                  return (
                    <div key={d.id} className="flex items-center px-4 py-3 gap-3">
                      <span className="text-3xl flex-shrink-0">{d.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{d.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{d.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {q > 0 && (
                          <>
                            <button onClick={() => remove(d.id)} className="w-7 h-7 rounded-full border-2 border-primary text-primary flex items-center justify-center">
                              <Minus size={13} />
                            </button>
                            <span className="text-sm font-semibold w-4 text-center">{q}</span>
                          </>
                        )}
                        <button onClick={() => add(d)} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Orders Tab ── */}
      {tab === "orders" && (
        <div className="pt-3">
          <div className="bg-card px-4 py-4 flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">😋</div>
            <div>
              <p className="font-semibold text-base">{dinerName}</p>
              <p className="text-xs text-muted-foreground">{myOrders.length} 笔订单</p>
            </div>
          </div>
          {myOrders.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-3">
              <span className="text-5xl">📋</span>
              <p className="text-muted-foreground text-sm">还没有订单，快去点菜吧！</p>
            </div>
          ) : (
            <div className="space-y-3 px-4">
              {[...myOrders].reverse().map((o) => {
                const info = STATUS_MAP[o.status];
                return (
                  <div key={o.id} className="bg-card border border-border">
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-border">
                      <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${info.color}`}>{info.icon} {info.label}</span>
                    </div>
                    <div className="px-4 py-3 space-y-1.5">
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
                          <p className="text-xs text-muted-foreground">{cat}</p>
                          {items.map((ci, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span>{ci.emoji}</span>
                              <span className="flex-1">{ci.name}</span>
                              <span className="text-muted-foreground">× {ci.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      {o.notes && <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mt-1">备注：{o.notes}</p>}
                    </div>
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-1">
                        {(["pending", "cooking", "served"] as const).map((s, i) => {
                          const statuses = ["pending", "cooking", "served"];
                          const cur = statuses.indexOf(o.status);
                          const done = i <= cur;
                          const labels = ["已下单", "制作中", "已出餐"];
                          return (
                            <div key={s} className="flex items-center flex-1">
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                                  {done ? "✓" : i + 1}
                                </div>
                                <span className={`text-[10px] ${done ? "text-primary" : "text-muted-foreground"}`}>{labels[i]}</span>
                              </div>
                              {i < 2 && <div className={`h-px flex-1 mb-4 ${i < cur ? "bg-primary" : "bg-border"}`} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cart Pill */}
      {cartTotal > 0 && !cartOpen && tab === "menu" && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-16 left-3 right-3 max-w-[calc(32rem-1.5rem)] mx-auto z-40 bg-primary text-white rounded-full py-3.5 flex items-center px-5 gap-3 shadow-lg"
        >
          <div className="relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartTotal}</span>
          </div>
          <span className="font-medium text-sm flex-1 text-left">查看购物车</span>
          <span className="text-sm opacity-80">选好了 ›</span>
        </button>
      )}

      {/* Cart Sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-card rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <span className="font-semibold text-base">购物车 ({cartTotal} 件)</span>
              <button onClick={() => setCartOpen(false)} className="text-muted-foreground"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {groupedCart.map(({ cat, items }) => (
                <div key={cat}>
                  <p className="text-xs text-muted-foreground px-5 py-2">{cat}</p>
                  <div className="divide-y divide-border">
                    {items.map(({ dish, quantity }) => (
                      <div key={dish.id} className="flex items-center px-5 py-3 gap-3">
                        <span className="text-2xl">{dish.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{dish.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => remove(dish.id)} className="w-7 h-7 rounded-full border-2 border-primary text-primary flex items-center justify-center">
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
                          <button onClick={() => add(dish)} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pt-3 pb-6 border-t border-border space-y-3 flex-shrink-0">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">备注（口味偏好等）</label>
                <input className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="例如：少盐、不要辣..." value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button onClick={submitOrder} className="w-full rounded-full bg-primary text-white py-3 text-sm font-medium">提交订单</button>
            </div>
          </div>
        </div>
      )}

      {/* TabBar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border flex pb-safe">
        <button onClick={() => setTab("menu")} className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${tab === "menu" ? "text-primary" : "text-muted-foreground"}`}>
          <span className="text-xl">🍽️</span>
          <span className="text-xs">点菜</span>
        </button>
        <button onClick={() => setTab("orders")} className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${tab === "orders" ? "text-primary" : "text-muted-foreground"}`}>
          <span className="text-xl">📋</span>
          <span className="text-xs">我的订单{myOrders.filter((o) => o.status !== "served").length > 0 && <span className="ml-1 bg-destructive text-white text-[10px] px-1 rounded-full">{myOrders.filter((o) => o.status !== "served").length}</span>}</span>
        </button>
      </div>
    </div>
  );
}
