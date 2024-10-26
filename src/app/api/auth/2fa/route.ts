import { totpBucket } from "@/lib/2fa";
import { globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession, setSessionAs2FAVerified } from "@/lib/sessionTokens";
import { getUserTOTPKey } from "@/lib/user";
import { verifyTOTP } from "@oslojs/otp";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }
    if (!user.emailVerified || !user.registered2FA || session.twoFactorVerified) {
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
      return NextResponse.json({ success: false, error: "INTERNAL_SERVER_ERROR" });
    }
    if (!verifyTOTP(totpKey, 30, 6, validatedData.data.code)) {
      return NextResponse.json({ success: false, error: "INVALID_CODE" });
    }
    totpBucket.reset(user.id);
    await setSessionAs2FAVerified(session.id);
    return NextResponse.json({ success: true, redirect: "/" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "INTERNAL_SERVER_ERROR" });
  }
}
