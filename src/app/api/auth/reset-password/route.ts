import { verifyPasswordStrength } from "@/lib/password";
import {
  deletePassResetSessionTokenCookie,
  invalidateUserPasswordResetSession,
  validatePasswordResetSessionRequest,
} from "@/lib/password-reset";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import {
  createSession,
  generateSessionToken,
  invalidateUserSessions,
  SessionFlags,
  setSessionTokenCookie,
} from "@/lib/sessionTokens";
import { updateUserPassword } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    if (user.registered2FA && !session.twoFactorVerified) {
      return NextResponse.json({
        success: false,
        error: "2FA_NOT_ENABLED",
        redirect: "/auth/reset-password/2fa",
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session: passwordResetSession, user } =
      await validatePasswordResetSessionRequest();
    if (passwordResetSession === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }
    if (!passwordResetSession.emailVerified) {
      return NextResponse.json({
        success: false,
        error: "EMAIL_NOT_VERIFIED",
        redirect: "/auth/verify-email",
      });
    }
    if (user.registered2FA && !passwordResetSession.twoFactorVerified) {
      return NextResponse.json({
        success: false,
        error: "2FA_NOT_ENABLED",
        redirect: "/auth/2fa/setup",
      });
    }

    const data = await request.json();
    const dataSchema = z.object({
      password: z.string().min(8).max(255),
    });
    const dataValidated = dataSchema.safeParse(data);

    if (!dataValidated.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const strongPassword = await verifyPasswordStrength(
      dataValidated.data.password,
    );
    if (!strongPassword) {
      return NextResponse.json({ success: false, error: "WEAK_PASSWORD" });
    }

    invalidateUserPasswordResetSession(passwordResetSession.userId);
    invalidateUserSessions(passwordResetSession.userId);

    await updateUserPassword(
      passwordResetSession.userId,
      dataValidated.data.password,
    );

    const sessionFlags: SessionFlags = {
      twoFactorVerified: passwordResetSession.twoFactorVerified,
    };
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id, sessionFlags);
    setSessionTokenCookie(sessionToken, session.expiresAt);
    deletePassResetSessionTokenCookie();

    return NextResponse.json({ success: true, error: null, sessionToken });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
