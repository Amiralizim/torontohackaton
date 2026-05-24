"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RecipeRequest, SkillLevel } from "./types";

type WizardState = RecipeRequest;

export const TOTAL_STEPS = 6;

type WizardContextValue = {
  state: WizardState;
  currentStep: number;
  totalSteps: number;
  update: (patch: Partial<WizardState>) => void;
  setSkill: (level: SkillLevel, confidence: number) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
};

const defaultState: WizardState = {
  skillLevel: "Beginner",
  confidence: 48,
  mode: "full_day",
  dietary: [],
  availableIngredients: [],
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(defaultState);
  const [currentStep, setCurrentStep] = useState(3);

  const value = useMemo<WizardContextValue>(
    () => ({
      state,
      currentStep,
      totalSteps: TOTAL_STEPS,
      update: (patch) => setState((prev) => ({ ...prev, ...patch })),
      setSkill: (skillLevel, confidence) =>
        setState((prev) => ({ ...prev, skillLevel, confidence })),
      next: () =>
        setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1)),
      prev: () => setCurrentStep((s) => Math.max(1, s - 1)),
      goTo: (step) =>
        setCurrentStep(Math.max(1, Math.min(TOTAL_STEPS, step))),
    }),
    [state, currentStep],
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used inside <WizardProvider>");
  }
  return ctx;
}
