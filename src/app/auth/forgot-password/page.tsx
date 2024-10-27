import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { globalGETRateLimitNext } from "@/lib/request";
import Link from "next/link";

export default function Page() {
  if (!globalGETRateLimitNext()) {
    return <div>Too many requests</div>;
  }
  return (
    <>
      <h1>Forgot your password?</h1>
      <ForgotPasswordForm />
      <Link href="/auth/login">Sign in</Link>
    </>
  );
}
