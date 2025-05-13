import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    lastSeen: v.optional(v.number()),
    isOnline: v.optional(v.boolean()),
    friends: v.optional(v.array(v.string())),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_phone_number", ["phoneNumber"]),

  // chat
  chats: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isGroup: v.boolean(),
    participants: v.array(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    combinedUserIds: v.optional(v.string()),
    image: v.optional(v.string()),
  })
    .index("by_combined_user_ids", ["combinedUserIds"])
    .index("by_participants", ["participants"])
    .index("by_updated_at", ["updatedAt"]),

  // messages
  messages: defineTable({
    chatId: v.string(),
    text: v.optional(v.string()),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          type: v.string(),
          mimeType: v.optional(v.string()),
          fileSize: v.optional(v.number()),
          fileName: v.optional(v.string()),
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
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_chat_id", ["chatId"]),

  // Stories table
  stories: defineTable({
    userId: v.string(),
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
    createdAt: v.number(),
    expiresAt: v.number(), // Stories typically expire after 24 hours
    viewers: v.array(v.string()), // Array of user IDs who have viewed the story
    isActive: v.boolean(), // Whether the story is still active/visible
    sequence: v.number(), // Order of the story in user's story list
    storyGroupId: v.string(), // Groups related stories together (e.g., multiple parts of same story)
  })
    .index("by_user", ["userId"])
    .index("by_expiry", ["expiresAt"])
    .index("by_active", ["isActive"])
    .index("by_user_sequence", ["userId", "sequence"])
    .index("by_story_group", ["storyGroupId"]),

  // Message Status table (for tracking send/read status)
  messageStatus: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    isSent: v.boolean(),
    isDelivered: v.boolean(),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"]),
});
