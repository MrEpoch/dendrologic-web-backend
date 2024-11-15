import {
  checkEmailAvailability,
  createEmailVerificationRequest,
  sendVerificationEmail,
  setEmailRequestCookie,
} from "@/lib/email";
import { verifyPasswordStrength } from "@/lib/password";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalPOSTRateLimit } from "@/lib/request";
import {
  createSession,
  generateSessionToken,
  SessionFlags,
  setSessionTokenCookie,
} from "@/lib/sessionTokens";
import { createUser } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";
import requestIp from "request-ip";
import { z } from "zod";

const ipBucket = new RefillingTokenBucket<string>(5, 10);

export async function POST(request: NextRequest) {
  try {
    console.log("hit");
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const zodValidated = z.object({
      email: z.string().email().min(1),
      username: z.string().max(255).min(3),
      password: z.string().min(8).max(255),
    });

    const data = await request.json();
    console.log(data);
    const validated = zodValidated.safeParse(data);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const emailAvailable = checkEmailAvailability(validated.data.email);
    if (!emailAvailable) {
      return NextResponse.json({
        success: false,
        error: "EMAIL_NOT_AVAILABLE",
      });
    }

    const strongPassword = await verifyPasswordStrength(
      validated.data.password,
    );
    if (!strongPassword) {
      return NextResponse.json({ success: false, error: "WEAK_PASSWORD" });
    }

    if (clientIp && !ipBucket.consume(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const user = await createUser(
      validated.data.email,
      validated.data.username,
      validated.data.password,
    );

    const emailVerificationRequest = await createEmailVerificationRequest(
      user.id,
      user.email,
    );
    sendVerificationEmail(
      emailVerificationRequest.email,
      emailVerificationRequest.code,
    );
    setEmailRequestCookie(emailVerificationRequest);

    const sessionFlags: SessionFlags = {
      twoFactorVerified: false,
    };

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id, sessionFlags);
    setSessionTokenCookie(sessionToken, session.expiresAt);

    return NextResponse.json({
      success: true,
      redirect: "/auth/verify-email",
      sessionToken,
      emailRequestId: emailVerificationRequest.id,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
