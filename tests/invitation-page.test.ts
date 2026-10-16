import { describe, expect, it } from "vitest";
import DynamicGuestPage from "@/app/[code]/page";

describe("guest invitation route", () => {
  it("renders the wedding landing component for valid guest code", async () => {
    const element = await DynamicGuestPage({ params: Promise.resolve({ code: "232388" }) });
    expect(element).toBeDefined();
  });

  it("renders the missed landing component for non-existent guest code", async () => {
    const element = await DynamicGuestPage({ params: Promise.resolve({ code: "non-existent-code" }) });
    expect(element).toBeDefined();
  });
});
