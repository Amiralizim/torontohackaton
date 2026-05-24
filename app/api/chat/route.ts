import { backboard } from "@/lib/backboard";
import type { ChatMessagesResponse } from "backboard-sdk";

export const runtime = "nodejs";

type Body = {
  content?: string;
  threadId?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content) {
    return Response.json({ error: "`content` is required" }, { status: 400 });
  }

  const result = (await backboard.sendMessage({
    content,
    threadId: body.threadId,
    memory: "Auto",
  })) as ChatMessagesResponse;

  return Response.json({
    content: result.content,
    threadId: result.threadId,
    assistantId: result.assistantId,
  });
}
