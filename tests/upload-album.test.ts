import { describe, expect, it } from "vitest";
import { buildManifestSource, naturalCompare, parseCliArgs } from "@/scripts/upload-album";

describe("album upload CLI", () => {
  it("sorts natural filenames", () => {
    expect(["photo-10.jpg", "photo-2.jpg", "photo-1.jpg"].sort(naturalCompare)).toEqual(["photo-1.jpg", "photo-2.jpg", "photo-10.jpg"]);
  });

  it("requires an expected count", () => {
    expect(() => parseCliArgs(["./photos"])).toThrow("--expected is required");
    expect(parseCliArgs(["./photos", "--expected", "45", "--replace"])?.replace).toBe(true);
  });

  it("writes a typed manifest without secrets", () => {
    const source = buildManifestSource([{ outputName: "01.webp", sourcePath: "01.jpg", width: 800, height: 1000, filePath: "/wedding/thuong-huy/01.webp", tags: ["wedding-album"] }], "/wedding/thuong-huy/", 1, "2026-08-21T00:00:00.000Z");
    expect(source).toContain("GENERATED_ALBUM");
    expect(source).toContain("01.webp");
    expect(source).not.toContain("private");
  });
});
