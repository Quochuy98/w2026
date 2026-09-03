"use client";

import { useEffect, useState } from "react";
import { getCountdownState, padCountdown, WEDDING_INSTANT, type CountdownState } from "@/lib/date";
import { Reveal } from "./reveal";

const units = [
  { key: "days", label: "Ngày" },
  { key: "hours", label: "Giờ" },
  { key: "minutes", label: "Phút" },
  { key: "seconds", label: "Giây" },
] as const;

export function Countdown() {
  const [state, setState] = useState<CountdownState>(() => getCountdownState(Date.now()));

  useEffect(() => {
    const update = () => setState(getCountdownState(Date.now()));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section aria-labelledby="countdown-title" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 id="countdown-title" className="font-display text-4xl leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
          Cùng đếm ngược đến ngày cưới
        </h2>
      </Reveal>

      <div className="mx-auto mt-12 max-w-4xl">
        {state.status === "today" && (
          <p className="font-display text-center text-3xl leading-tight sm:text-4xl">Hôm nay là ngày cưới của chúng mình.</p>
        )}
        {state.status === "after" && (
          <p className="font-display text-center text-3xl leading-tight sm:text-4xl">Cảm ơn bạn đã ghé thăm album cưới.</p>
        )}
        {state.status === "before" && (
          <div
            aria-live="polite"
            aria-label={`Đếm ngược đến ngày ${WEDDING_INSTANT}`}
            className="grid grid-cols-2 divide-x divide-y divide-[var(--line)] overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)]/60 sm:grid-cols-4 sm:divide-y-0"
          >
            {units.map((unit, index) => {
              const value = state.status === "before" ? state[unit.key] : 0;
              return (
                <div key={unit.key} className={`px-4 py-7 text-center sm:px-6 sm:py-9 ${index % 2 === 0 ? "border-b sm:border-b-0" : "border-b sm:border-b-0"}`}>
                  <p
                    suppressHydrationWarning
                    className="font-display text-5xl tabular-nums leading-none text-[var(--foreground)] sm:text-6xl lg:text-7xl"
                  >
                    {padCountdown(value)}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">{unit.label}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

