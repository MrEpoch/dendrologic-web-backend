import {
  createEmailVerificationRequest,
  deleteUserVerificationRequest,
  getUserEmailVerificationFromRequest,
  sendVerificationEmail,
  deleteEmailRequestCookie,
  setEmailRequestCookie,
} from "@/lib/email";
import { invalidateUserPasswordResetSession } from "@/lib/password-reset";
import { ExpiringTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { updateUserEmailAndSetEmailAsVerified } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export async function GET(req: NextRequest) {
  if (!globalGETRateLimit(req)) {
    return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
  }
  const { user } = await getCurrentSession();
  if (user === null) {
    return NextResponse.json({
      success: false,
      error: "UNAUTHORIZED",
      redirect: "/auth/login",
    });
  }

  let verificationRequest = await getUserEmailVerificationFromRequest();
  if (verificationRequest === null && user.emailVerified) {
    return NextResponse.json({
      success: false,
      error: "EMAIL_ALREADY_VERIFIED",
      redirect: "/auth/2fa/setup",
    });
  }

  if (verificationRequest === null) {
    verificationRequest = await createEmailVerificationRequest(
      user.id,
      user.email,
    );
    await sendVerificationEmail(
      verificationRequest.email,
      verificationRequest.code,
    );
    setEmailRequestCookie(verificationRequest);
  }

  return NextResponse.json({
    success: true,
    verificationRequest,
    user,
    emailRequestId: verificationRequest.id,
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const { session, user } = await getCurrentSession();
    if (session === null) {
      console.log("session lack");
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }
    if (user.registered2FA && !session.twoFactorVerified) {
      console.log("2fa lack");
      return NextResponse.json({
        success: false,
        error: "2FA_NOT_ENABLED",
        redirect: "/auth/2fa/setup",
      });
    }
    if (!bucket.check(user.id, 1)) {
      console.log("bucket lack");
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    let verificationRequest = await getUserEmailVerificationFromRequest();
    if (verificationRequest === null) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    const data = await request.json();
    const dataSchema = z.object({
      code: z.string().min(1),
    });

    const dataValidated = dataSchema.safeParse(data);
    if (!dataValidated.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    if (!bucket.consume(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    if (Date.now() >= verificationRequest.expiresAt.getTime()) {
      verificationRequest = await createEmailVerificationRequest(
        verificationRequest.userId,
        verificationRequest.email,
      );
      sendVerificationEmail(
        verificationRequest.email,
        verificationRequest.code,
      );
      return NextResponse.json({
        success: true,
        message:
          "The verification code was expired. We sent another code to your inbox.",
      });
    }
    if (verificationRequest.code !== dataValidated.data.code) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    deleteUserVerificationRequest(user.id);
    invalidateUserPasswordResetSession(user.id);
    updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email);
    deleteEmailRequestCookie();

    if (!user.registered2FA) {
      return NextResponse.json({ success: true, redirect: "/auth/2fa/setup" });
    }
    return NextResponse.json({
      success: true,
      emailRequestId: verificationRequest.id,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
