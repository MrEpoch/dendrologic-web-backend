import { TwoFactorVerificationForm } from "@/components/auth/TwoFactorSetUpForm";
import { globalGETRateLimitNext } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { Anton, MuseoModerno } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-museo-moderno",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

export default async function Page() {
  if (!(await globalGETRateLimitNext())) {
    return <div>Too many requests</div>;
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
          src="/forest.jpg"
          alt="Forest"
          width={1920}
          height={1080}
          className="w-full max-h-full brightness-75 h-screen hidden md:block object-cover"
        />
        <div className="w-full min-h-full flex flex-col  gap-8 items-center justify-center">
          <h1 className={`text-3xl font-bold ${anton.className}`}>
            Two-factor authentication
          </h1>
          <p>Enter the code from your authenticator app.</p>
          <TwoFactorVerificationForm />
          <Link href="/auth/2fa/reset">Use recovery code</Link>
        </div>
      </div>
    </>
  );
}
