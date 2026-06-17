import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl.startsWith("http")
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Dish = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  isAvailable: boolean;
  cookTime: number;
  created_at?: string;
};

export type Order = {
  id: string;
  dinerName: string;
  items: OrderItem[];
  notes: string;
  status: "pending" | "cooking" | "served";
  created_at: string;
};

export type OrderItem = {
  id: string;
  name: string;
  emoji: string;
  quantity: number;
};

function ensure() {
  if (!supabase) throw new Error("Supabase not configured");
  return supabase;
}

export async function getDishes(): Promise<Dish[]> {
  const db = ensure();
  const { data } = await db.from("dishes").select("*").order("created_at");
  return (data || []) as Dish[];
}

export async function addDish(dish: Omit<Dish, "id" | "created_at">) {
  const db = ensure();
  const { data, error } = await db.from("dishes").insert(dish).select().single();
  if (error) throw error;
  return data as Dish;
}

export async function updateDish(id: string, updates: Partial<Dish>) {
  const db = ensure();
  const { error } = await db.from("dishes").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteDish(id: string) {
  const db = ensure();
  const { error } = await db.from("dishes").delete().eq("id", id);
  if (error) throw error;
}

export async function getOrders(): Promise<Order[]> {
  const db = ensure();
  const { data } = await db.from("orders").select("*").order("created_at", { ascending: false });
  return (data || []) as Order[];
}

export async function createOrder(order: Omit<Order, "id" | "created_at">) {
  const db = ensure();
  const { data, error } = await db.from("orders").insert(order).select().single();
  if (error) throw error;
  return data as Order;
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  const db = ensure();
  const { error } = await db.from("orders").update(updates).eq("id", id);
  if (error) throw error;
}
