import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all incomplete tasks
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Create a new task
export const create = mutation({
  args: {
    userId: v.string(),
    task: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("high"), v.literal("mid"), v.literal("low")),
  },
  handler: async (ctx, args) => {
    const { userId, task, description, priority } = args;
    return await ctx.db.insert("tasks", {
      userId,
      task,
      description,
      priority,
      isCompleted: false,
      rewardPoints: 5,
    });
  },
});

// Update an existing task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    task: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("high"), v.literal("mid"), v.literal("low")),
  },
  handler: async (ctx, args) => {
    const { id, task, description, priority } = args;
    const existingTask = await ctx.db.get(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }
    return await ctx.db.patch(id, { task, description, priority });
  },
});

// Toggle task completion
export const toggleComplete = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const task = await ctx.db.get(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return await ctx.db.patch(id, { isCompleted: !task.isCompleted });
  },
});

// Delete an existing task
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const task = await ctx.db.get(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return await ctx.db.delete(id);
  },
});

// Get total reward points
export const getTotalPoints = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect();
    
    return tasks.reduce((total, task) => total + task.rewardPoints, 0);
  },
});