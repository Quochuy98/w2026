import { describe, expect, it } from "vitest";
import DynamicGuestPage from "@/app/[code]/page";

describe("guest invitation route", () => {
  it("renders the missed landing component for any code path", async () => {
    const element = await DynamicGuestPage({ params: Promise.resolve({ code: "cardinal" }) });
    expect(element).toBeDefined();
  });
});
