"use client";

import { useState } from "react";

export function EmailVerificationForm() {
  const [state, setState] = useState("");
  const [code, setCode] = useState("");

  async function onSubmit() {
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
      setState("Verified");
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
      <p>{state}</p>
    </form>
  );
}

export function ResendEmailVerificationForm() {
  const [state, setState] = useState("");

  async function onSubmit() {
    const response = await fetch("/api/auth/verify-email/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.success) {
      setState("Resended");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <button>Resend code</button>
      <p>{state}</p>
    </form>
  );
}
