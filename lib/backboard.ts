import { BackboardClient } from "backboard-sdk";

const apiKey = process.env.BACKBOARD_API_KEY;

if (!apiKey) {
  throw new Error("BACKBOARD_API_KEY is not set. Add it to .env.local");
}

export const backboard = new BackboardClient({ apiKey });
