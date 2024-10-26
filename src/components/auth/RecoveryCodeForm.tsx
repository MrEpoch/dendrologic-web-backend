"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

export function RecoveryCodeForm({ recoveryCode }) {
  const [recoveryCodeState, setRecoveryCodeState] = useState(recoveryCode);

  async function onSubmit(e) {
    e.preventDefault();
    const recoveryCodeApi = await fetch("/api/settings/regenerate-recovery-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const codeResponse = await recoveryCodeApi.json();
    if (codeResponse.success && codeResponse.recoveryCode) {
      console.log("Success", codeResponse);
      setRecoveryCodeState(codeResponse.recoveryCode);
    }
  }

  return (
    <>
      <h2>Recovery code</h2>
      <p>{recoveryCodeState}</p>
      <form className="space-y-8">
        <Button onClick={onSubmit} type="button">Generate new recovery code</Button>
      </form>
    </>
  );
}
