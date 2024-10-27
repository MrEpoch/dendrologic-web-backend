import {
  createEmailVerificationRequest,
  getUserEmailVerificationFromRequest,
  sendVerificationEmail,
  sendVerificationEmailBucket,
  setEmailRequestCookie,
} from "@/lib/email";
import { getCurrentSession } from "@/lib/sessionTokens";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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
    if (!sendVerificationEmailBucket.check(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    let verificationRequest = await getUserEmailVerificationFromRequest();
    if (verificationRequest === null) {
      if (user.emailVerified) {
        return NextResponse.json({
          success: false,
          error: "EMAIL_ALREADY_VERIFIED",
        });
      }
      if (!sendVerificationEmailBucket.consume(user.id, 1)) {
        return NextResponse.json({
          success: false,
          error: "TOO_MANY_REQUESTS",
        });
      }
      verificationRequest = await createEmailVerificationRequest(
        user.id,
        user.email,
      );
    } else {
      if (!sendVerificationEmailBucket.consume(user.id, 1)) {
        return NextResponse.json({
          success: false,
          error: "TOO_MANY_REQUESTS",
        });
      }
      verificationRequest = await createEmailVerificationRequest(
        user.id,
        verificationRequest.email,
      );
    }
    await sendVerificationEmail(
      verificationRequest.email,
      verificationRequest.code,
    );
    setEmailRequestCookie(verificationRequest);
    return NextResponse.json({
      success: true,
      message: "The verification code was sent to your inbox.",
      emailRequestId: verificationRequest.id,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
