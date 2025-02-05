import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { query } from "./_generated/server";

export const createUser = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error(" authentication Failed");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    return await ctx.db.insert("users", {
      email: args.email,
      fullName: args.fullName,
      userId: args.userId,
      isBanned: false
    });
  },
});


export const getTotalUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateBanStatus = mutation({
  args: { 
    userId: v.string(),
    isBanned: v.boolean()
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();
    
    if (users.length === 0) {
      throw new Error("User not found");
    }

    const user = users[0];
    await ctx.db.patch(user._id, { isBanned: args.isBanned });
  },
});


export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();
      
    return user;
  }
});
