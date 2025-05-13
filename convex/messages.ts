import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, getUserById } from "./users";
import { Id } from "./_generated/dataModel";

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    text: v.optional(v.string()),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          type: v.string(),
          fileName: v.optional(v.string()),
          fileSize: v.optional(v.number()),
          mimeType: v.optional(v.string()),
          duration: v.optional(v.number()),
          dimensions: v.optional(
            v.object({
              width: v.number(),
              height: v.number(),
            })
          ),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const chat = await ctx.db.get(args.chatId);

    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    if (!chat.participants.includes(user._id)) {
      throw new ConvexError("You are not a participant of this chat");
    }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      text: args.text,
      media: args.media,
      userId: user._id,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.chatId, {
      updatedAt: Date.now(),
    });

    // message status

    await Promise.all(
      chat.participants.map(async (participant) => {
        const isCurrentUser = participant === user._id;

        await ctx.db.insert("messageStatus", {
          messageId,
          userId: participant as Id<"users">,
          isSent: true,
          isDelivered: isCurrentUser,
          isRead: isCurrentUser,
          readAt: isCurrentUser ? Date.now() : undefined,
          deliveredAt: isCurrentUser ? Date.now() : undefined,
          createdAt: Date.now(),
        });
      })
    );

    return messageId;
  },
});

export const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const chat = await ctx.db.get(args.chatId);

    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    if (!chat.participants.includes(user._id)) {
      throw new ConvexError("You are not a participant of this chat");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_id", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(50);

    const messageWithMedia = await Promise.all(
      messages.map(async (message) => {
        const user = await getUserById(ctx, message.userId as Id<"users">);

        if (message.media && message.media.length > 0) {
          const mediaUrls = await Promise.all(
            message.media.map(async (media) => {
              if (media.storageId) {
                const url = await ctx.storage.getUrl(
                  media.storageId as Id<"_storage">
                );

                return {
                  ...media,
                  url: url,
                };
              }

              return media;
            })
          );

          return {
            ...message,
            media: mediaUrls,
            user: user,
          };
        }

        return message;
      })
    );

    return messageWithMedia;
  },
});

export const markMessageAsRead = mutation({
  args: {
    chatId: v.id("chats"),
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check if the chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    // Check if the user is a participant in the chat
    if (!chat.participants.includes(user?._id as Id<"users">)) {
      throw new ConvexError("You are not a participant in this chat");
    }

    await Promise.all(
      args.messageIds.map(async (messageId) => {
        const messageStatus = await ctx.db
          .query("messageStatus")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("messageId"), messageId))
          .first();

        if (messageStatus && !messageStatus.isRead) {
          await ctx.db.patch(messageStatus._id, {
            isRead: true,
            readAt: Date.now(),
            isDelivered: true,
            deliveredAt: Date.now(),
          });
        }
      })
    );

    return true;
  },
});
