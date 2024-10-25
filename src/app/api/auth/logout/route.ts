"use server";

import { globalPOSTRateLimit } from "@/lib/request";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/sessionTokens";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!globalPOSTRateLimit(request)) {
    return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
  }
  const { session } = await getCurrentSession();
  if (session === null) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
  }
  invalidateSession(session.id);
  deleteSessionTokenCookie();

  return NextResponse.json({ success: true, redirect: "/" });
}
