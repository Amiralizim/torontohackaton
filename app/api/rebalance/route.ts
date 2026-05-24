import { BackboardClient } from "backboard-sdk";
import type { NextRequest } from "next/server";
import {
  STREAM_RESPONSE_HEADERS,
  extractJsonObject,
  sse,
} from "../../lib/llm-stream";
import {
  REBALANCE_PROMPT,
  buildRebalanceUserMessage,
} from "../../lib/prompt";
import type { Meal, RebalanceResponse } from "../../lib/types";

type RebalanceRequestBody = {
  meal?: Meal;
  dietary?: string[];
  mealType?: string;
};

function validate(body: unknown):
  | { meal: Meal; dietary?: string[]; mealType?: string }
  | { error: string } {
  if (!body || typeof body !== "object") return { error: "body must be JSON" };
  const b = body as RebalanceRequestBody;
  const m = b.meal;
  if (!m || typeof m !== "object") return { error: "meal is required" };
  if (typeof m.meal_name !== "string") return { error: "meal.meal_name is required" };
  if (!Array.isArray(m.ingredients) || m.ingredients.length === 0) {
    return { error: "meal.ingredients must be a non-empty array" };
  }
  if (!m.totals || typeof m.totals !== "object") {
    return { error: "meal.totals is required" };
  }
  return { meal: m, dietary: b.dietary, mealType: b.mealType };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "BACKBOARD_API_KEY is not set in the environment" },
      { status: 500 },
    );
  }

  const reqJson = await request.json().catch(() => null);
  const parsed = validate(reqJson);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const client = new BackboardClient({ apiKey });

  const sendOptions: Parameters<BackboardClient["sendMessage"]>[0] = {
    content: buildRebalanceUserMessage(parsed),
    system_prompt: REBALANCE_PROMPT,
    llm_provider: process.env.BACKBOARD_PROVIDER ?? "anthropic",
    json_output: true,
    stream: true,
    memory: "off",
  };
  if (process.env.BACKBOARD_MODEL) {
    sendOptions.model_name = process.env.BACKBOARD_MODEL;
  }

  let upstream: AsyncGenerator<unknown> | null = null;
  try {
    const response = await client.sendMessage(sendOptions);
    if (!(Symbol.asyncIterator in response)) {
      return Response.json(
        { error: "Backboard returned non-streaming response" },
        { status: 502 },
      );
    }
    upstream = response as AsyncGenerator<unknown>;
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "request failed" },
      { status: 500 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let accumulated = "";
      try {
        for await (const chunk of upstream!) {
          const c = chunk as { type?: string; content?: string };
          if (c.type === "content_streaming" && typeof c.content === "string") {
            accumulated += c.content;
            controller.enqueue(
              encoder.encode(sse({ type: "delta", delta: c.content })),
            );
          }
        }

        const candidate = extractJsonObject(accumulated);
        if (!candidate) {
          console.error("[rebalance] no JSON in stream:\n", accumulated);
          controller.enqueue(
            encoder.encode(
              sse({
                type: "error",
                error: "model returned non-JSON output",
                raw: accumulated.slice(0, 1500),
              }),
            ),
          );
        } else {
          try {
            const result = JSON.parse(candidate) as RebalanceResponse;
            controller.enqueue(encoder.encode(sse({ type: "done", result })));
          } catch (parseErr) {
            console.error("[rebalance] JSON.parse failed:\n", candidate, parseErr);
            controller.enqueue(
              encoder.encode(
                sse({
                  type: "error",
                  error: "model returned malformed JSON",
                  raw: candidate.slice(0, 1500),
                }),
              ),
            );
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            sse({
              type: "error",
              error: err instanceof Error ? err.message : "stream failed",
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: STREAM_RESPONSE_HEADERS });
}
