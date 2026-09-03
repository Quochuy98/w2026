import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "@/lib/auth/session";
import { listAllGuests, createGuest, deleteGuest } from "@/lib/guests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Vary", "Cookie");
  return response;
}

export async function GET(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const guests = await listAllGuests();
    return json({ guests });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return json({ error: "Tên khách mời không được để trống" }, { status: 400 });
    }

    const result = await createGuest({
      code: body.code,
      name: body.name.trim(),
      salutation: body.salutation || "Bạn",
      eventType: body.eventType === "reception" ? "reception" : "wedding",
      side: body.side || "groom",
      note: body.note || undefined,
    });


    if (!result.success) {
      return json({ error: result.error || "Không thể tạo khách mời" }, { status: 400 });
    }

    return json({ guest: result.guest });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return json({ error: "Mã khách mời không hợp lệ" }, { status: 400 });
    }

    const success = await deleteGuest(code);
    return json({ success });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}
