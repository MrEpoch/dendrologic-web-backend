import { validatePasswordResetSessionRequest } from "@/lib/password-reset";
import { globalGETRateLimit } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (!globalGETRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session, user } = await validatePasswordResetSessionRequest();

    if (session === null) {
      return NextResponse.json({
        success: false,
        error: "UNAUTHORIZED",
        redirect: "/auth/forgot-password",
      });
    }
    if (!session.emailVerified) {
      return NextResponse.json({
        success: false,
        error: "EMAIL_NOT_VERIFIED",
        redirect: "/auth/reset-password/verify-email",
      });
    }
    if (!user.registered2FA || session.twoFactorVerified) {
      return NextResponse.json({
        success: false,
        error: "2FA_VERIFIED",
        redirect: "/auth/reset-password",
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
