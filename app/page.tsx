"use client";

import { useState } from "react";

const levels = ["Beginner", "Average", "Intermediate", "Pro"];

export default function Home() {
  const [active, setActive] = useState(levels[0]);

  return (
    <main className="flex gap-2">
      {levels.map((level) => {
        const isActive = active === level;

        return (
          <button
            key={level}
            type="button"
            onClick={() => setActive(level)}
            className={`rounded-full border border-[#b99f70] px-6 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#595b2f] text-[#f7f5ef]"
                : "bg-[#f3e7cf] text-[#3f382b]"
            } cursor-pointer`}
          >
            {level}
          </button>
        );
      })}
    </main>
  );
}
