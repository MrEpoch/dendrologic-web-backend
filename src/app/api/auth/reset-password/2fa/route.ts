import { totpBucket } from "@/lib/2fa";
import {
  setPasswordResetSessionAs2FAVerified,
  validatePasswordResetSessionRequest,
} from "@/lib/password-reset";
import { globalPOSTRateLimit } from "@/lib/request";
import { getUserTOTPKey } from "@/lib/user";
import { verifyTOTP } from "@oslojs/otp";
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

    if (!totpBucket.check(session.userId, 1)) {
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

    const totpKey = await getUserTOTPKey(session.userId);

    if (totpKey === null) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    if (!totpBucket.consume(session.userId, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    if (!verifyTOTP(totpKey, 30, 6, dataValidated.data.code)) {
      return NextResponse.json({ success: false, error: "INVALID_CODE" });
    }

    totpBucket.reset(session.userId);
    setPasswordResetSessionAs2FAVerified(session.id);

    return NextResponse.json({
      success: true,
      redirect: "/auth/reset-password",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
