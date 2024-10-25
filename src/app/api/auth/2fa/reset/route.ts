import { getCurrentSession } from "@/lib/sessionTokens";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recoveryCodeBucket, resetUser2FAWithRecoveryCode } from "@/lib/2fa";

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
