import { recoveryCodeBucket, resetUser2FAWithRecoveryCode } from "@/lib/2fa";
import { validatePasswordResetSessionRequest } from "@/lib/password-reset";
import { globalPOSTRateLimit } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session, user } = await validatePasswordResetSessionRequest();
    if (session === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }
    if (
      !session.emailVerified ||
      !user.registered2FA ||
      session.twoFactorVerified
    ) {
      return NextResponse.json({ success: false, error: "FORBIDDEN" });
    }

    if (!recoveryCodeBucket.check(session.userId, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const data = await request.json();
    const dataSchema = z.object({
      code: z.string().min(1),
    });
    const dataValidated = dataSchema.safeParse(data);

    if (!dataValidated.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    if (!recoveryCodeBucket.consume(session.userId, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const valid = await resetUser2FAWithRecoveryCode(
      session.userId,
      dataValidated.data.code,
    );
    if (!valid) {
      return NextResponse.json({
        success: false,
        error: "INVALID_RECOVERY_CODE",
      });
    }

    return NextResponse.json({
      success: true,
      redirect: "/auth/reset-password",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
