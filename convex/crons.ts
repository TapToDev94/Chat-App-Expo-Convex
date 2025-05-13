import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "delete-expired-stories",
  { hourUTC: 0, minuteUTC: 0 }, // run at midnight UTC
  internal.stories.deleteExpiredStories
);

// crons.interval(
//   "delete-expired-stories",
//   { minutes: 1 },
//   internal.stories.deleteExpiredStories
// );

export default crons;
