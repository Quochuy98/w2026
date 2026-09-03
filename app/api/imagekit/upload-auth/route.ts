import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "../../../../lib/auth/session";
import { createImageKitClient } from "../../../../lib/imagekit/client";
import { getImageKitConfig } from "../../../../lib/imagekit/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Vary", "Cookie");
  return response;
}

export async function POST(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getImageKitConfig();
  if (!config) {
    return json({ error: "ImageKit is not configured" }, { status: 503 });
  }

  try {
    // The Node SDK exposes the same ImageKit Upload API V1 signature helper as
    // @imagekit/next/server. Using the Node helper here also keeps this route
    // directly runnable in Node-based tests and scripts.
    const auth = createImageKitClient(config).helper.getAuthenticationParameters();

    return json({
      token: auth.token,
      expire: auth.expire,
      signature: auth.signature,
      publicKey: config.publicKey,
    });
  } catch {
    return json({ error: "Unable to prepare upload authentication" }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
}
