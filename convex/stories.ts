import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, getUserById } from "./users";
import { getMedialURL } from "./general";
import { Id } from "./_generated/dataModel";

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

    const friendsId = args.friends?.length
      ? args.friends
      : [user._id, ...(user?.friends ?? [])];

    const storiesPromises = friendsId.map((friend) =>
      ctx.db
        .query("stories")
        .withIndex("by_user", (q) => q.eq("userId", friend))
        .filter((q) => q.gte(q.field("expiresAt"), now))
        .collect()
    );

    const storiesRaw = await Promise.all(storiesPromises);

    const stories = storiesRaw.flat();

    //   get media links
    const storyWithMedia = await Promise.all(
      stories.map(async (story) => {
        const [media, user] = await Promise.all([
          ctx.storage.getUrl(story.content.storageId as Id<"_storage">),
          getUserById(ctx, story.userId as Id<"users">),
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

    //group stories by user
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

    // sort stories by sequence
    Object.keys(storiesByUser).forEach((userId) => {
      storiesByUser[userId].sort((a, b) => a.sequence - b.sequence);
    });

    return storiesByUser;
  },
});
