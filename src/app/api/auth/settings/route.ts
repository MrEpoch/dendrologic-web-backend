import { globalGETRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { getUserRecoveryCode } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

  console.log(user);


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
      error: "2FA_NOT_ENABLED",
      redirect: "/auth/2fa",
    });
  }

  let recoveryCode: string | null = null;
  if (user.registered2FA) {
    recoveryCode = await getUserRecoveryCode(user.id);
  }

  return NextResponse.json({ success: true, recoveryCode, user, session });
}
