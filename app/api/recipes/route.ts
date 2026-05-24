import { BackboardClient } from "backboard-sdk";
import type { NextRequest } from "next/server";
import ingredientsData from "../../data/ingredients.json";
import { RECIPE_GENERATOR_PROMPT, buildUserMessage } from "../../lib/prompt";
import type {
  Ingredient,
  RecipeRequest,
  RecipeResponse,
} from "../../lib/types";

const ingredients = ingredientsData as Ingredient[];

const SYSTEM_PROMPT = `CRITICAL OUTPUT RULE — your entire response must be exactly one JSON object and nothing else. No prose, no preamble, no markdown, no code fences, no trailing commentary. The first character of your response must be "{" and the last must be "}". If you want to reason, do it silently before writing the JSON.

The JSON object must match this TypeScript type:
type RecipeResponse = {
  meals: {
    meal_name: string;
    ingredients: { food_name: string; amount_g: number }[];
    totals: { calories: number; protein_g: number; fat_g: number; carbs_g: number };
    highlight_nutrients: string[];
    cooking_instructions: string;
  }[];
  daily_summary?: {
    total_calories: number;
    total_protein_g: number;
    total_fat_g: number;
    total_carbs_g: number;
    percent_protein: number;
    percent_fat: number;
    percent_carbs: number;
    public_guideline_adherence: string;
  };
};

${RECIPE_GENERATOR_PROMPT}

INGREDIENT DATA TABLE (the only source of nutrition values you may use — every portion and total must be derived from this table):
${JSON.stringify(ingredients)}`;

function validate(body: unknown): RecipeRequest | { error: string } {
  if (!body || typeof body !== "object") return { error: "body must be JSON" };
  const b = body as Partial<RecipeRequest>;
  if (!b.skillLevel) return { error: "skillLevel is required" };
  if (typeof b.confidence !== "number") return { error: "confidence is required" };
  if (b.mode !== "single_meal" && b.mode !== "full_day") {
    return { error: "mode must be 'single_meal' or 'full_day'" };
  }
  return b as RecipeRequest;
}

function extractJsonObject(s: string): string | null {
  const cleaned = s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) return cleaned;

  // Fall back to scanning for a balanced top-level object — handles cases
  // where the model wraps the JSON in prose despite instructions.
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "BACKBOARD_API_KEY is not set in the environment" },
      { status: 500 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = validate(json);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const client = new BackboardClient({ apiKey });

  const sendOptions: Parameters<BackboardClient["sendMessage"]>[0] = {
    content: buildUserMessage(parsed),
    system_prompt: SYSTEM_PROMPT,
    llm_provider: process.env.BACKBOARD_PROVIDER ?? "anthropic",
    json_output: true,
    stream: false,
  };

  if (process.env.BACKBOARD_MODEL) {
    sendOptions.model_name = process.env.BACKBOARD_MODEL;
  }

  try {
    const response = await client.sendMessage(sendOptions);

    if (Symbol.asyncIterator in response) {
      return Response.json(
        { error: "unexpected streaming response from Backboard" },
        { status: 502 },
      );
    }

    const raw = response.content ?? "";
    if (!raw.trim()) {
      console.error("[recipes] empty model response", { messages: response.messages });
      return Response.json(
        { error: "model returned empty content" },
        { status: 502 },
      );
    }

    const candidate = extractJsonObject(raw);
    if (!candidate) {
      console.error("[recipes] no JSON object in model response:\n", raw);
      return Response.json(
        {
          error: "model returned non-JSON output",
          raw: raw.slice(0, 1500),
        },
        { status: 502 },
      );
    }

    let result: RecipeResponse;
    try {
      result = JSON.parse(candidate) as RecipeResponse;
    } catch (parseErr) {
      console.error("[recipes] JSON.parse failed:\n", candidate, "\nerror:", parseErr);
      return Response.json(
        {
          error: "model returned malformed JSON",
          raw: candidate.slice(0, 1500),
        },
        { status: 502 },
      );
    }

    return Response.json(result, {
      headers: {
        "x-model-name": response.messages.at(-1)?.modelName ?? "",
        "x-model-provider": response.messages.at(-1)?.modelProvider ?? "",
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "request failed" },
      { status: 500 },
    );
  }
}
