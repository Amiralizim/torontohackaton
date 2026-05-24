"use client";

import { type CSSProperties, useState } from "react";
import { useWizard } from "./lib/wizard-context";
import type { Meal, RecipeResponse, SkillLevel } from "./lib/types";

const levels: { label: SkillLevel; description: string }[] = [
  {
    label: "Beginner",
    description: "I can't even boil water correctly, please help.",
  },
  {
    label: "Average",
    description: "I can follow a recipe and make simple meals.",
  },
  {
    label: "Intermediate",
    description: "I can improvise and handle a few dishes at once.",
  },
  {
    label: "Pro",
    description: "I cook confidently and know my way around techniques.",
  },
  {
    label: "Master",
    description: "I can build dishes from scratch and adjust as I go.",
  },
];

export default function Home() {
  const { currentStep, totalSteps, prev, next } = useWizard();

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f1e5] text-[#3f382b]">
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl">
          <StepContent />
        </div>
      </section>

      <footer className="border-t border-[#b99f70]/70 px-6 py-5">
        <div className="mx-auto grid max-w-5xl grid-cols-3 items-center text-sm font-medium">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 1}
            className="cursor-pointer justify-self-start text-[#3f382b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            &larr; Back
          </button>
          <span className="justify-self-center text-[#3f382b]">
            Step {currentStep}/{totalSteps}
          </span>
          <button
            type="button"
            onClick={next}
            disabled={currentStep === totalSteps}
            className="cursor-pointer justify-self-end text-[#3f382b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next step &rarr;
          </button>
        </div>
      </footer>
    </main>
  );
}

function StepContent() {
  const { currentStep } = useWizard();
  switch (currentStep) {
    case 1:
      return <StepMode />;
    case 2:
      return <StepDietary />;
    case 3:
      return <StepSkill />;
    case 4:
      return <StepCalorieTarget />;
    case 5:
      return <StepIngredients />;
    case 6:
      return <StepGenerate />;
    default:
      return null;
  }
}

