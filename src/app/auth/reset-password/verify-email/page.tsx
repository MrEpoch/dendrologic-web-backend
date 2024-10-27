import { PasswordResetEmailVerificationForm } from "@/components/auth/PasswordResetForm";
import { validatePasswordResetSessionRequest } from "@/lib/password-reset";
import { globalGETRateLimitNext } from "@/lib/request";
import { redirect } from "next/navigation";

export default async function Page() {
  if (!globalGETRateLimitNext()) {
    return <div>Too many requests</div>;
  }
  const { session } = await validatePasswordResetSessionRequest();
  if (session === null) {
    return redirect("/auth/forgot-password");
  }
  if (session.emailVerified) {
    if (!session.twoFactorVerified) {
      return redirect("/auth/reset-password/2fa");
    }
    return redirect("/auth/reset-password");
  }
  return (
    <>
      <h1>Verify your email address</h1>
      <p>We sent an 8-digit code to {session.email}.</p>
      <PasswordResetEmailVerificationForm />
    </>
  );
}
