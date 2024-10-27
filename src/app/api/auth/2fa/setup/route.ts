import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import {
  getCurrentSession,
  setSessionAs2FAVerified,
} from "@/lib/sessionTokens";
import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createTOTPKeyURI, verifyTOTP } from "@oslojs/otp";
import { getUserRecoveryCode, updateUserTOTPKey } from "@/lib/user";
import { renderSVG } from "uqr";

const totpUpdateBucket = new RefillingTokenBucket<string>(3, 60 * 10);

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
    if (user.registered2FA && !session.twoFactorVerified) {
      return NextResponse.json({
        success: false,
        error: "2FA_NOT_VERIFIED",
        redirect: "/auth/2fa",
      });
    }

    const totpKey = new Uint8Array(20);
    crypto.getRandomValues(totpKey);
    const encodedTOTPKey = encodeBase64(totpKey);
    const keyURI = createTOTPKeyURI("Demo", user.username, totpKey, 30, 6);

    const qrCode = renderSVG(keyURI);

    return NextResponse.json({ success: true, keyURI, qrCode, encodedTOTPKey });
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

    if (!user.emailVerified) {
      return NextResponse.json({ success: false, error: "EMAIL_NOT_VERIFIED" });
    }

    if (user.registered2FA && !session.twoFactorVerified) {
      return NextResponse.json({ success: false, error: "FORBIDDEN" });
    }

    if (!totpUpdateBucket.check(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const data = await request.json();
    console.log(data);

    const dataValidation = z.object({
      key: z.string().length(28),
      code: z.string().min(1),
    });

    const validateData = dataValidation.safeParse(data);
    if (!validateData.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    let key: Uint8Array;

    try {
      key = decodeBase64(validateData.data.key);
    } catch (e) {
      return NextResponse.json({ success: false, error: "INVALID_KEY" });
    }

    if (key.byteLength !== 20) {
      return NextResponse.json({ success: false, error: "INVALID_KEY" });
    }

    if (!totpUpdateBucket.consume(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    console.log(validateData.data.code);
    if (!verifyTOTP(key, 30, 6, validateData.data.code)) {
      return NextResponse.json({ success: false, error: "INVALID_CODE" });
    }

    await updateUserTOTPKey(session.userId, key);
    await setSessionAs2FAVerified(session.id);

    const recoveryCode = await getUserRecoveryCode(user.id);

    return NextResponse.json({ success: true, recoveryCode });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
