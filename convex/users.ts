import { v } from "convex/values";
import { internalMutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getMedialURL } from "./general";

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUsername) {
      throw new Error("Username already exists");
    }

    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const existingClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingClerkId) {
      throw new Error("Clerk ID already exists");
    }

    const userId = await ctx.db.insert("users", {
      ...args,
      username: args.username || args.name,
    });

    return userId;
  },
});

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.imageUrl || user.imageUrl.startsWith("http")) {
      return user;
    }

    const url = await getMedialURL(ctx, user.imageUrl);

    return {
      ...user,
      imageUrl: url,
    };
  },
});

export const getUserById = async (ctx: QueryCtx, userId: Id<"users">) => {
  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.imageUrl || user.imageUrl.startsWith("http")) {
    return user;
  }

  const url = await getMedialURL(ctx, user.imageUrl);

  return {
    ...user,
    imageUrl: url,
  };
};

// CHECK IDENTITY

export const current = query({
  args: {},
  handler: async (ctx, args) => {
    return await getCurrentUser(ctx);
  },
});

export const getCurrentUser = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return userByExteRnalId(ctx, identity.subject);
};

export const userByExteRnalId = async (ctx: QueryCtx, externalId: string) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", externalId))
    .unique();
};

export const getCurrentUserOrThrow = async (ctx: QueryCtx) => {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const searchUsers = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);

    const searchQuery = args.query.toLowerCase().trim();

    if (!searchQuery) return [];

    const allUsers = await ctx.db.query("users").collect();

    // filters

    const filteredUsers = allUsers.filter((user) => {
      if (user._id === currentUser._id) return false;

      return (
        (user.email && user.email.toLowerCase().includes(searchQuery)) ||
        (user.name && user.name.toLowerCase().includes(searchQuery)) ||
        (user.username && user.username.toLowerCase().includes(searchQuery)) ||
        (user.phoneNumber &&
          user.phoneNumber.toLowerCase().includes(searchQuery))
      );
    });

    filteredUsers.sort((a, b) => {
      const aExactUser =
        a.email?.toLowerCase() === searchQuery ||
        a.name?.toLowerCase() === searchQuery ||
        a.username?.toLowerCase() === searchQuery ||
        a.phoneNumber?.toLowerCase() === searchQuery;

      const bExactUser =
        b.email?.toLowerCase() === searchQuery ||
        b.name?.toLowerCase() === searchQuery ||
        b.username?.toLowerCase() === searchQuery ||
        b.phoneNumber?.toLowerCase() === searchQuery;

      if (aExactUser && !bExactUser) return -1;
      if (!aExactUser && bExactUser) return 1;

      return a.name.localeCompare(b.name);
    });

    const first20Users = filteredUsers.slice(0, 20);

    const userList = await Promise.all(
      first20Users.map(async (user) => {
        if (user.imageUrl && user.imageUrl.startsWith("http")) {
          return user;
        }

        const url = await ctx.storage.getUrl(user.imageUrl as Id<"_storage">);

        return {
          ...user,
          imageUrl: url,
        };
      })
    );

    return userList;
  },
});
