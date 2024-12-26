import {
  EmailVerificationForm,
  ResendEmailVerificationForm,
} from "@/components/auth/EmailVerificationForm";
import {
  createEmailVerificationRequest,
  getUserEmailVerificationFromRequest,
  sendVerificationEmail,
  setEmailRequestCookie,
} from "@/lib/email";
import { globalGETRateLimitNext } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import Link from "next/link";

import { redirect } from "next/navigation";

export default async function Page() {
  if (!globalGETRateLimitNext()) {
    return <div>Too many requests</div>;
  }
  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect("/auth/login");
  }

  // TODO: Ideally we'd sent a new verification email automatically if the previous one is expired,
  // but we can't set cookies inside server components.
  let verificationRequest = await getUserEmailVerificationFromRequest();
  if (verificationRequest === null && user.emailVerified) {
    return redirect("/");
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

  return (
    <>
      <h1>Verify your email address</h1>
      <p>
        We sent an 8-digit code to {verificationRequest?.email ?? user.email}.
      </p>
      <EmailVerificationForm />
      <ResendEmailVerificationForm />
      <Link href="/auth/settings">Change your email</Link>
    </>
  );
}