function StepMode() {
  const { state, update } = useWizard();
  const options: { value: "single_meal" | "full_day"; label: string; desc: string }[] = [
    {
      value: "single_meal",
      label: "Single meal",
      desc: "Generate one well-balanced meal.",
    },
    {
      value: "full_day",
      label: "Full-day menu",
      desc: "Three meals totalling ~2000 kcal with macro balance.",
    },
  ];
  return (
    <div className="text-center">
      <h1 className="text-lg font-medium sm:text-xl">
        What do you want to plan today?
      </h1>
      <div className="mt-10 flex flex-col items-center gap-4">
        {options.map((opt) => {
          const active = state.mode === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ mode: opt.value })}
              className={`w-full max-w-md cursor-pointer rounded-2xl border border-[#b99f70] px-6 py-4 text-left transition-colors ${
                active ? "bg-[#595b2f] text-[#f7f5ef]" : "bg-[#f3e7cf] text-[#3f382b]"
              }`}
            >
              <div className="text-base font-semibold">{opt.label}</div>
              <div className={`mt-1 text-sm ${active ? "opacity-90" : "opacity-80"}`}>
                {opt.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepDietary() {
  const { state, update } = useWizard();
  const options = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Pescatarian"];
  const selected = new Set(state.dietary ?? []);
  const toggle = (opt: string) => {
    const next = new Set(selected);
    next.has(opt) ? next.delete(opt) : next.add(opt);
    update({ dietary: Array.from(next) });
  };
  return (
    <div className="text-center">
      <h1 className="text-lg font-medium sm:text-xl">
        Any dietary preferences?
      </h1>
      <p className="mt-2 text-sm opacity-70">Pick any that apply, or none.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`cursor-pointer rounded-full border border-[#b99f70] px-5 py-2 text-sm font-medium transition-colors ${
                active ? "bg-[#595b2f] text-[#f7f5ef]" : "bg-[#f3e7cf] text-[#3f382b]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSkill() {
  const { state, setSkill } = useWizard();
  const active = state.skillLevel;
  const sliderValue = state.confidence;
  const activeLevel = levels.find((level) => level.label === active) ?? levels[0];
  const sliderStyle = {
    "--slider-progress": `${sliderValue}%`,
  } as CSSProperties;

  return (
    <div className="text-center">
      <h1 className="text-lg font-medium sm:text-xl">
        Tell me about your skill level in the kitchen
      </h1>

      <div className="mt-12 w-full overflow-x-auto pb-1">
        <div className="flex flex-nowrap justify-center gap-4">
          {levels.map((level) => {
            const isActive = active === level.label;
            return (
              <button
                key={level.label}
                type="button"
                onClick={() => setSkill(level.label, sliderValue)}
                className={`shrink-0 cursor-pointer rounded-full border border-[#b99f70] px-6 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#595b2f] text-[#f7f5ef]"
                    : "bg-[#f3e7cf] text-[#3f382b]"
                }`}
              >
                {level.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-10 text-base font-medium text-[#3f382b]">
        {activeLevel.description}
      </p>

      <div className="mx-auto mt-10 w-full max-w-xs">
        <label htmlFor="kitchen-skill-slider" className="sr-only">
          Kitchen skill confidence
        </label>
        <input
          id="kitchen-skill-slider"
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(event) => setSkill(active, Number(event.target.value))}
          className="skill-slider w-full cursor-pointer"
          style={sliderStyle}
        />
      </div>

      <style jsx>{`
        .skill-slider {
          appearance: none;
          background: transparent;
          height: 28px;
        }
        .skill-slider:focus {
          outline: none;
        }
        .skill-slider::-webkit-slider-runnable-track {
          background: linear-gradient(
            to right,
            #595b2f 0%,
            #595b2f var(--slider-progress),
            #b99f70 var(--slider-progress),
            #b99f70 100%
          );
          border-radius: 999px;
          height: 4px;
        }
        .skill-slider::-webkit-slider-thumb {
          appearance: none;
          background: #f7f1e5;
          border: 2px solid #595b2f;
          border-radius: 999px;
          height: 16px;
          margin-top: -6px;
          width: 16px;
        }
        .skill-slider::-moz-range-track {
          background: #b99f70;
          border-radius: 999px;
          height: 4px;
        }
        .skill-slider::-moz-range-progress {
          background: #595b2f;
          border-radius: 999px;
          height: 4px;
        }
        .skill-slider::-moz-range-thumb {
          background: #f7f1e5;
          border: 2px solid #595b2f;
          border-radius: 999px;
          height: 16px;
          width: 16px;
        }
      `}</style>
    </div>
  );
}

function StepCalorieTarget() {
  const { state, update } = useWizard();
  const presets = [1500, 1800, 2000, 2200, 2500];
  return (
    <div className="text-center">
      <h1 className="text-lg font-medium sm:text-xl">
        Daily calorie target?
      </h1>
      <p className="mt-2 text-sm opacity-70">Pick a preset or skip.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {presets.map((cal) => {
          const active = state.calorieTarget === cal;
          return (
            <button
              key={cal}
              type="button"
              onClick={() =>
                update({ calorieTarget: active ? undefined : cal })
              }
              className={`cursor-pointer rounded-full border border-[#b99f70] px-5 py-2 text-sm font-medium transition-colors ${
                active ? "bg-[#595b2f] text-[#f7f5ef]" : "bg-[#f3e7cf] text-[#3f382b]"
              }`}
            >
              {cal} kcal
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepIngredients() {
  return (
    <div className="text-center">
      <h1 className="text-lg font-medium sm:text-xl">
        Pantry filter (optional)
      </h1>
      <p className="mt-4 max-w-md mx-auto text-sm opacity-70">
        By default the generator can use anything from the supplied ingredient
        table. Restricting to a subset is coming next.
      </p>
    </div>
  );
}

function StepGenerate() {
  const { state } = useWizard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawDebug, setRawDebug] = useState<string | null>(null);
  const [result, setResult] = useState<RecipeResponse | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setRawDebug(null);
    setResult(null);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(state),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? `HTTP ${res.status}`);
        if (typeof json.raw === "string") setRawDebug(json.raw);
      } else {
        setResult(json as RecipeResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="text-lg font-medium sm:text-xl">
          {result ? "Your menu" : "Ready to generate?"}
        </h1>
        {!result && (
          <p className="mt-2 text-sm opacity-70">
            {state.skillLevel} cook · {state.mode === "full_day" ? "full-day menu" : "single meal"}
            {state.dietary && state.dietary.length > 0
              ? ` · ${state.dietary.join(", ")}`
              : ""}
            {state.calorieTarget ? ` · ${state.calorieTarget} kcal target` : ""}
          </p>
        )}
        {!result && (
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="mt-8 cursor-pointer rounded-full border border-[#595b2f] bg-[#595b2f] px-8 py-3 text-sm font-semibold text-[#f7f5ef] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Cooking up ideas…" : "Generate recipes"}
          </button>
        )}
        {error && (
          <div className="mt-6 text-left">
            <p className="text-sm text-[#99584f]">Error: {error}</p>
            {rawDebug && (
              <details className="mt-3 rounded-lg border border-[#b99f70] bg-[#f7f1e5] p-3">
                <summary className="cursor-pointer text-xs font-medium opacity-70">
                  Show raw model output
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs opacity-80">
                  {rawDebug}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-10 space-y-6">
          {result.meals.map((meal, idx) => (
            <MealCard key={idx} meal={meal} />
          ))}
          {result.daily_summary && (
            <div className="rounded-2xl border border-[#b99f70] bg-[#f3e7cf]/60 p-5 text-sm">
              <div className="font-semibold">Daily totals</div>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                <span>{Math.round(result.daily_summary.total_calories)} kcal</span>
                <span>{Math.round(result.daily_summary.total_protein_g)}g protein ({result.daily_summary.percent_protein}%)</span>
                <span>{Math.round(result.daily_summary.total_fat_g)}g fat ({result.daily_summary.percent_fat}%)</span>
                <span>{Math.round(result.daily_summary.total_carbs_g)}g carbs ({result.daily_summary.percent_carbs}%)</span>
              </div>
              <p className="mt-3 opacity-70">{result.daily_summary.public_guideline_adherence}</p>
            </div>
          )}
          <div className="text-center">
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="cursor-pointer rounded-full border border-[#595b2f] px-6 py-2 text-sm font-medium text-[#3f382b] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Regenerating…" : "Try again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  return (
    <article className="rounded-2xl border border-[#b99f70] bg-[#f3e7cf]/40 p-5">
      <h2 className="text-lg font-semibold">{meal.meal_name}</h2>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {meal.highlight_nutrients.map((h, i) => (
          <span
            key={i}
            className="rounded-full border border-[#b99f70] bg-[#f7f1e5] px-2 py-0.5"
          >
            {h}
          </span>
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
        {meal.ingredients.map((ing, i) => (
          <li key={i}>
            <span className="font-medium">{ing.food_name}</span>
            <span className="opacity-70"> — {ing.amount_g}g</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
        <span>{Math.round(meal.totals.calories)} kcal</span>
        <span>{meal.totals.protein_g}g protein</span>
        <span>{meal.totals.fat_g}g fat</span>
        <span>{meal.totals.carbs_g}g carbs</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed opacity-90">
        {meal.cooking_instructions}
      </p>
    </article>
  );
}
