import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, getUserById } from "./users";
import { Id } from "./_generated/dataModel";

export const createChat = mutation({
  args: {
    participants: v.array(v.string()),
    name: v.optional(v.string()),
    isGroup: v.optional(v.boolean()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const allParticipants = [
      ...new Set([...args.participants, user._id as Id<"users">]),
    ];

    // user1_user2 user2_user1
    if (!args.isGroup) {
      const existingChat = await ctx.db
        .query("chats")
        .filter((q) =>
          q.or(
            q.eq(q.field("combinedUserIds"), allParticipants.sort().join("_")),
            q.eq(
              q.field("combinedUserIds"),
              allParticipants.sort().reverse().join("_")
            )
          )
        )
        .first();

      if (existingChat) {
        return existingChat._id;
      }
    }

    const combinedUserIds = allParticipants.sort().join("_");
    const chatId = await ctx.db.insert("chats", {
      combinedUserIds,
      name: args.name || "",
      isGroup: args.isGroup || false,
      participants: allParticipants,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return chatId;
  },
});

export const getChats = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (!user) {
      return [];
    }

    const rawChats = await ctx.db
      .query("chats")
      .withIndex("by_participants")
      .order("desc")
      .collect();

    const chats = rawChats.filter((chat) =>
      chat.participants.includes(user._id as Id<"users">)
    );

    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_chat_id", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .first();

        const participantsInfo = await Promise.all(
          chat.participants
            .filter((id) => id !== user._id)
            .map(async (userId) => {
              return await getUserById(ctx, userId as Id<"users">);
            })
        );

        const chatName = chat.isGroup
          ? chat.name
          : participantsInfo[0]?.name || "Unknown";

        const chatImage = chat.isGroup
          ? chat.image
          : participantsInfo[0]?.imageUrl || null;

        const unReadMessages = await ctx.db
          .query("messageStatus")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("isRead"), false))
          .collect();

        const chatUnreadMessages = await Promise.all(
          unReadMessages.map(async (status) => {
            const message = await ctx.db.get(status.messageId);
            return message && message.chatId === chat._id ? status : null;
          })
        );

        const unreadCount = chatUnreadMessages.filter(Boolean).length;

        return {
          ...chat,
          name: chatName,
          image: chatImage,
          lastMessage,
          participantsInfo,
          unreadCount,
        };
      })
    );

    return chatsWithLastMessage;
  },
});

export const getChatById = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (!user) {
      return null;
    }

    const chat = await ctx.db.get(args.id);

    if (!chat) {
      return null;
    }

    if (!chat.participants.includes(user._id as Id<"users">)) {
      throw new ConvexError("You are not a participant of this chat");
    }

    const participantsInfo = await Promise.all(
      chat.participants.map(async (userId) => {
        return await getUserById(ctx, userId as Id<"users">);
      })
    );

    const chatName = chat.isGroup
      ? chat.name
      : participantsInfo[0]?.name || "Unknown";

    const chatImage = chat.isGroup
      ? chat.image
      : participantsInfo[0]?.imageUrl || null;

    return {
      ...chat,
      name: chatName,
      image: chatImage,
      participantsInfo,
    };
  },
});
