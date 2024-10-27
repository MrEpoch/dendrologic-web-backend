import { totpBucket } from "@/lib/2fa";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import {
  getCurrentSession,
  setSessionAs2FAVerified,
} from "@/lib/sessionTokens";
import { getUserTOTPKey } from "@/lib/user";
import { verifyTOTP } from "@oslojs/otp";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    if (!globalGETRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
      return NextResponse.json({
        success: false,
        error: "UNAUTHORIZED",
        redirect: "/auth/login",
      });
    }
    if (!user.emailVerified) {
      return NextResponse.json({
        success: false,
        error: "EMAIL_NOT_VERIFIED",
        redirect: "/auth/verify-email",
      });
    }
    if (!user.registered2FA) {
      return NextResponse.json({
        success: false,
        error: "2FA_NOT_ENABLED",
        redirect: "/auth/2fa/setup",
      });
    }
    if (session.twoFactorVerified) {
      return NextResponse.json({
        success: false,
        error: "2FA_VERIFIED",
        redirect: "/auth/settings",
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }
    if (
      !user.emailVerified ||
      !user.registered2FA ||
      session.twoFactorVerified
    ) {
      return NextResponse.json({ success: false, error: "FORBIDDEN" });
    }
    if (!totpBucket.check(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const data = await request.json();
    const dataSchema = z.object({
      code: z.string().min(1),
    });

    const validatedData = dataSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    if (!totpBucket.consume(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const totpKey = await getUserTOTPKey(user.id);
    if (totpKey === null) {
      return NextResponse.json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
      });
    }
    if (!verifyTOTP(totpKey, 30, 6, validatedData.data.code)) {
      return NextResponse.json({ success: false, error: "INVALID_CODE" });
    }
    totpBucket.reset(user.id);
    await setSessionAs2FAVerified(session.id);
    return NextResponse.json({ success: true, redirect: "/auth/settings" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}
