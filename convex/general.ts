import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const getMedialURL = async (ctx: QueryCtx, url: string) => {
  if (!url || !url.startsWith("http")) {
    return url;
  }

  const newURL = await ctx.storage.getUrl(url as Id<"_storage">);

  return newURL;
};

export const generateUploadURL = mutation({
  handler: async (ctx) => {
    await getCurrentUserOrThrow(ctx);

    return await ctx.storage.generateUploadUrl();
  },
});
