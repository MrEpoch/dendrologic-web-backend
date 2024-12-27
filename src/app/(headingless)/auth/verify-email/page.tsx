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
import { Anton, MuseoModerno } from "next/font/google";
import { cookies, headers } from "next/headers";
import Link from "next/link";

import { redirect } from "next/navigation";

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
  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect("/auth/login");
  }

  let verificationRequest = await getUserEmailVerificationFromRequest();
  if (verificationRequest === null && user.emailVerified) {
    return redirect("/");
  }

   // TODO: Ideally we'd sent a new verification email automatically if the previous one is expired,
  // but we can't set cookies inside server components.
 
    /*
  if (verificationRequest === null) {
    await fetch((process.env.NODE_ENV === "development" ? "http://localhost:3752" : "https://dendrologic-web.stencukpage.com") + "/api/auth/verify-email/resend", {
      method: "POST",
      headers: {
        "Cookie": cookies().toString(),
        "Content-Type": "application/json",
      },
    })
  }
    */

  return (
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
        alt="forest"
        width={1920}
        height={1080}
        className="w-full max-h-full brightness-75 h-screen hidden md:block object-cover"
      />
      <div className="w-full min-h-full flex flex-col  gap-8 items-center justify-center">
        <h1 className={`text-3xl font-bold ${anton.className}`}>
          Ověřte svůj email
        </h1>
        <p>
          Poslali jsme 8-charackterový kód na email:{" "}
          {verificationRequest?.email ?? user.email}.
        </p>
        <EmailVerificationForm />
        <ResendEmailVerificationForm />
        <Link href="/auth/settings">Změnit email</Link>
      </div>
    </div>
  );
}
