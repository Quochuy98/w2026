import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "@/lib/auth/session";
import { setSavedSlotConfig, getSavedSlotsConfig } from "@/lib/local-album";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function POST(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, src } = await request.json();
    if (!["banner", "groom", "bride"].includes(type) || !src || typeof src !== "string") {
      return json({ error: "Tham số không hợp lệ" }, { status: 400 });
    }

    const updatedConfig = await setSavedSlotConfig(type, src);

    const labels = {
      banner: "Banner chính",
      groom: "Avatar Nhà Trai",
      bride: "Avatar Nhà Gái",
    };

    return json({
      success: true,
      config: updatedConfig,
      message: `Đã đặt ảnh làm ${labels[type as "banner" | "groom" | "bride"]} thành công!`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await getSavedSlotsConfig();
    return json({ config });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}
