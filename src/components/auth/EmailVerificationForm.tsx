"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmailVerificationForm() {
  const [code, setCode] = useState("");

  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    console.log("sending", code);
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
    if (data.success) {
      router.push("/auth/2fa/setup");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="form-verify.code">Email code</label>
      <input
        id="form-verify.code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        name="code"
        required
      />
      <br />
      <button>Verify</button>
    </form>
  );
}

export function ResendEmailVerificationForm() {
  const router = useRouter();

  async function onSubmit() {
    const response = await fetch("/api/auth/verify-email/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.redirect) {
      router.push(data.redirect ? data.redirect : "/");
    }
    if (data.success) router.push("/");
  }

  return (
    <form onSubmit={onSubmit}>
      <button>Resend code</button>
    </form>
  );
}
