"use server";

import { globalGETRateLimit } from "@/lib/request";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/sessionTokens";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!globalGETRateLimit(request)) {
    return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
  }
  const { session } = await getCurrentSession();
  if (session === null) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
  }
  await invalidateSession(session.id);
  await deleteSessionTokenCookie();

  return NextResponse.json({ success: true, redirect: "/" });
}
