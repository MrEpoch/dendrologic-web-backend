"use client";
import { Button } from "@/components/ui/button";
import { MuseoModerno } from "next/font/google";
import React, { useState } from "react";

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-museo-moderno",
});

export function RecoveryCodeForm({ recoveryCode }) {
  const [recoveryCodeState, setRecoveryCodeState] = useState(recoveryCode);

  async function onSubmit(e) {
    e.preventDefault();
    const recoveryCodeApi = await fetch(
      "/api/auth/settings/regenerate-recovery-code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      },
    );
    const codeResponse = await recoveryCodeApi.json();
    if (codeResponse.success && codeResponse.recoveryCode) {
      console.log("Success", codeResponse);
      setRecoveryCodeState(codeResponse.recoveryCode);
    }
  }

  return (
    <div className="flex flex-col py-8 gap-4">
      <h2 className="text-2xl">Záchraný kód</h2>
      <p>{recoveryCodeState}</p>
      <form className="space-y-8">
        <Button
          className={`bg-main-background-300 px-10 ${museoModerno.className} font-medium border py-5 text-main-text-100 hover:bg-transparent hover:text-black hover:border-main-100 hover:border rounded-[--radius] text-lg shadow`}
          onClick={onSubmit}
          type="button"
        >
          Vygenerovat nový záchraný kód
        </Button>
      </form>
    </div>
  );
}
