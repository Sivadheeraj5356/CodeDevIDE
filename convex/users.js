import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string()
  },
  handler: async (ctx, args) => {
    console.log("Creating user with args:", args);
        const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      picture: args.picture,
      uid: args.uid
    });
    
    const user = await ctx.db.get(userId);
    console.log("Created user:", user);
    return user;
  }
});

export const GetUser = query({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    console.log("Getting user with email:", args.email);
    
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .first();
    
    console.log("Found user:", user);
    return user;
  }
});