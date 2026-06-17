import { useState, useMemo } from "react";
import {
  ChevronLeft, Plus, Minus, ShoppingCart, ChevronRight,
  Clock, Trash2, Eye, EyeOff, CheckCircle, X, Bell
} from "lucide-react";

// ── System font stack matching WeChat Mini Program ────────────────────────────
const SYS_FONT = {
  fontFamily:
    "-apple-system, 'PingFang SC', 'Helvetica Neue', 'Noto Sans SC', sans-serif",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "select" | "chef" | "diner";
type OrderStatus = "pending" | "cooking" | "served";

interface Dish {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  available: boolean;
  cookTime: number;
}

interface CartItem { dishId: string; quantity: number }

interface Order {
  id: string;
  dinerName: string;
  items: { dish: Dish; quantity: number }[];
  note: string;
  status: OrderStatus;
  createdAt: Date;
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const INITIAL_DISHES: Dish[] = [
  { id: "1", name: "红烧肉",    description: "五花肉慢炖四十分钟，入口即化",  emoji: "🥩", category: "肉类",   available: true,  cookTime: 40 },
  { id: "2", name: "番茄炒蛋",  description: "经典家常，酸甜开胃",           emoji: "🍅", category: "素菜",   available: true,  cookTime: 10 },
  { id: "3", name: "麻婆豆腐",  description: "麻辣鲜香，嫩滑入味",           emoji: "🌶️", category: "豆制品", available: true,  cookTime: 15 },
  { id: "4", name: "清蒸鲈鱼",  description: "新鲜活鱼，鲜嫩爽滑",           emoji: "🐟", category: "海鲜",   available: true,  cookTime: 20 },
  { id: "5", name: "蒜蓉炒青菜",description: "时令青菜，清爽健康",            emoji: "🥬", category: "素菜",   available: true,  cookTime:  8 },
  { id: "6", name: "番茄蛋花汤",description: "鲜美营养，暖胃舒心",            emoji: "🥚", category: "汤类",   available: false, cookTime:  5 },
  { id: "7", name: "糖醋排骨",  description: "酸甜可口，骨酥肉嫩",           emoji: "🍖", category: "肉类",   available: true,  cookTime: 35 },
  { id: "8", name: "凉拌黄瓜",  description: "爽口开胃，清凉解暑",           emoji: "🥒", category: "凉菜",   available: true,  cookTime:  5 },
  { id: "9", name: "白米饭",    description: "粒粒晶莹，软糯香甜",           emoji: "🍚", category: "主食",   available: true,  cookTime: 15 },
];

const ALL_CATEGORIES = ["全部", "肉类", "素菜", "海鲜", "豆制品", "汤类", "凉菜", "主食"];

// ── Shared primitives ─────────────────────────────────────────────────────────

/** Simulates the WeChat mini-program NavBar (status bar + 44 px nav row). */
function NavBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border"
      style={SYS_FONT}
    >
      {/* Status bar simulation */}
      <div className="h-11 flex items-end px-4 pb-1">
        <span className="text-xs text-foreground font-medium">9:41</span>
      </div>
      {/* Nav row */}
      <div className="h-11 flex items-center px-3 gap-2 relative">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-0.5 text-primary text-sm font-medium"
          >
            <ChevronLeft size={20} />
            返回
          </button>
        )}
        <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-base text-foreground">
          {title}
        </span>
        <div className="ml-auto">{right}</div>
      </div>
    </div>
  );
}

