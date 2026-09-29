import { NextResponse } from "next/server";
import { incrementMissedGuestView, incrementGuestView } from "@/lib/guests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, type } = body;

    if (code && typeof code === "string") {
      if (type === "invitation") {
        await incrementGuestView(code);
      } else {
        // Default to tracking missed page visits
        await incrementMissedGuestView(code);
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: "Missing code" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
