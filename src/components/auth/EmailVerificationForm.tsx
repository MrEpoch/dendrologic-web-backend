"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { MuseoModerno } from "next/font/google";
import { Input } from "../ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-museo-moderno",
});

export function EmailVerificationForm() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
      }),
    });

    const data = await response.json();

    if (data?.error === "UNAUTHORIZED") router.push("/auth/login");
    if (data?.error === "EXPIRED_CODE") {
      console.log("expired");
      setMessage("Code is expired, we send another one.");
      return;
    }
    if (data.success) {
      console.log(data);
      if (data.redirect) return router.push(data.redirect);
      return router.push("/auth/2fa");
    } else {
      if (data.redirect) {
        return router.push(data.redirect);
      }
    }
  }

  return (
    <form
      className="space-y-2 items-center flex w-full flex-col"
      onSubmit={onSubmit}
    >
      <label htmlFor="form-verify.code">Email code</label>
      <InputOTP
        id="form-verify.code"
        required
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        inputMode="text"
        maxLength={8}
        value={code}
        onChange={(value) => setCode(value)}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
          <InputOTPSlot index={6} />
          <InputOTPSlot index={7} />
        </InputOTPGroup>
      </InputOTP>
      <br />
      <div className="flex gap-2">
        <Button
          className={`bg-main-background-300 px-10 ${museoModerno.className} font-medium border py-5 text-main-text-100 hover:bg-transparent hover:text-black hover:border-main-100 hover:border rounded-[--radius] text-lg shadow`}
          type="submit"
        >
          Ověřit
        </Button>
      </div>
      <p className="text-red-500">{message}</p>
    </form>
  );
}

export function ResendEmailVerificationForm() {
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    const response = await fetch("/api/auth/verify-email/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data?.error === "UNAUTHORIZED") router.push("/auth/login");
    if (data.success) {
      if (data.redirect) return router.push(data.redirect);
    } else {
      if (data.redirect) {
        return router.push(data.redirect);
      }
      return router.push("/");
    }
  }

  return (
    <form className="" onSubmit={onSubmit}>
      <Button
        className={`px-10 bg-transparent ${museoModerno.className} font-medium border py-5 text-main-text-100 hover:bg-transparent hover:text-black hover:border-main-100 hover:border rounded-[--radius] text-lg shadow`}
        type="submit"
      >
        Znovu poslat kód
      </Button>
    </form>
  );
}
