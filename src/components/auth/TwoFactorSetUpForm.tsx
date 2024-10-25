"use client";

import { useState } from "react";

export function TwoFactorSetUpForm(props: { encodedTOTPKey: string }) {
  const [state, setState] = useState("");
  const [code, setCode] = useState("");

  async function onSubmit() {
    const response = await fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encodedTOTPKey: props.encodedTOTPKey,
        code: code,
      }),
    });

    const data = await response.json();
    if (data.success) {
      setState(data.recoveryCode);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="key" value={props.encodedTOTPKey} hidden required />
      <label htmlFor="form-totp.code">Verify the code from the app</label>
      <input
        id="form-totp.code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        name="code"
        required
      />
      <br />
      <button>Save</button>
      <p>{state}</p>
    </form>
  );
}
