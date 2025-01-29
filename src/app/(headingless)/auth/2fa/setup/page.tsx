import { TwoFactorSetUpForm } from "@/components/auth/TwoFactorSetUpForm";
import { globalGETRateLimitNext } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { encodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import { Anton, MuseoModerno } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { renderSVG } from "uqr";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-museo-moderno",
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
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect("/auth/2fa");
  }

  const totpKey = new Uint8Array(20);
  crypto.getRandomValues(totpKey);
  const encodedTOTPKey = encodeBase64(totpKey);
  const keyURI = createTOTPKeyURI("Dendree", user.username, totpKey, 30, 6);
  const qrcode = renderSVG(keyURI);
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
        src="/forest.webp"
        alt="forest"
        width={1920}
        height={1080}
        className="w-full max-h-full brightness-75 h-screen hidden md:block object-cover"
      />
      <div className="w-full min-h-full flex flex-col  gap-8 items-center justify-center">
        <h1 className={`text-3xl font-bold ${anton.className}`}>
          Nastavte si 2-fázové ověření
        </h1>
        <div
          style={{
            width: "200px",
            height: "200px",
          }}
          dangerouslySetInnerHTML={{
            __html: qrcode,
          }}
        ></div>
        <TwoFactorSetUpForm encodedTOTPKey={encodedTOTPKey} />
        <Link
          href="/guide/2fa"
          className="text-sm text-gray-700 transition hover:opacity-75"
        >
          Návod k nastavení 2-fazové ověření
        </Link>
      </div>
    </div>
  );
}
