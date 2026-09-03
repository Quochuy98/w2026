import { describe, expect, it } from "vitest";
import { getCountdownState, WEDDING_INSTANT } from "@/lib/date";

describe("wedding countdown", () => {
  const target = Date.parse(WEDDING_INSTANT);

  it("counts down without negative units", () => {
    const state = getCountdownState(target - 1_000);
    expect(state).toEqual({ status: "before", days: 0, hours: 0, minutes: 0, seconds: 1 });
  });

  it("uses Vietnam local date for the wedding-day state", () => {
    expect(getCountdownState(Date.parse("2026-09-22T00:30:00+07:00"))).toEqual({ status: "today" });
    expect(getCountdownState(Date.parse("2026-09-22T23:59:59+07:00"))).toEqual({ status: "today" });
  });

  it("switches to the after state on the next local day", () => {
    expect(getCountdownState(Date.parse("2026-09-23T00:00:00+07:00"))).toEqual({ status: "after" });
  });
});
