import { globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { resetUserRecoveryCode } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const { session, user } = await getCurrentSession();
    if (session === null || user === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }
    if (!user.emailVerified) {
      return NextResponse.json({ success: false, error: "EMAIL_NOT_VERIFIED" });
    }
    if (!session.twoFactorVerified) {
      return NextResponse.json({ success: false, error: "2FA_NOT_ENABLED" });
    }
    const recoveryCode = await resetUserRecoveryCode(session.userId);
    return NextResponse.json({ success: true, recoveryCode });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
