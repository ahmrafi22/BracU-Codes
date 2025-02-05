import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all classes for a user
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classes")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Create a new class
export const create = mutation({
  args: {
    userId: v.string(),
    day: v.string(),
    className: v.string(),
    time: v.number(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, day, className, time, endDate } = args;
    return await ctx.db.insert("classes", { 
      userId, 
      day, 
      className, 
      time, 
      endDate 
    });
  },
});

// Update an existing class
export const update = mutation({
  args: {
    id: v.id("classes"),
    day: v.string(),
    className: v.string(),
    time: v.number(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, day, className, time, endDate } = args;
    const existingClass = await ctx.db.get(id);
    if (!existingClass) {
      throw new Error("Class not found");
    }
    return await ctx.db.patch(id, { 
      day, 
      className, 
      time, 
      endDate 
    });
  },
});

// Delete an existing class
export const remove = mutation({
  args: {
    id: v.id("classes"),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const existingClass = await ctx.db.get(id);
    if (!existingClass) {
      throw new Error("Class not found");
    }
    return await ctx.db.delete(id);
  },
});