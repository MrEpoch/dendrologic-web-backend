import {
  checkEmailAvailability,
  createEmailVerificationRequest,
  sendVerificationEmail,
  sendVerificationEmailBucket,
  setEmailRequestCookie,
} from "@/lib/email";
import { globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    if (!sendVerificationEmailBucket.check(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const data = await request.json();
    const dataSchema = z.object({
      email: z.string().email(),
    });

    const dataValidated = dataSchema.safeParse(data);
    if (!dataValidated.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const emailAvailable = await checkEmailAvailability(
      dataValidated.data.email,
    );
    if (!emailAvailable) {
      return NextResponse.json({
        success: false,
        error: "EMAIL_NOT_AVAILABLE",
      });
    }

    if (!sendVerificationEmailBucket.consume(user.id, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const verificationRequest = await createEmailVerificationRequest(
      user.id,
      dataValidated.data.email,
    );
    await sendVerificationEmail(
      verificationRequest.email,
      verificationRequest.code,
    );
    setEmailRequestCookie(verificationRequest);
    return NextResponse.json({
      success: true,
      message: "The verification code was sent to your inbox.",
      redirect: "/auth/email-verify",
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ success: false, error: "UNKNOWN_ERROR" });
  }
}
