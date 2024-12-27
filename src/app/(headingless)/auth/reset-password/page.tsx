import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { validatePasswordResetSessionRequest } from "@/lib/password-reset";
import { globalGETRateLimitNext } from "@/lib/request";
import { redirect } from "next/navigation";

export default async function Page() {
  if (!(await globalGETRateLimitNext())) {
    return <div>Too many requests</div>;
  }
  const { session, user } = await validatePasswordResetSessionRequest();
  if (session === null) {
    return redirect("/auth/forgot-password");
  }
  if (!session.emailVerified) {
    return redirect("/auth/reset-password/verify-email");
  }
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect("/auth/reset-password/2fa");
  }
  return (
    <>
      <h1>Enter your new password</h1>
      <PasswordResetForm />
    </>
  );
}
