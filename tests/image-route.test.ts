import { describe, expect, it } from "vitest";
import { GET } from "@/app/images/[...path]/route";

describe("dynamic image serving route", () => {
  it("serves an existing image with correct Content-Type and 200 status", async () => {
    const request = new Request("http://localhost:3000/images/album/TART0693.webp");
    const response = await GET(request, {
      params: Promise.resolve({ path: ["album", "TART0693.webp"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/webp");
    expect(response.headers.get("Cache-Control")).toContain("public");
  });

  it("returns 404 for a non-existent image", async () => {
    const request = new Request("http://localhost:3000/images/album/non-existent-xyz.webp");
    const response = await GET(request, {
      params: Promise.resolve({ path: ["album", "non-existent-xyz.webp"] }),
    });

    expect(response.status).toBe(404);
  });

  it("blocks directory traversal attempts", async () => {
    const request = new Request("http://localhost:3000/images/../package.json");
    const response = await GET(request, {
      params: Promise.resolve({ path: ["..", "package.json"] }),
    });

    expect(response.status).toBe(403);
  });
});
