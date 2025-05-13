import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, getUserById } from "./users";

export const createStory = mutation({
  args: {
    type: v.union(v.literal("image"), v.literal("video"), v.literal("text")),
    content: v.object({
      storageId: v.string(),
      duration: v.optional(v.number()),
      dimensions: v.optional(
        v.object({
          width: v.number(),
          height: v.number(),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const latestStory = await ctx.db
      .query("stories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    const sequence = (latestStory?.sequence ?? 0) + 1;
    const now = Date.now();

    const expiresAt = now + 24 * 60 * 60 * 1000;

    return await ctx.db.insert("stories", {
      userId: user._id,
      type: args.type,
      content: args.content,
      createdAt: now,
      expiresAt,
      viewers: [],
      isActive: true,
      sequence,
      storyGroupId: `${user._id}_${now}`,
    });
  },
});

export const getStories = query({
  args: {
    friends: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const now = Date.now();

    // Combine the current user ID and their friends' IDs
    const friendsId = [user?._id, ...(user?.friends ?? [])];

    // Query stories for each user in parallel
    const storiesPromises = friendsId.map((friendId) =>
      ctx.db
        .query("stories")
        .withIndex("by_user", (q) => q.eq("userId", friendId as Id<"users">))
        .filter((q) => q.gt(q.field("expiresAt"), now))
        .collect()
    );

    // Wait for all queries to complete
    const storiesArrays = await Promise.all(storiesPromises);

    // Flatten the array of arrays into a single array
    const stories = storiesArrays.flat();

    // Get media for each story
    const storyWithMedia = await Promise.all(
      stories.map(async (story) => {
        const [media, user] = await Promise.all([
          ctx.storage.getUrl(story?.content?.storageId as Id<"_storage">),
          getUserById(ctx, story?.userId as Id<"users">),
        ]);

        return {
          ...story,
          content: {
            ...story.content,
            media,
          },
          user: user,
        };
      })
    );

    // Group stories by user
    const storiesByUser = storyWithMedia.reduce(
      (acc, story) => {
        if (!acc[story.userId]) {
          acc[story.userId] = [];
        }
        acc[story.userId].push(story);
        return acc;
      },
      {} as Record<string, typeof stories>
    );

    // Sort stories by sequence within each user's group
    Object.keys(storiesByUser).forEach((userId) => {
      storiesByUser[userId].sort((a, b) => a.sequence - b.sequence);
    });

    return storiesByUser;
  },
});

export const markStoryAsViewed = mutation({
  args: {
    storyId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const story = await ctx.db.get(args.storyId as Id<"stories">);

    if (!story) {
      throw new Error("Story not found");
    }

    if (story.viewers.includes(user._id)) {
      return;
    }

    if (!story.isActive && !story.viewers.includes(user._id)) {
      await ctx.db.patch(args.storyId as Id<"stories">, {
        viewers: [...story.viewers, user._id],
      });
    }

    return { success: true };
  },
});

export const deleteExpiredStories = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // get all expired stories
    const expiredStories = await ctx.db
      .query("stories")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    // delete each image
    for (const story of expiredStories) {
      if (story.content.storageId) {
        await ctx.storage.delete(story.content.storageId as Id<"_storage">);
      }

      await ctx.db.delete(story._id as Id<"stories">);
    }
    console.log(`Deleted ${expiredStories.length} expired stories`);
    return `Deleted ${expiredStories.length} expired stories`;
  },
});