/** Bottom TabBar matching WeChat's tab style. */
function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string; icon: string; badge?: number }[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex"
      style={{ ...SYS_FONT, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span
              className={`text-xs leading-none ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              {tab.label}
            </span>
            {!!tab.badge && (
              <span className="absolute top-1.5 right-[calc(50%-18px)] bg-destructive text-destructive-foreground text-[10px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** WeChat-style cell group — white card with separated rows. */
function CellGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3" style={SYS_FONT}>
      {title && (
        <p className="text-xs text-muted-foreground px-4 py-2">{title}</p>
      )}
      <div className="bg-card divide-y divide-border">{children}</div>
    </div>
  );
}

/** A single row inside a CellGroup. */
function Cell({
  icon,
  title,
  subtitle,
  right,
  onClick,
  danger,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-center px-4 py-3 gap-3 ${onClick ? "active:bg-muted/60 cursor-pointer" : ""} ${danger ? "text-destructive" : "text-foreground"}`}
      style={SYS_FONT}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${danger ? "text-destructive" : ""}`}>{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>}
      </div>
      {right ?? (onClick && <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />)}
    </div>
  );
}

/** WeChat-style primary button. */
function WxButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  block,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "default" | "danger";
  size?: "sm" | "md";
  block?: boolean;
}) {
  const base =
    "rounded-full font-medium transition-opacity active:opacity-70 flex items-center justify-center gap-1.5";
  const variants = {
    primary: "bg-primary text-primary-foreground",
    default: "bg-card text-primary border border-primary",
    danger: "bg-destructive text-destructive-foreground",
  };
  const sizes = { sm: "text-xs px-4 py-1.5", md: "text-sm px-6 py-2.5" };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={SYS_FONT}
      className={`${base} ${variants[variant]} ${sizes[size]} ${block ? "w-full" : ""} ${disabled ? "opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}

// ── Role selection ────────────────────────────────────────────────────────────

function RoleSelect({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={SYS_FONT}
    >
      {/* Mini-program status + nav */}
      <div className="bg-primary">
        <div className="h-11" />
        <div className="h-11 flex items-center justify-center">
          <span className="text-primary-foreground font-semibold text-base">家庭厨房</span>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-primary px-5 pb-8 pt-2 text-center text-primary-foreground">
        <div className="text-5xl mb-3">🏠</div>
        <h1 className="text-xl font-semibold mb-1">今天吃什么？</h1>
        <p className="text-sm opacity-80">选择你的身份，开始今日点菜</p>
      </div>

      {/* Rounded top spacer */}
      <div className="bg-card -mt-4 rounded-t-3xl pt-6 flex-1 px-4 pb-8">
        <p className="text-xs text-muted-foreground text-center mb-5">请选择你的身份</p>
        <div className="space-y-3">
          <button
            onClick={() => onSelect("chef")}
            className="w-full bg-card border border-border rounded-2xl p-5 flex items-center gap-4 active:bg-muted/40 transition-colors shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-3xl flex-shrink-0">
              👨‍🍳
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-base text-foreground">主厨</p>
              <p className="text-xs text-muted-foreground mt-0.5">发布菜品 · 管理菜单 · 接收订单</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>

          <button
            onClick={() => onSelect("diner")}
            className="w-full bg-card border border-border rounded-2xl p-5 flex items-center gap-4 active:bg-muted/40 transition-colors shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-3xl flex-shrink-0">
              😋
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-base text-foreground">吃货</p>
              <p className="text-xs text-muted-foreground mt-0.5">浏览菜单 · 加入购物车 · 提交订单</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">无需支付 · 只有期待与享受 ✨</p>
      </div>
    </div>
  );
}

// ── Chef ──────────────────────────────────────────────────────────────────────

function ChefApp({
  dishes,
  setDishes,
  orders,
  setOrders,
  onBack,
}: {
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"menu" | "orders">("menu");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", emoji: "🍜", category: "素菜", cookTime: 15 });
  const [orderFilter, setOrderFilter] = useState<OrderStatus>("pending");

  const newOrders = orders.filter((o) => o.status === "pending").length;
  const cookingOrders = orders.filter((o) => o.status === "cooking").length;

  function submitDish() {
    if (!form.name.trim()) return;
    setDishes((prev) => [
      ...prev,
      { id: Date.now().toString(), ...form, name: form.name.trim(), available: true },
    ]);
    setForm({ name: "", description: "", emoji: "🍜", category: "素菜", cookTime: 15 });
    setShowAdd(false);
  }

  function advanceOrder(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next: Record<OrderStatus, OrderStatus> = { pending: "cooking", cooking: "served", served: "served" };
        return { ...o, status: next[o.status] };
      })
    );
  }

  const filteredOrders = orders.filter((o) => o.status === orderFilter);

  const ORDER_TABS: { key: OrderStatus; label: string }[] = [
    { key: "pending", label: "新订单" },
    { key: "cooking", label: "制作中" },
    { key: "served",  label: "已出餐" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20" style={SYS_FONT}>
      <NavBar
        title={tab === "menu" ? "菜品管理" : "订单管理"}
        onBack={onBack}
        right={
          tab === "menu" ? (
            <button onClick={() => setShowAdd(true)} className="text-primary text-sm font-medium">
              + 添加
            </button>
          ) : null
        }
      />

      {/* Content offset for fixed NavBar (44px status + 44px nav) */}
      <div className="pt-[88px]">
        {/* ── Menu tab ── */}
        {tab === "menu" && (
          <div className="pt-3">
            {dishes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <span className="text-5xl">🍽️</span>
                <p className="text-muted-foreground text-sm">还没有菜品，点击右上角添加</p>
              </div>
            ) : (
              <CellGroup title={`共 ${dishes.length} 道菜`}>
                {dishes.map((dish) => (
                  <Cell
                    key={dish.id}
                    icon={<span className="text-2xl w-9 text-center">{dish.emoji}</span>}
                    title={dish.name}
                    subtitle={`${dish.description} · ${dish.cookTime} 分钟`}
                    right={
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            setDishes((p) => p.map((d) => d.id === dish.id ? { ...d, available: !d.available } : d))
                          }
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            dish.available
                              ? "bg-secondary text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {dish.available ? "已上架" : "已下架"}
                        </button>
                        <button
                          onClick={() => setDishes((p) => p.filter((d) => d.id !== dish.id))}
                          className="p-1 text-muted-foreground active:text-destructive"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    }
                  />
                ))}
              </CellGroup>
            )}
          </div>
        )}

        {/* ── Orders tab ── */}
        {tab === "orders" && (
          <div className="pt-3">
            {/* Segmented control */}
            <div className="bg-card border-b border-border flex">
              {ORDER_TABS.map((t) => {
                const counts: Record<OrderStatus, number> = {
                  pending: newOrders,
                  cooking: cookingOrders,
                  served: orders.filter((o) => o.status === "served").length,
                };
                return (
                  <button
                    key={t.key}
                    onClick={() => setOrderFilter(t.key)}
                    className={`flex-1 py-3 text-sm font-medium relative transition-colors ${
                      orderFilter === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                    }`}
                  >
                    {t.label}
                    {counts[t.key] > 0 && (
                      <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1 rounded-full">
                        {counts[t.key]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <span className="text-5xl">📭</span>
                <p className="text-muted-foreground text-sm">暂无订单</p>
              </div>
            ) : (
              <div className="pt-3 space-y-0">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-card mb-3">
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">{order.dinerName}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-50 text-yellow-600"
                              : order.status === "cooking"
                              ? "bg-orange-50 text-orange-500"
                              : "bg-secondary text-primary"
                          }`}
                        >
                          {order.status === "pending" ? "待制作" : order.status === "cooking" ? "制作中" : "已出餐"}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {order.createdAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="px-4 py-3 space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span>{item.dish.emoji}</span>
                          <span className="flex-1">{item.dish.name}</span>
                          <span className="text-muted-foreground">× {item.quantity}</span>
                        </div>
                      ))}
                      {order.note && (
                        <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mt-1">
                          备注：{order.note}
                        </p>
                      )}
                    </div>

                    {order.status !== "served" && (
                      <div className="px-4 pb-4 flex justify-end">
                        <WxButton onClick={() => advanceOrder(order.id)} size="sm">
                          {order.status === "pending" ? "开始制作 🔥" : "出餐完成 ✅"}
                        </WxButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <TabBar
        tabs={[
          { key: "menu",   label: "菜单", icon: "📋" },
          { key: "orders", label: "订单", icon: "🛎️", badge: newOrders + cookingOrders },
        ]}
        active={tab}
        onChange={(k) => setTab(k as "menu" | "orders")}
      />

      {/* Add dish bottom sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50" style={SYS_FONT}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-base">添加菜品</span>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">菜名 *</label>
                <input
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="例如：红烧肉"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">表情符号</label>
                  <input
                    className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    value={form.emoji}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">分类</label>
                  <select
                    className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {ALL_CATEGORIES.filter((c) => c !== "全部").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">简介</label>
                <input
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="简单描述这道菜..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">制作时间（分钟）</label>
                <input
                  type="number"
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  value={form.cookTime}
                  onChange={(e) => setForm((f) => ({ ...f, cookTime: parseInt(e.target.value) || 15 }))}
                  min={1} max={120}
                />
              </div>

              <WxButton onClick={submitDish} disabled={!form.name.trim()} block>
                确认添加
              </WxButton>
              <div className="pb-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Diner ─────────────────────────────────────────────────────────────────────

function DinerApp({
  dishes,
  orders,
  setOrders,
  onBack,
}: {
  dishes: Dish[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"menu" | "mine">("menu");
  const [category, setCategory] = useState("全部");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [dinerName, setDinerName] = useState("小明");
  const [note, setNote] = useState("");
  const [editingName, setEditingName] = useState(false);

  const myOrders = orders.filter((o) => o.dinerName === dinerName);
  const cartTotal = cart.reduce((s, c) => s + c.quantity, 0);

  const filtered = useMemo(
    () =>
      dishes.filter(
        (d) => d.available && (category === "全部" || d.category === category)
      ),
    [dishes, category]
  );

  const cartDishes = useMemo(
    () =>
      cart.flatMap((ci) => {
        const d = dishes.find((x) => x.id === ci.dishId);
        return d ? [{ dish: d, quantity: ci.quantity }] : [];
      }),
    [cart, dishes]
  );

  function qty(id: string) {
    return cart.find((c) => c.dishId === id)?.quantity ?? 0;
  }

  function add(id: string) {
    setCart((p) => {
      const ex = p.find((c) => c.dishId === id);
      return ex
        ? p.map((c) => (c.dishId === id ? { ...c, quantity: c.quantity + 1 } : c))
        : [...p, { dishId: id, quantity: 1 }];
    });
  }

  function remove(id: string) {
    setCart((p) => {
      const ex = p.find((c) => c.dishId === id);
      if (!ex) return p;
      return ex.quantity === 1 ? p.filter((c) => c.dishId !== id) : p.map((c) => (c.dishId === id ? { ...c, quantity: c.quantity - 1 } : c));
    });
  }

  function submitOrder() {
    if (!cartDishes.length) return;
    setOrders((p) => [
      ...p,
      {
        id: Date.now().toString(),
        dinerName,
        items: cartDishes,
        note,
        status: "pending",
        createdAt: new Date(),
      },
    ]);
    setCart([]);
    setNote("");
    setCartOpen(false);
    setTab("mine");
  }

  const STATUS_MAP: Record<OrderStatus, { label: string; color: string; icon: string }> = {
    pending:  { label: "等待接单", color: "text-yellow-600 bg-yellow-50", icon: "⏳" },
    cooking:  { label: "制作中",   color: "text-orange-500 bg-orange-50", icon: "🔥" },
    served:   { label: "已出餐",   color: "text-primary bg-secondary",    icon: "✅" },
  };

  return (
    <div className="min-h-screen bg-background pb-20" style={SYS_FONT}>
      <NavBar
        title={tab === "menu" ? "今日菜单" : "我的订单"}
        onBack={onBack}
        right={
          tab === "menu" && editingName ? (
            <input
              autoFocus
              className="text-sm border border-border rounded-lg px-2 py-0.5 w-20 outline-none"
              value={dinerName}
              onChange={(e) => setDinerName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="text-xs text-muted-foreground flex items-center gap-0.5">
              👤 {dinerName}
            </button>
          )
        }
      />

      <div className="pt-[88px]">
        {/* ── Menu tab ── */}
        {tab === "menu" && (
          <>
            {/* Category scroll */}
            <div className="bg-card border-b border-border px-4 flex gap-2 overflow-x-auto no-scrollbar py-2.5">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
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
                  {filtered.map((dish) => {
                    const q = qty(dish.id);
                    return (
                      <div key={dish.id} className="flex items-center px-4 py-3 gap-3">
                        <span className="text-3xl flex-shrink-0">{dish.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{dish.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-1">{dish.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock size={10} /> {dish.cookTime} 分钟
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {q > 0 && (
                            <>
                              <button
                                onClick={() => remove(dish.id)}
                                className="w-7 h-7 rounded-full border-2 border-primary text-primary flex items-center justify-center"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="text-sm font-semibold text-foreground w-4 text-center">{q}</span>
                            </>
                          )}
                          <button
                            onClick={() => add(dish.id)}
                            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                          >
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

        {/* ── Mine tab ── */}
        {tab === "mine" && (
          <div className="pt-3">
            {/* Profile strip */}
            <div className="bg-card px-4 py-4 flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                😋
              </div>
              <div>
                <p className="font-semibold text-base">{dinerName}</p>
                <p className="text-xs text-muted-foreground">{myOrders.length} 笔订单</p>
              </div>
            </div>

            {myOrders.length === 0 ? (
              <div className="flex flex-col items-center py-24 gap-3">
                <span className="text-5xl">📋</span>
                <p className="text-muted-foreground text-sm">还没有订单，快去点菜吧！</p>
                <WxButton onClick={() => setTab("menu")} size="sm">去点菜</WxButton>
              </div>
            ) : (
              <div className="space-y-3">
                {[...myOrders].reverse().map((order) => {
                  const info = STATUS_MAP[order.status];
                  return (
                    <div key={order.id} className="bg-card">
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-border">
                        <span className="text-xs text-muted-foreground">
                          {order.createdAt.toLocaleString("zh-CN", {
                            month: "numeric", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${info.color}`}>
                          {info.icon} {info.label}
                        </span>
                      </div>
                      <div className="px-4 py-3 space-y-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span>{item.dish.emoji}</span>
                            <span className="flex-1">{item.dish.name}</span>
                            <span className="text-muted-foreground">× {item.quantity}</span>
                          </div>
                        ))}
                        {order.note && (
                          <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mt-1">
                            备注：{order.note}
                          </p>
                        )}
                      </div>
                      {/* Progress steps */}
                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-1">
                          {(["pending", "cooking", "served"] as OrderStatus[]).map((s, i) => {
                            const statuses: OrderStatus[] = ["pending", "cooking", "served"];
                            const cur = statuses.indexOf(order.status);
                            const done = i <= cur;
                            const labels = ["已下单", "制作中", "已出餐"];
                            return (
                              <div key={s} className="flex items-center flex-1">
                                <div className="flex flex-col items-center gap-1 flex-1">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    {done ? "✓" : i + 1}
                                  </div>
                                  <span className={`text-[10px] ${done ? "text-primary" : "text-muted-foreground"}`}>{labels[i]}</span>
                                </div>
                                {i < 2 && (
                                  <div className={`h-px flex-1 mb-4 ${i < cur ? "bg-primary" : "bg-border"}`} />
                                )}
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
      </div>

      <TabBar
        tabs={[
          { key: "menu", label: "点菜",   icon: "🍽️" },
          { key: "mine", label: "我的订单", icon: "📋", badge: myOrders.filter(o => o.status !== "served").length },
        ]}
        active={tab}
        onChange={(k) => setTab(k as "menu" | "mine")}
      />

      {/* Cart pill — floats above TabBar */}
      {cartTotal > 0 && !cartOpen && tab === "menu" && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-16 left-4 right-4 z-40 bg-primary text-primary-foreground rounded-full py-3.5 flex items-center px-5 gap-3 shadow-lg active:opacity-90 transition-opacity"
          style={SYS_FONT}
        >
          <div className="relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartTotal}
            </span>
          </div>
          <span className="font-medium text-sm flex-1 text-left">查看购物车</span>
          <span className="text-sm opacity-80">去结算 →</span>
        </button>
      )}

      {/* Cart bottom sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50" style={SYS_FONT}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <span className="font-semibold text-base">购物车 ({cartTotal} 件)</span>
              <button onClick={() => setCartOpen(false)} className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {cartDishes.map(({ dish, quantity }) => (
                <div key={dish.id} className="flex items-center px-4 py-3 gap-3">
                  <span className="text-2xl">{dish.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{dish.name}</p>
                    <p className="text-xs text-muted-foreground">{dish.cookTime} 分钟</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => remove(dish.id)}
                      className="w-7 h-7 rounded-full border-2 border-primary text-primary flex items-center justify-center"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => add(dish.id)}
                      className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pt-3 pb-6 border-t border-border space-y-3 flex-shrink-0">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">备注（口味偏好等）</label>
                <input
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="例如：少盐、不要辣..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <WxButton onClick={submitOrder} block>
                提交订单
              </WxButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [role, setRole] = useState<Role>("select");
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [orders, setOrders] = useState<Order[]>([]);

  if (role === "chef")
    return <ChefApp dishes={dishes} setDishes={setDishes} orders={orders} setOrders={setOrders} onBack={() => setRole("select")} />;

  if (role === "diner")
    return <DinerApp dishes={dishes} orders={orders} setOrders={setOrders} onBack={() => setRole("select")} />;

  return <RoleSelect onSelect={setRole} />;
}
