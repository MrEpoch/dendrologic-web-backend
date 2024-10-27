import { getCurrentSession } from "@/lib/sessionTokens";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recoveryCodeBucket, resetUser2FAWithRecoveryCode } from "@/lib/2fa";
import { globalGETRateLimit } from "@/lib/request";

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
        redirct: "/auth/login",
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
        redirect: "/",
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, user } = await getCurrentSession();

    if (session === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    if (
      !user.emailVerified ||
      !user.registered2FA ||
      !session.twoFactorVerified
    ) {
      return NextResponse.json({ success: false, error: "FORBIDDEN" });
    }

    if (!recoveryCodeBucket.check(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const data = await request.json();
    console.log(data);

    const dataValidation = z.object({
      code: z.string().min(1),
    });

    const validateData = dataValidation.safeParse(data);
    if (!validateData.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    if (!recoveryCodeBucket.check(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const valid = await resetUser2FAWithRecoveryCode(
      user.id,
      validateData.data.code,
    );
    if (!valid) {
      return NextResponse.json({
        success: false,
        error: "INVALID_RECOVERY_CODE",
      });
    }

    recoveryCodeBucket.reset(user.id);
    return NextResponse.json({ success: true, redirect: "/auth/2fa/setup" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
