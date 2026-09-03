import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/imagekit/upload-auth/route";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/auth/session";

function requestWithSession(): Request {
  const token = createAdminSession("route-test-secret");
  return new Request("http://localhost/api/imagekit/upload-auth", {
    method: "POST",
    headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
  });
}

describe("ImageKit upload-auth route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without a valid admin session", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "route-test-secret");
    const response = await POST(new Request("http://localhost/api/imagekit/upload-auth", { method: "POST" }));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("returns a non-cacheable auth payload for an authenticated admin", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "route-test-secret");
    vi.stubEnv("IMAGEKIT_PRIVATE_KEY", "private_test");
    vi.stubEnv("IMAGEKIT_PUBLIC_KEY", "public_test");
    vi.stubEnv("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/test");

    const response = await POST(requestWithSession());
    const body = (await response.json()) as Record<string, unknown>;
    expect(response.status).toBe(200);
    expect(Object.keys(body).sort()).toEqual(["expire", "publicKey", "signature", "token"]);
    expect(body.publicKey).toBe("public_test");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("reports missing ImageKit configuration without exposing secrets", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "route-test-secret");
    const response = await POST(requestWithSession());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "ImageKit is not configured" });
  });
});

