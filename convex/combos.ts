import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("combos").filter((q) => q.eq(q.field("active"), true)).collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("combos").collect();
  },
});

export const getById = query({
  args: { id: v.id("combos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    price: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    await ctx.db.insert("combos", {
      name: args.name,
      category: args.category,
      price: args.price,
      description: args.description,
      imageUrl: args.imageUrl,
      active: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("combos"),
    name: v.string(),
    category: v.string(),
    price: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    await ctx.db.patch(args.id, {
      name: args.name,
      category: args.category,
      price: args.price,
      description: args.description,
      imageUrl: args.imageUrl,
      active: args.active,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("combos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    await ctx.db.delete(args.id);
  },
});
