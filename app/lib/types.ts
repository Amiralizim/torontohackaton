export type FoodGroup =
  | "grain"
  | "protein"
  | "dairy"
  | "fruit"
  | "vegetable"
  | "fat"
  | "legume";

export type NutritionFacts = {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g?: number;
};

export type Ingredient = {
  food_name: string;
  food_group: FoodGroup;
  per_100g: NutritionFacts;
};

export type SkillLevel =
  | "Beginner"
  | "Average"
  | "Intermediate"
  | "Pro"
  | "Master";

export type RecipeRequest = {
  skillLevel: SkillLevel;
  confidence: number;
  mode: "single_meal" | "full_day";
  dietary?: string[];
  calorieTarget?: number;
  availableIngredients?: string[];
};

export type MealIngredient = {
  food_name: string;
  amount_g: number;
};

export type MealTotals = {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

export type Meal = {
  meal_name: string;
  ingredients: MealIngredient[];
  totals: MealTotals;
  highlight_nutrients: string[];
  cooking_instructions: string;
};

export type DailySummary = {
  total_calories: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  percent_protein: number;
  percent_fat: number;
  percent_carbs: number;
  public_guideline_adherence: string;
};

export type RecipeResponse = {
  meals: Meal[];
  daily_summary?: DailySummary;
};
