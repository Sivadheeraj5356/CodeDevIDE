// Shared identity helpers. Every public function must go through these so a
// client can never act on another user's data by guessing an email or an id.

export async function requireIdentity(ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated: sign in with Google first.");
  }
  return identity;
}

export async function getUserByEmail(ctx, email) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
}

// The signed-in user's own account row, or throw. Callers never pass an email
// or user id for themselves: identity comes only from the verified token.
export async function requireUser(ctx) {
  const identity = await requireIdentity(ctx);
  const user = await getUserByEmail(ctx, identity.email);
  if (!user) {
    throw new Error(
      "No account found for the signed-in Google user. Create the account first."
    );
  }
  return user;
}

// Load a workspace AND prove the caller owns it before any read or write.
export async function requireOwnedWorkspace(ctx, workspaceId) {
  const user = await requireUser(ctx);
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found: " + workspaceId);
  }
  if (workspace.user !== user._id) {
    throw new Error(
      "Not authorized: this workspace belongs to a different account."
    );
  }
  return { user, workspace };
}
