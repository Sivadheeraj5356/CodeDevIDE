import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireOwnedWorkspace } from "./authUtils";

export const createWorkspace = mutation({
    args: {
        messages: v.any(),
        // Legacy shape tolerated: the old client supplied the owner id. It is
        // IGNORED - ownership always comes from the verified identity.
        user: v.optional(v.id('users'))
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const workspaceId = await ctx.db.insert('workspace', {
            messages: args.messages,
            user: user._id
        })
        return workspaceId
    }
})

export const getWorkspace = query({
    args: {
        workspaceId: v.id('workspace')
    },
    handler: async (ctx, args) => {
        const { workspace } = await requireOwnedWorkspace(ctx, args.workspaceId)
        return workspace
    }
})

export const updateWorkspace = mutation({
    args: {
        workspaceId: v.id('workspace'),
        messages: v.any()
    },
    handler: async (ctx, args) => {
        await requireOwnedWorkspace(ctx, args.workspaceId)
        const result = await ctx.db.patch(args.workspaceId, {
            messages: args.messages
        })
        return result
    }
})

export const updateFiles = mutation({
    args: {
        workspaceId: v.id('workspace'),
        files: v.any()
    },
    handler: async (ctx, args) => {
        if (!args.files || typeof args.files !== 'object' || Object.keys(args.files).length === 0) {
            throw new Error('No files were provided to save for this workspace')
        }
        await requireOwnedWorkspace(ctx, args.workspaceId)
        await ctx.db.patch(args.workspaceId, {
            fileData: args.files
        })
        return args.workspaceId
    }
})

export const GetAllWorkspace = query({
    args: {
        // Legacy shape tolerated (old client passed userId). IGNORED: the
        // list always contains only the caller's own workspaces.
        userId: v.optional(v.id('users'))
    },
    handler: async (ctx) => {
        const user = await requireUser(ctx)
        const result = await ctx.db.query('workspace')
            .withIndex('by_user', q => q.eq('user', user._id))
            .collect()
        return result
    }
})
