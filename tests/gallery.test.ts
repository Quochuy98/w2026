import { describe, expect, it } from "vitest";
import { FALLBACK_ALBUM } from "@/content/wedding";
import { mergeManifestOrder, normalizeImageKitAssets, resolveAlbumSlots } from "@/lib/imagekit/gallery";

const config = {
  privateKey: "private",
  publicKey: "public",
  urlEndpoint: "https://ik.imagekit.io/demo",
  folder: "/wedding/thuong-huy/",
};

describe("album slot resolver", () => {
  it("uses the newest image when a slot tag is duplicated", () => {
    const images = normalizeImageKitAssets([
      { fileId: "old", filePath: "/wedding/thuong-huy/old.webp", url: "https://ik.imagekit.io/demo/old.webp", width: 800, height: 1000, tags: ["wedding-album", "wedding-slot-hero"], updatedAt: "2026-01-01T00:00:00Z", fileType: "image" },
      { fileId: "new", filePath: "/wedding/thuong-huy/new.webp", url: "https://ik.imagekit.io/demo/new.webp", width: 800, height: 1000, tags: ["wedding-album", "wedding-slot-hero"], updatedAt: "2026-02-01T00:00:00Z", fileType: "image" },
    ], config);
    const resolved = resolveAlbumSlots(images, FALLBACK_ALBUM);
    expect(resolved.find((image) => image.slot === "hero")?.id).toBe("new");
    expect(resolved.filter((image) => image.id === "old").length).toBe(1);
  });

  it("fills an empty or unconfigured album with seven fallback slots", () => {
    const resolved = resolveAlbumSlots([], FALLBACK_ALBUM);
    expect(resolved).toHaveLength(7);
    expect(resolved.every((image) => image.source === "fallback")).toBe(true);
    expect(new Set(resolved.map((image) => image.slot)).size).toBe(7);
  });

  it("keeps the CLI manifest order and appends later uploads", () => {
    const manifest = [
      { id: "one", src: "/one.webp", width: 800, height: 1000, alt: "one", tags: [], order: 1, layout: "grid" as const, source: "imagekit" as const },
      { id: "two", src: "/two.webp", width: 800, height: 1000, alt: "two", tags: [], order: 2, layout: "grid" as const, source: "imagekit" as const },
    ];
    const remote = [
      { ...manifest[1], updatedAt: "2026-01-01T00:00:00Z" },
      { ...manifest[0], updatedAt: "2026-01-01T00:00:00Z" },
      { id: "three", src: "/three.webp", width: 800, height: 1000, alt: "three", tags: [], order: 99, layout: "grid" as const, source: "imagekit" as const, updatedAt: "2026-03-01T00:00:00Z" },
    ];
    expect(mergeManifestOrder(remote, manifest).map((image) => image.id)).toEqual(["one", "two", "three"]);
  });
});
