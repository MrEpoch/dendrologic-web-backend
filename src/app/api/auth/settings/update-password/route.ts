import { verifyPasswordHash, verifyPasswordStrength } from "@/lib/password";
import { ExpiringTokenBucket } from "@/lib/rate-limit";
import { globalPOSTRateLimit } from "@/lib/request";
import {
  createSession,
  generateSessionToken,
  getCurrentSession,
  invalidateUserSessions,
  SessionFlags,
  setSessionTokenCookie,
} from "@/lib/sessionTokens";
import { getUserPasswordHash, updateUserPassword } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const passwordUpdateBucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }
    if (user.registered2FA && !session.twoFactorVerified) {
      return NextResponse.json({
        success: false,
        error: "2FA_NOT_ENABLED",
        redirect: "/auth/2fa/setup",
      });
    }
    if (!passwordUpdateBucket.check(session.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const data = request.json();
    const dataSchema = z.object({
      password: z.string().min(8).max(255),
      newPassword: z.string().min(8).max(255),
    });

    const validatedData = dataSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const strongPassword = await verifyPasswordStrength(
      validatedData.data.newPassword,
    );
    if (!strongPassword) {
      return NextResponse.json({ success: false, error: "WEAK_PASSWORD" });
    }
    if (!passwordUpdateBucket.consume(session.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const passwordHash = await getUserPasswordHash(user.id);
    const validPassword = await verifyPasswordHash(
      passwordHash,
      validatedData.data.password,
    );
    if (!validPassword) {
      return NextResponse.json({ success: false, error: "INCORRECT_PASSWORD" });
    }

    passwordUpdateBucket.reset(session.id);
    await invalidateUserSessions(user.id);
    await updateUserPassword(user.id, validatedData.data.newPassword);

    const sessionToken = generateSessionToken();
    const sessionFlags: SessionFlags = {
      twoFactorVerified: session.twoFactorVerified,
    };
    const newSession = await createSession(sessionToken, user.id, sessionFlags);
    setSessionTokenCookie(sessionToken, newSession.expiresAt);

    return NextResponse.json({
      success: true,
      error: null,
      sessionToken,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
