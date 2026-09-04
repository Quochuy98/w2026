import { describe, expect, it, beforeAll, afterAll } from "vitest";

import fs from "node:fs/promises";
import path from "node:path";
import { naturalCompare, getSavedBannerSrc, setSavedBannerSrc, toggleImageVisibility } from "@/lib/local-album";


const BANNER_CONFIG_PATH = path.join(process.cwd(), "content/banner.json");

describe("local album functionality", () => {
  let originalContent: string | null = null;

  beforeAll(async () => {
    try {
      originalContent = await fs.readFile(BANNER_CONFIG_PATH, "utf-8");
    } catch {
      originalContent = null;
    }
  });

  afterAll(async () => {
    try {
      if (originalContent !== null) {
        await fs.writeFile(BANNER_CONFIG_PATH, originalContent, "utf-8");
      } else {
        await fs.unlink(BANNER_CONFIG_PATH);
      }
    } catch {
      // Ignored
    }
  });


  it("sorts filenames in natural order", () => {
    const list = ["img-10.jpg", "img-1.jpg", "img-2.jpg", "hero.jpg"];
    list.sort(naturalCompare);
    expect(list).toEqual(["hero.jpg", "img-1.jpg", "img-2.jpg", "img-10.jpg"]);
  });

  it("can toggle show and hide visibility for images", async () => {
    const testImg = "/images/album/secret-pic.webp";
    const res1 = await toggleImageVisibility(testImg);
    expect(res1.isHidden).toBe(true);
    expect(res1.hiddenImages).toContain(testImg);

    const res2 = await toggleImageVisibility(testImg);
    expect(res2.isHidden).toBe(false);
    expect(res2.hiddenImages).not.toContain(testImg);
  });

  it("preserves groom/bride avatars in slots even when the image is hidden from the album", async () => {

    const { getLocalAlbumState, setSavedSlotConfig, toggleImageVisibility, getSavedSlotsConfig } = await import("@/lib/local-album");
    const testAvatar = "/images/album/TART0693.webp";

    // Set as groom avatar
    await setSavedSlotConfig("groom", testAvatar);
    // Hide this image from the album gallery
    const slots = await getSavedSlotsConfig();
    if (!slots.hiddenImages?.includes(testAvatar)) {
      await toggleImageVisibility(testAvatar);
    }

    const albumState = await getLocalAlbumState();

    // 1. Image is hidden from the public album list
    expect(albumState!.images.some((img) => img.src === testAvatar)).toBe(false);

    // 2. But Nhà Trai avatar STILL HAS this image!
    expect(albumState!.slots["portrait-two"].src).toBe(testAvatar);
  });

  it("loads default fallback config when neither Supabase nor banner.json is available", async () => {
    const { getSavedSlotsConfig } = await import("@/lib/local-album");
    const config = await getSavedSlotsConfig();
    expect(config).toBeDefined();
    expect(config.groomCrop).toBeDefined();
    expect(config.brideCrop).toBeDefined();
    expect(Array.isArray(config.hiddenImages)).toBe(true);
  });

  it("updates and retrieves banner source correctly", async () => {
    const { setSavedBannerSrc, getSavedBannerSrc } = await import("@/lib/local-album");
    const testBanner = "/images/album/test-banner.webp";
    await setSavedBannerSrc(testBanner);
    const result = await getSavedBannerSrc();
    expect(result).toBe(testBanner);
  });
});



