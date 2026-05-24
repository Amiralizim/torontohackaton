export const RECIPE_GENERATOR_PROMPT = `Generate healthy meal ideas (meals or full-day menus) strictly using the provided ingredient data table. For each meal, select 2–6 compatible ingredients spanning at least two food groups, assigning portions for nutritional balance. For a full-day menu (3+ meals), ensure the total nutrition meets established guidelines (~2000 kcal, balanced macronutrient percent, micronutrients; cite which public guideline is followed).

All calculations—nutrition totals, portions, and ingredient choices—must derive only from the supplied ingredient data. For each meal, briefly reason through ingredient/portion selection and meal design before any output.

Key updates:
- For every meal in the JSON output, include a succinct, traditional-style "cooking_instructions" field describing preparation as a recipe would.
- Be less verbose overall. Output only the recipe(s), nutrition totals, and short essential descriptors.
- Retain clear reasoning before output; however, do not add lengthy or unnecessary text—the reasoning should be concise and strictly focused on meal construction and nutrition goals.
- Tailor the complexity of "cooking_instructions" to the user's stated cooking skill level (Beginner → minimal steps and basic techniques; Master → may include advanced technique cues).

# Steps
1. Review the provided ingredient data for diversity and nutrient coverage.
2. For each meal:
   - Select 2–6 compatible ingredients (from different food groups), assign moderate portions (in grams).
   - Reason briefly (before any output): why these ingredients/portions, how they advance nutrition/health targets.
   - Calculate meal totals: calories, protein, fat, carbs (per chosen weights).
   - Summarize key nutrition benefits/claims.
   - Compose a clear, traditionally-styled "cooking_instructions" step for each meal.
   - Output each meal as a JSON object as specified.
3. If building a full-day menu:
   - Compose at least 3 meals; maximize dietary variety and food group inclusion.
   - Sum and report day totals (energy and macros), with macronutrient percentages.
   - Add a day summary object reporting guideline adherence.
   - Briefly note which public nutrition guideline is followed.

# Output Format
Return a single JSON object matching this TypeScript shape:
{
  "meals": [
    {
      "meal_name": string,
      "ingredients": [{ "food_name": string, "amount_g": number }],
      "totals": { "calories": number, "protein_g": number, "fat_g": number, "carbs_g": number },
      "highlight_nutrients": string[],
      "cooking_instructions": string
    }
  ],
  "daily_summary"?: {
    "total_calories": number,
    "total_protein_g": number,
    "total_fat_g": number,
    "total_carbs_g": number,
    "percent_protein": number,
    "percent_fat": number,
    "percent_carbs": number,
    "public_guideline_adherence": string
  }
}

# Notes
- Use only the supplied ingredient table for selections and calculations.
- "cooking_instructions" must reflect simple, traditional recipe steps for each meal, based on included ingredients.
- Omit any redundant explanation outside the JSON.
- Reason concisely before output; do not include extra narration, background, or template reminders.
`;

export function buildUserMessage(request: {
  skillLevel: string;
  confidence: number;
  mode: "single_meal" | "full_day";
  dietary?: string[];
  calorieTarget?: number;
  availableIngredients?: string[];
}): string {
  return [
    "USER PROFILE:",
    `- Cooking skill level: ${request.skillLevel} (confidence ${request.confidence}/100)`,
    `- Mode: ${request.mode}`,
    request.dietary?.length
      ? `- Dietary preferences: ${request.dietary.join(", ")}`
      : "- Dietary preferences: none specified",
    request.calorieTarget
      ? `- Calorie target: ${request.calorieTarget} kcal`
      : "- Calorie target: not specified (use ~2000 kcal for full_day)",
    request.availableIngredients?.length
      ? `- Restrict selections to these foods only: ${request.availableIngredients.join(", ")}`
      : "- No further ingredient restriction beyond the provided table",
    "",
    request.mode === "full_day"
      ? "Produce a full-day menu (3+ meals) with daily_summary."
      : "Produce one meal. Omit daily_summary.",
  ].join("\n");
}
