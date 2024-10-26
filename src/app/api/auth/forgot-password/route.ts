import {
  createPasswordResetSession,
  invalidateUserPasswordResetSession,
  sendPasswordResetEmail,
  setPasswordResetSessionTokenCookie,
} from "@/lib/password-reset";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalPOSTRateLimit } from "@/lib/request";
import { generateSessionToken } from "@/lib/sessionTokens";
import { getUserFromEmail } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";
import requestIp from "request-ip";
import { z } from "zod";

const passwordResetEmailIPBucket = new RefillingTokenBucket<string>(3, 60);
const passwordResetEmailUserBucket = new RefillingTokenBucket<string>(3, 60);

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = requestIp.getClientIp(request);
    if (clientIp !== null && !passwordResetEmailIPBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const zodValidated = z.object({
      email: z.string().email().min(1),
    });

    const data = await request.json();
    console.log(data);
    const validated = zodValidated.safeParse(data);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const user = await getUserFromEmail(validated.data.email);
    if (user === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    if (user.id !== null && !passwordResetEmailUserBucket.check(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    if (clientIp !== null && !passwordResetEmailIPBucket.consume(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    if (!passwordResetEmailUserBucket.consume(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    await invalidateUserPasswordResetSession(user.id);
    const sessionToken = generateSessionToken();
    const session = await createPasswordResetSession(
      sessionToken,
      user.id,
      user.email,
    );

    await sendPasswordResetEmail(session.email, session.code);
    setPasswordResetSessionTokenCookie(sessionToken, session.expiresAt);

    return NextResponse.json({
      success: true,
      error: null,
      redirect: "/auth/reset-password/verify-email",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
