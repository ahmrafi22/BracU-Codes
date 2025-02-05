import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all habits
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Create a new habit
export const create = mutation({
  args: {
    userId: v.string(),
    habit: v.string(),
    daysCount: v.number(),
    currentCount: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, habit, daysCount, currentCount } = args;
    return await ctx.db.insert("habits", { 
      userId, 
      habit, 
      daysCount,
      currentCount 
    });
  },
});

// Update habit progress
export const update = mutation({
  args: {
    id: v.id("habits"),
    currentCount: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, currentCount } = args;
    return await ctx.db.patch(id, { currentCount });
  },
});

// Delete a habit
export const remove = mutation({
  args: {
    id: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    return await ctx.db.delete(id);
  },
});