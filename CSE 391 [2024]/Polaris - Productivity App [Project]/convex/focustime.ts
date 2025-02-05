import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Define the status type
type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus];

const SessionStatus = {
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

// Define the document type
interface FocusTimer {
  _id: string;
  _creationTime: number;
  userId: string;
  sessionCount: number;
  totalMinutes: number;
  currentSessionStart: number | undefined;
  lastPausedAt: number | undefined;
  pausedTimeTotal: number | undefined;
  status: SessionStatus;
}

// Get user focus stats
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("focusTimers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!stats) {
      return {
        totalMinutes: 0,
        sessionCount: 0,
      };
    }

    return {
      totalMinutes: stats.totalMinutes,
      sessionCount: stats.sessionCount,
    };
  },
});

// Start a new focus timer session
export const startFocusTimer = mutation({
  args: { minutes: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const now = Date.now();

    const existingStats = await ctx.db
      .query("focusTimers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, {
        sessionCount: existingStats.sessionCount + 1,
        currentSessionStart: now,
        lastPausedAt: undefined,
        pausedTimeTotal: 0,
        status: SessionStatus.ACTIVE,
      });
    } else {
      await ctx.db.insert("focusTimers", {
        userId,
        sessionCount: 1,
        totalMinutes: 0, // Start with 0 minutes, update incrementally
        currentSessionStart: now,
        lastPausedAt: undefined,
        pausedTimeTotal: 0,
        status: SessionStatus.ACTIVE,
      });
    }

    return true;
  },
});

// Pause the focus timer session
export const pauseFocusTimer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const now = Date.now();

    const existingStats = await ctx.db
      .query("focusTimers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingStats) {
      throw new Error("No active focus timer session");
    }

    if (existingStats.status !== SessionStatus.ACTIVE) {
      throw new Error("Timer is not active");
    }

    await ctx.db.patch(existingStats._id, {
      lastPausedAt: now,
      status: SessionStatus.PAUSED,
    });

    return true;
  },
});

// Resume the paused focus timer session
export const resumeFocusTimer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const now = Date.now();

    const existingStats = await ctx.db
      .query("focusTimers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingStats) {
      throw new Error("No focus timer session found");
    }

    if (existingStats.status !== SessionStatus.PAUSED) {
      throw new Error("Timer is not paused");
    }

    if (existingStats.lastPausedAt === undefined) {
      throw new Error("Invalid pause state");
    }

    const pausedTime = (now - existingStats.lastPausedAt) / (1000 * 60);
    const newPausedTimeTotal = (existingStats.pausedTimeTotal || 0) + pausedTime;

    await ctx.db.patch(existingStats._id, {
      lastPausedAt: undefined,
      pausedTimeTotal: newPausedTimeTotal,
      status: SessionStatus.ACTIVE,
    });

    return true;
  },
});

// Complete the focus timer session
export const completeFocusTimer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const now = Date.now();

    const existingStats = await ctx.db
      .query("focusTimers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingStats) {
      throw new Error("No focus timer session found");
    }

    if (existingStats.currentSessionStart === undefined) {
      throw new Error("No active session found");
    }

    const totalSessionTime = (now - existingStats.currentSessionStart) / (1000 * 60);
    const effectiveFocusTime = totalSessionTime - (existingStats.pausedTimeTotal || 0);

    await ctx.db.patch(existingStats._id, {
      totalMinutes: existingStats.totalMinutes + effectiveFocusTime,
      currentSessionStart: undefined,
      lastPausedAt: undefined,
      pausedTimeTotal: undefined,
      status: SessionStatus.COMPLETED,
    });

    return {
      totalSessionTime: Math.round(totalSessionTime),
      effectiveFocusTime: Math.round(effectiveFocusTime),
    };
  },
});

// Increment total focus time
export const incrementTotalFocusTime = mutation({
  args: { minutes: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingStats = await ctx.db
      .query("focusTimers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingStats) {
      throw new Error("No focus timer session found");
    }

    await ctx.db.patch(existingStats._id, {
      totalMinutes: existingStats.totalMinutes + args.minutes,
    });

    return existingStats.totalMinutes + args.minutes;
  },
});
