import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("bookings").withIndex("by_date", (q) => q.eq("date", args.date)).collect();
  },
});

export const getStatusCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const all = await ctx.db.query("bookings").collect();
    return {
      pendiente: all.filter((b) => b.status === "pendiente").length,
      confirmado: all.filter((b) => b.status === "confirmado").length,
      cancelado: all.filter((b) => b.status === "cancelado").length,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    date: v.string(),
    comboId: v.id("combos"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const combo = await ctx.db.get(args.comboId);
    if (!combo) throw new Error("El combo seleccionado ya no está disponible");
    const id = await ctx.db.insert("bookings", {
      name: args.name,
      phone: args.phone,
      date: args.date,
      comboId: args.comboId,
      notes: args.notes,
      status: "pendiente",
      createdAt: Date.now(),
    });
    return id;
  },
});

export const adminCreate = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    date: v.string(),
    comboId: v.id("combos"),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pendiente"),
      v.literal("confirmado"),
      v.literal("cancelado")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    const combo = await ctx.db.get(args.comboId);
    if (!combo) throw new Error("El combo seleccionado no existe");
    const id = await ctx.db.insert("bookings", {
      name: args.name,
      phone: args.phone,
      date: args.date,
      comboId: args.comboId,
      notes: args.notes,
      status: args.status,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("pendiente"),
      v.literal("confirmado"),
      v.literal("cancelado")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    await ctx.db.delete(args.id);
  },
});
