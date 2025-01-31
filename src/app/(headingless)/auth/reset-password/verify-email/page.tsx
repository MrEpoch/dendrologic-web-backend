import { PasswordResetEmailVerificationForm } from "@/components/auth/PasswordResetForm";
import { validatePasswordResetSessionRequest } from "@/lib/password-reset";
import { globalGETRateLimitNext } from "@/lib/request";
import { MuseoModerno } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-museo-moderno",
});

export default async function Page() {
  if (!(await globalGETRateLimitNext())) {
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
      <div className="relative flex h-full min-h-screen">
        <Link
          href="/"
          className="absolute top-5 z-10 left-5 flex items-center justify-center gap-4 text-lg font-extrabold"
        >
          <img src="/logo.png" alt="logo" className="h-32 w-auto" />
          <p
            className={`text-white text-2xl font-extrabold ${museoModerno.className}`}
          >
            Dendree
          </p>
        </Link>
        <img
          src="/forest.webp"
          alt="forest"
          width={1920}
          height={1080}
          className="w-full max-h-full brightness-75 h-screen hidden md:block object-cover"
        />
        <div className="w-full min-h-full flex flex-col  gap-8 items-center justify-center">
          <h1>Verify your email address</h1>
          <p>We sent an 8-digit code to {session.email}.</p>
          <PasswordResetEmailVerificationForm />
        </div>
      </div>
    </>
  );
}
