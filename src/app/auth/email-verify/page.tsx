import { getUserEmailVerificationFromRequest } from "@/lib/email";
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
  const verificationRequest = await getUserEmailVerificationFromRequest();
  if (verificationRequest === null && user.emailVerified) {
    return redirect("/");
  }
  return (
    <>
      <h1>Verify your email address</h1>
      <p>
        We sent an 8-digit code to {verificationRequest?.email ?? user.email}.
      </p>
      <EmailVerificationForm />
      <ResendEmailVerificationCodeForm />
      <Link href="/settings">Change your email</Link>
    </>
  );
}
