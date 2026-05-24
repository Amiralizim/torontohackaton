"use client";

import { type CSSProperties, useState } from "react";
import ingredients from "./ingredients.json";

const PREFERENCES_STORAGE_KEY = "cookingPreferences";
const TOTAL_STEPS = 4;
const activeToggleClasses = "border-[#3f421f] bg-[#595b2f] text-[#f7f5ef]";
const activeExcludeToggleClasses = "border-[#6f3028] bg-[#9a4f43] text-[#fff3ef]";
const inactiveToggleClasses = "border-[#b99f70] bg-[#f3e7cf] text-[#3f382b]";

const levels = [
  {
    label: "Beginner",
    value: 0,
    description: "I can't even boil water correctly, please help.",
  },
  {
    label: "Average",
    value: 25,
    description: "I can follow a recipe and make simple meals.",
  },
  {
    label: "Intermediate",
    value: 50,
    description: "I can improvise and handle a few dishes at once.",
  },
  {
    label: "Pro",
    value: 75,
    description: "I cook confidently and know my way around techniques.",
  },
  {
    label: "Master",
    value: 100,
    description: "I can build dishes from scratch and adjust as I go.",
  },
];

const peopleOptions = [1, 2, 3, 4, 5];
const ingredientOptions = ingredients.map((ingredient) => ({
  name: ingredient.food_name,
}));

