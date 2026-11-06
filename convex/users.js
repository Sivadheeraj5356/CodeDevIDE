import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireIdentity, getUserByEmail, requireUser } from "./authUtils";

// Get-or-create the caller's OWN account from the verified Google identity.
// The client no longer supplies name/email/picture: those come from the ID
// token the backend verified, so nobody can register under someone else's
// email or read another account by guessing one.
export const CreateUser = mutation({
  // Legacy argument shape tolerated (the old client sent name/email/picture/uid)
  // so a stale-but-signed-in client never hits a validation wall. Every value
  // comes from the verified identity; the legacy fields are IGNORED.
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    picture: v.optional(v.string()),
    uid: v.optional(v.string())
  },
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const existing = await getUserByEmail(ctx, identity.email);
    if (existing) {
      return existing;
    }

    const userId = await ctx.db.insert("users", {
      name: identity.name ?? "",
      email: identity.email,
      picture: identity.pictureUrl ?? "",
      uid: identity.subject
    });

    return await ctx.db.get(userId);
  }
});

export const GetUser = query({
  // Legacy email argument accepted in shape, ignored in effect: the caller
  // always gets the account behind their own verified identity.
  args: {
    email: v.optional(v.string())
  },
  handler: async (ctx) => {
    return await requireUser(ctx);
  }
});
