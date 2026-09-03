import { describe, expect, it } from "vitest";
import { getPublicAlbumState, getPublicAlbum } from "@/lib/gallery";
import { WEDDING_SLOTS } from "@/content/wedding";

describe("public gallery resolver", () => {
  it("resolves the public album state with all required wedding slots", async () => {
    const state = await getPublicAlbumState();
    expect(state).toBeDefined();
    expect(Array.isArray(state.images)).toBe(true);
    expect(state.images.length).toBeGreaterThan(0);

    // Every required slot must be present
    for (const slot of WEDDING_SLOTS) {
      expect(state.slots[slot]).toBeDefined();
      expect(state.slots[slot].src).toBeDefined();
    }
  });

  it("returns images array from getPublicAlbum", async () => {
    const images = await getPublicAlbum();
    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0].src).toBeDefined();
  });
});
