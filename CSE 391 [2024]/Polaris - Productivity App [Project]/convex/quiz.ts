import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzesAndAssignments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    date: v.string(),
    label: v.union(v.literal("quiz"), v.literal("assignment")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizzesAndAssignments", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("quizzesAndAssignments"),
    name: v.string(),
    date: v.string(),
    label: v.union(v.literal("quiz"), v.literal("assignment")),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: {
    id: v.id("quizzesAndAssignments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});