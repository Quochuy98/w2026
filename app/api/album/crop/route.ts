import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "@/lib/auth/session";
import { setSavedCropConfig, getSavedSlotsConfig } from "@/lib/local-album";
import type { AvatarCropConfig } from "@/content/wedding";

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
    const { side, crop } = await request.json();
    if (side !== "groom" && side !== "bride") {
      return json({ error: "Phía gia đình không hợp lệ (phải là groom hoặc bride)" }, { status: 400 });
    }

    if (!crop || typeof crop.x !== "number" || typeof crop.y !== "number" || typeof crop.zoom !== "number") {
      return json({ error: "Thông số căn chỉnh không hợp lệ" }, { status: 400 });
    }

    const cleanCrop: AvatarCropConfig = {
      x: Math.min(100, Math.max(0, Math.round(crop.x))),
      y: Math.min(100, Math.max(0, Math.round(crop.y))),
      zoom: Math.min(3, Math.max(1, Number(crop.zoom.toFixed(2)))),
    };

    const updatedConfig = await setSavedCropConfig(side, cleanCrop);
    const label = side === "groom" ? "Nhà Trai (Chú rể)" : "Nhà Gái (Cô dâu)";

    return json({
      success: true,
      config: updatedConfig,
      message: `Đã lưu vị trí căn chỉnh khuôn mặt cho ${label}!`,
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
    return json({
      groomCrop: config.groomCrop,
      brideCrop: config.brideCrop,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}
