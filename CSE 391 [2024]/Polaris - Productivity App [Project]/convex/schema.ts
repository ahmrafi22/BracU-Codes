import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    depth: v.optional(v.number()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    isBanned: v.boolean(),
    userId: v.string(),
  }).index("by_email", ["email"]),

  tasks: defineTable({
    userId: v.string(),
    task: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("high"), v.literal("mid"), v.literal("low")),
    isCompleted: v.boolean(),
    rewardPoints: v.number(),
  }).index("by_user", ["userId"]),

  classes: defineTable({
    userId: v.string(),
    day: v.string(), 
    className: v.string(), 
    time: v.number(), 
    endDate: v.string(), 
  })
    .index("by_user", ["userId"])
    .index("by_user_day", ["userId", "day"]),

  exams: defineTable({
    userId: v.string(),
    examName: v.string(),
    date: v.string(), // Exam date and time 
  }).index("by_user", ["userId"]),

  quizzesAndAssignments: defineTable({
    userId: v.string(),
    name: v.string(),
    date: v.string(),
    label: v.union(v.literal("quiz"), v.literal("assignment")),
  }).index("by_user", ["userId"]),

  goals: defineTable({
    userId: v.string(),
    goal: v.string(), 
  }).index("by_user", ["userId"]),

  reminders: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    time: v.string(), 
  }).index("by_user", ["userId"]),

  focusTimers: defineTable({
    userId: v.string(),
    sessionCount: v.number(),
    totalMinutes: v.number(),
    currentSessionStart: v.optional(v.number()),
    lastPausedAt: v.optional(v.number()),
    pausedTimeTotal: v.optional(v.number()),
    status: v.string(),
  }).index("by_user", ["userId"]),

  habits: defineTable({
    userId: v.string(),
    habit: v.string(),
    daysCount: v.number(),
    currentCount: v.number(),
  }).index("by_user", ["userId"]),
});
