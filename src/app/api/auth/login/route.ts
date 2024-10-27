import { verifyPasswordHash } from "@/lib/password";
import { RefillingTokenBucket, Throttler } from "@/lib/rate-limit";
import { globalPOSTRateLimit } from "@/lib/request";
import {
  createSession,
  generateSessionToken,
  SessionFlags,
  setSessionTokenCookie,
} from "@/lib/sessionTokens";
import { getUserFromEmail, getUserPasswordHash } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";
import requestIp from "request-ip";
import { z } from "zod";

const throttler = new Throttler<string>([1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const zodValidated = z.object({
      email: z.string().email().min(1),
      password: z.string().min(8).max(255),
    });

    const data = await request.json();
    const validated = zodValidated.safeParse(data);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const user = await getUserFromEmail(validated.data.email);
    if (user === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    if (clientIp !== null && !ipBucket.consume(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    if (!throttler.consume(user.id)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const passwordHash = await getUserPasswordHash(user.id);
    const validPassword = await verifyPasswordHash(
      passwordHash,
      validated.data.password,
    );
    if (!validPassword) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    throttler.reset(user.id);

    const sessionFlags: SessionFlags = {
      twoFactorVerified: false,
    };

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id, sessionFlags);
    setSessionTokenCookie(sessionToken, session.expiresAt);

    if (!user.emailVerified) {
      return NextResponse.json({
        success: true,
        error: "EMAIL_NOT_VERIFIED",
        redirect: "/auth/verify-email",
        sessionToken,
      });
    }

    if (!user.registered2FA) {
      return NextResponse.json({
        success: true,
        error: "2FA_NOT_ENABLED",
        redirect: "/auth/2fa/setup",
        sessionToken,
      });
    }

    return NextResponse.json({
      success: true,
      error: null,
      redirect: "/auth/2fa",
      sessionToken,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
