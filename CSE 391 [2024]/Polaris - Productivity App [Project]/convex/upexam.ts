import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all exams
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exams")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Create a new exam
export const create = mutation({
  args: {
    userId: v.string(),
    examName: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, examName, date } = args;
    return await ctx.db.insert("exams", { userId, examName, date });
  },
});

// Update an existing exam
export const update = mutation({
  args: {
    id: v.id("exams"),
    examName: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, examName, date } = args;
    const exam = await ctx.db.get(id);
    if (!exam) {
      throw new Error("Exam not found");
    }
    return await ctx.db.patch(id, { examName, date });
  },
});

// Delete an existing exam
export const remove = mutation({
  args: {
    id: v.id("exams"),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const exam = await ctx.db.get(id);
    if (!exam) {
      throw new Error("Exam not found");
    }
    return await ctx.db.delete(id);
  },
});