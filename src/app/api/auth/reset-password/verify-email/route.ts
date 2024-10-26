import {
  setPasswordResetSessionAsEmailVerified,
  validatePasswordResetSessionRequest,
} from "@/lib/password-reset";
import { ExpiringTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import { setUserAsEmailVerifiedIfEmailMatches } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const emailVerificationBucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export async function GET(request: NextRequest) {
	if (!globalGETRateLimit(request)) {
    return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
	}
	const { session } = await validatePasswordResetSessionRequest();
	if (session === null) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED", redirect: "/auth/forgot-password" });
	}
	if (session.emailVerified) {
		if (!session.twoFactorVerified) {
      return NextResponse.json({ success: false, error: "2FA_NOT_ENABLED", redirect: "/auth/reset-password/2fa" });
		}
    return NextResponse.json({ success: false, error: "2FA_NOT_ENABLED", redirect: "/auth/reset-password" });
	}

  return NextResponse.json({ success: true, session });
}

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session } = await validatePasswordResetSessionRequest();
    if (session === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }
    if (session.emailVerified) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    if (!emailVerificationBucket.check(session.userId, 1)) {
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

    if (!emailVerificationBucket.consume(session.userId, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    if (dataValidated.data.code !== session.code) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    emailVerificationBucket.reset(session.userId);
    await setPasswordResetSessionAsEmailVerified(session.id);
    const emailMatches = await setUserAsEmailVerifiedIfEmailMatches(
      session.userId,
      session.email,
    );

    if (!emailMatches) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    return NextResponse.json({
      success: true,
      redirect: "/auth/reset-password/2fa",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
