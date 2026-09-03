import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "wedding_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;
export const ADMIN_SESSION_TTL_MS = ADMIN_SESSION_TTL_SECONDS * 1000;

export interface AdminSession {
  sub: "admin";
  iat: number;
  exp: number;
  nonce: string;
}

export interface SessionCookieOptions {
  name: string;
  value: string;
  httpOnly: true;
  sameSite: "strict";
  secure: boolean;
  path: "/";
  maxAge: number;
}

function base64UrlEncode(value: string | Uint8Array): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function getSecret(secret?: string): string {
  const value = secret?.trim() || process.env.ADMIN_SESSION_SECRET?.trim() || "";
  if (!value) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }
  return value;
}

/** Create a signed, expiring admin session token. */
export function createAdminSession(
  secret?: string,
  nowMs = Date.now(),
): string {
  const signingSecret = getSecret(secret);
  const iat = Math.floor(nowMs / 1000);
  const payload: AdminSession = {
    sub: "admin",
    iat,
    exp: iat + ADMIN_SESSION_TTL_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload, signingSecret)}`;
}

/**
 * Verify signature and expiry. Invalid/tampered/malformed tokens return null,
 * allowing callers to respond with a normal 401 rather than throwing.
 */
export function verifyAdminSession(
  token: string | null | undefined,
  secret?: string,
  nowMs = Date.now(),
): AdminSession | null {
  if (!token) return null;
  let signingSecret: string;
  try {
    signingSecret = getSecret(secret);
  } catch {
    return null;
  }

  const [encodedPayload, providedSignature, ...rest] = token.split(".");
  if (!encodedPayload || !providedSignature || rest.length > 0) return null;

  const expectedSignature = sign(encodedPayload, signingSecret);
  const providedBuffer = Buffer.from(providedSignature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  const decoded = base64UrlDecode(encodedPayload);
  if (!decoded) return null;
  try {
    const payload = JSON.parse(decoded) as Partial<AdminSession>;
    if (
      payload.sub !== "admin" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      typeof payload.nonce !== "string" ||
      !payload.nonce ||
      !Number.isFinite(payload.exp) ||
      !Number.isFinite(payload.iat)
    ) {
      return null;
    }

    const now = Math.floor(nowMs / 1000);
    // Treat the exact expiry second as expired and reject implausible future
    // issued-at values to prevent clock-skew abuse.
    if (payload.exp <= now || payload.iat > now + 60 || payload.exp <= payload.iat) return null;
    return payload as AdminSession;
  } catch {
    return null;
  }
}

export function getSessionTokenFromCookieHeader(
  cookieHeader: string | null | undefined,
  cookieName = ADMIN_SESSION_COOKIE,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    if (name !== cookieName) continue;
    const rawValue = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }
  return null;
}

export function getAdminSessionFromCookieHeader(
  cookieHeader: string | null | undefined,
  secret?: string,
  nowMs = Date.now(),
): AdminSession | null {
  return verifyAdminSession(getSessionTokenFromCookieHeader(cookieHeader), secret, nowMs);
}

export function isAdminSessionValid(
  cookieHeader: string | null | undefined,
  secret?: string,
  nowMs = Date.now(),
): boolean {
  return getAdminSessionFromCookieHeader(cookieHeader, secret, nowMs) !== null;
}

export function getAdminPassword(password = process.env.ADMIN_PASSWORD): string | null {
  const value = password?.trim() || "";
  return value || null;
}

export function verifyAdminPassword(candidate: string | null | undefined, expected = getAdminPassword()): boolean {
  if (!candidate || !expected) return false;
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

export function getAdminSessionCookie(
  token: string,
  secure = process.env.NODE_ENV === "production",
): SessionCookieOptions {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}

export function getExpiredAdminSessionCookie(
  secure = process.env.NODE_ENV === "production",
): SessionCookieOptions {
  return {
    ...getAdminSessionCookie("", secure),
    maxAge: 0,
  };
}

/** Aliases used by route handlers and tests. */
export const createSessionToken = createAdminSession;
export const verifySessionToken = verifyAdminSession;
export const parseSessionCookie = getAdminSessionFromCookieHeader;

