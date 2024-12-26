import { TwoFactorResetForm } from "@/components/auth/TwoFactorSetUpForm";
import { globalGETRateLimitNext } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { redirect } from "next/navigation";

export default async function Page() {
  if (!globalGETRateLimitNext()) {
    return "Too many requests";
  }
  const { session, user } = await getCurrentSession();
  if (session === null) {
    return redirect("/auth/login");
  }
  if (!user.emailVerified) {
    return redirect("/auth/verify-email");
  }
  if (!user.registered2FA) {
    return redirect("/auth/2fa/setup");
  }
  if (session.twoFactorVerified) {
    return redirect("/");
  }
  return (
    <>
      <h1>Recover your account</h1>
      <TwoFactorResetForm />
    </>
  );
}
