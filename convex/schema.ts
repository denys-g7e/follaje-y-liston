import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  bookings: defineTable({
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
    createdAt: v.number(),
  }).index("by_date", ["date"]).index("by_status", ["status"]),
  combos: defineTable({
    name: v.string(),
    category: v.string(),
    price: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
  }),
  content: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});

export default schema;
