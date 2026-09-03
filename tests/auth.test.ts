import { describe, expect, it } from "vitest";
import {
  createAdminSession,
  getAdminSessionCookie,
  getSessionTokenFromCookieHeader,
  verifyAdminPassword,
  verifyAdminSession,
} from "@/lib/auth/session";

describe("admin session", () => {
  const secret = "test-session-secret-with-enough-entropy";
  const now = Date.parse("2026-08-21T00:00:00Z");

  it("round-trips a signed cookie", () => {
    const token = createAdminSession(secret, now);
    const cookie = getAdminSessionCookie(token);
    expect(getSessionTokenFromCookieHeader(`${cookie.name}=${cookie.value}`)).toBe(token);
    expect(verifyAdminSession(token, secret, now + 1_000)?.sub).toBe("admin");
  });

  it("rejects tampering and expiry", () => {
    const token = createAdminSession(secret, now);
    expect(verifyAdminSession(`${token}x`, secret, now)).toBeNull();
    expect(verifyAdminSession(token, secret, now + 8 * 60 * 60 * 1_000)).toBeNull();
  });

  it("compares the configured password", () => {
    expect(verifyAdminPassword("correct horse", "correct horse")).toBe(true);
    expect(verifyAdminPassword("wrong", "correct horse")).toBe(false);
  });
});
