import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "@/lib/auth/session";
import { setSavedBannerSrc } from "@/lib/local-album";

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
    const { bannerSrc } = await request.json();
    if (!bannerSrc || typeof bannerSrc !== "string") {
      return json({ error: "Đường dẫn ảnh banner không hợp lệ" }, { status: 400 });
    }

    await setSavedBannerSrc(bannerSrc);

    return json({
      success: true,
      bannerSrc,
      message: "Đã cập nhật ảnh Banner thành công!",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}
