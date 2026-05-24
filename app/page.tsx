"use client";

import { type CSSProperties, useState } from "react";

const levels = [
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
  const [active, setActive] = useState(levels[0].label);
  const [sliderValue, setSliderValue] = useState(48);
  const activeLevel = levels.find((level) => level.label === active) ?? levels[0];
  const sliderStyle = {
    "--slider-progress": `${sliderValue}%`,
  } as CSSProperties;

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f1e5] text-[#3f382b]">
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl text-center">
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
                    onClick={() => setActive(level.label)}
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
              onChange={(event) => setSliderValue(Number(event.target.value))}
              className="skill-slider w-full cursor-pointer"
              style={sliderStyle}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-[#b99f70]/70 px-6 py-5">
        <div className="mx-auto grid max-w-5xl grid-cols-3 items-center text-sm font-medium">
          <button
            type="button"
            className="cursor-pointer justify-self-start text-[#3f382b]"
          >
            &larr; Back
          </button>
          <span className="justify-self-center text-[#3f382b]">Step 3/6</span>
          <button
            type="button"
            className="cursor-pointer justify-self-end text-[#3f382b]"
          >
            Next step &rarr;
          </button>
        </div>
      </footer>

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
    </main>
  )
}
