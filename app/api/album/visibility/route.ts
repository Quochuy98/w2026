import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "@/lib/auth/session";
import { toggleImageVisibility, getSavedSlotsConfig } from "@/lib/local-album";

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
    const { src } = await request.json();
    if (!src || typeof src !== "string") {
      return json({ error: "Thiếu thông tin ảnh" }, { status: 400 });
    }

    const { hiddenImages, isHidden } = await toggleImageVisibility(src);
    const filename = src.replace("/images/album/", "");

    return json({
      success: true,
      hiddenImages,
      isHidden,
      message: isHidden
        ? `Đã ẩn ảnh "${filename}" khỏi album công khai.`
        : `Đã hiện lại ảnh "${filename}" trong album công khai.`,
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
    return json({ hiddenImages: config.hiddenImages || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}