function getLevelForSliderValue(value: number) {
  return levels.reduce((closest, level) =>
    Math.abs(level.value - value) < Math.abs(closest.value - value)
      ? level
      : closest,
  );
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(levels[0].value);
  const [peopleCount, setPeopleCount] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const activeLevel = getLevelForSliderValue(sliderValue);
  const sliderStyle = {
    "--slider-progress": `${sliderValue}%`,
  } as CSSProperties;

  function savePreferences(
    nextSkillValue = sliderValue,
    nextPeopleCount = peopleCount,
    nextSelectedIngredients = selectedIngredients,
    nextExcludedIngredients = excludedIngredients,
  ) {
    const nextLevel = getLevelForSliderValue(nextSkillValue);

    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        skillLevel: nextLevel.label,
        skillValue: nextSkillValue,
        peopleCount: nextPeopleCount,
        selectedIngredients: nextSelectedIngredients,
        excludedIngredients: nextExcludedIngredients,
      }),
    );
  }

  function updateSkill(value: number) {
    setSliderValue(value);
    savePreferences(value);
  }

  function updatePeopleCount(value: number) {
    setPeopleCount(value);
    savePreferences(sliderValue, value);
  }

  function toggleIngredient(name: string) {
    const shouldSelect = !selectedIngredients.includes(name);
    const nextSelectedIngredients = selectedIngredients.includes(name)
      ? selectedIngredients.filter((ingredient) => ingredient !== name)
      : [...selectedIngredients, name];
    const nextExcludedIngredients = shouldSelect
      ? excludedIngredients.filter((ingredient) => ingredient !== name)
      : excludedIngredients;

    setSelectedIngredients(nextSelectedIngredients);
    setExcludedIngredients(nextExcludedIngredients);
    savePreferences(
      sliderValue,
      peopleCount,
      nextSelectedIngredients,
      nextExcludedIngredients,
    );
  }

  function toggleExcludedIngredient(name: string) {
    const shouldExclude = !excludedIngredients.includes(name);
    const nextExcludedIngredients = excludedIngredients.includes(name)
      ? excludedIngredients.filter((ingredient) => ingredient !== name)
      : [...excludedIngredients, name];
    const nextSelectedIngredients = shouldExclude
      ? selectedIngredients.filter((ingredient) => ingredient !== name)
      : selectedIngredients;

    setExcludedIngredients(nextExcludedIngredients);
    setSelectedIngredients(nextSelectedIngredients);
    savePreferences(
      sliderValue,
      peopleCount,
      nextSelectedIngredients,
      nextExcludedIngredients,
    );
  }

  function goToNextStep() {
    savePreferences();
    if (currentStep === TOTAL_STEPS - 1) {
      setIsLoading(true);
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS - 1));
  }

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1e5] px-6 text-[#3f382b]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[#b99f70] border-t-[#595b2f]" />
          <h1 className="mt-8 text-lg font-medium sm:text-xl">
            Building your cooking plan
          </h1>
          <p className="mt-4 text-sm font-medium text-[#3f382b]/75">
            Matching your preferences with what sounds right.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f1e5] text-[#3f382b]">
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl text-center">
          {currentStep === 0 && (
            <>
              <h1 className="text-lg font-medium sm:text-xl">
                Tell me about your skill level in the kitchen
              </h1>

              <div className="mt-12 w-full overflow-x-auto pb-1">
                <div className="flex flex-nowrap justify-center gap-4">
                  {levels.map((level) => {
                    const isActive = activeLevel.label === level.label;

                    return (
                      <button
                        key={level.label}
                        type="button"
                        onClick={() => updateSkill(level.value)}
                        className={`shrink-0 cursor-pointer rounded-full border px-6 py-2 text-sm font-medium transition-colors ${
                          isActive ? activeToggleClasses : inactiveToggleClasses
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
                  aria-valuetext={activeLevel.label}
                  onChange={(event) => updateSkill(Number(event.target.value))}
                  className="skill-slider w-full cursor-pointer"
                  style={sliderStyle}
                />
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <h1 className="text-lg font-medium sm:text-xl">
                How many people are you cooking for?
              </h1>

              <div className="mt-12 w-full overflow-x-auto pb-1">
                <div className="flex flex-nowrap justify-center gap-4">
                  {peopleOptions.map((value) => {
                    const isActive = peopleCount === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updatePeopleCount(value)}
                        className={`h-11 w-11 shrink-0 cursor-pointer rounded-full border text-sm font-medium transition-colors ${
                          isActive ? activeToggleClasses : inactiveToggleClasses
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-10 text-base font-medium text-[#3f382b]">
                Cooking for {peopleCount} {peopleCount === 1 ? "person" : "people"}.
              </p>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h1 className="text-lg font-medium sm:text-xl">
                What are you vibing with right now?
              </h1>

              <div className="mt-10 grid max-h-[52vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                {ingredientOptions.map((ingredient) => {
                  const isSelected = selectedIngredients.includes(ingredient.name);

                  return (
                    <button
                      key={ingredient.name}
                      type="button"
                      onClick={() => toggleIngredient(ingredient.name)}
                      aria-pressed={isSelected}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-center transition-colors ${
                        isSelected
                          ? activeToggleClasses
                          : inactiveToggleClasses
                      }`}
                    >
                      <span className="block text-sm font-semibold leading-tight">
                        {ingredient.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-base font-medium text-[#3f382b]">
                {selectedIngredients.length === 0
                  ? "Select anything that sounds good right now."
                  : `${selectedIngredients.length} selected.`}
              </p>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h1 className="text-lg font-medium sm:text-xl">
                What are you not vibing with?
              </h1>

              <div className="mt-10 grid max-h-[52vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                {ingredientOptions.map((ingredient) => {
                  const isSelected = excludedIngredients.includes(ingredient.name);

                  return (
                    <button
                      key={ingredient.name}
                      type="button"
                      onClick={() => toggleExcludedIngredient(ingredient.name)}
                      aria-pressed={isSelected}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-center transition-colors ${
                        isSelected
                          ? activeExcludeToggleClasses
                          : inactiveToggleClasses
                      }`}
                    >
                      <span className="block text-sm font-semibold leading-tight">
                        {ingredient.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-base font-medium text-[#3f382b]">
                {excludedIngredients.length === 0
                  ? "Select anything you want to avoid."
                  : `${excludedIngredients.length} selected.`}
              </p>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-[#b99f70]/70 px-6 py-5">
        <div className="mx-auto grid max-w-5xl grid-cols-3 items-center text-sm font-medium">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className={`justify-self-start text-[#3f382b] ${
              currentStep === 0 ? "cursor-default opacity-45" : "cursor-pointer"
            }`}
          >
            &larr; Back
          </button>
          <span className="justify-self-center text-[#3f382b]">
            Step {currentStep + 1}/{TOTAL_STEPS}
          </span>
          <button
            type="button"
            onClick={goToNextStep}
            className="cursor-pointer justify-self-end text-[#3f382b]"
          >
            Next step &rarr;
          </button>
        </div>
      </footer>
    </main>
  )
}
