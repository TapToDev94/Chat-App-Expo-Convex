import { httpActionGeneric, httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

// define the webhook handler
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await request.json();

  if (!event) {
    return new Response("Error occured", { status: 400 });
  }
  switch (event.type) {
    case "user.created":
    case "user.updated": {
      await ctx.runMutation(internal.users.createUser, {
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address,
        name: event.data.first_name || "" + " " + event.data.last_name || "",
        imageUrl: event.data.image_url,
        username: event.data.username || "",
      });
      break;
    }
    case "user.deleted": {
      break;
    }
    default: {
      console.log("ignored Clerk webhook event", event.type);
    }
  }
  return new Response(null, { status: 200 });
});

// define the http router
const http = httpRouter();

// define the webhook route
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
