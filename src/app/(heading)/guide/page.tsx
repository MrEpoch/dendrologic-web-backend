import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <div className="max-w-container flex flex-col gap-4">
      <h1 className="text-3xl">Návody k použítí</h1>
      <div className="h-full w-full py-8 flex flex-col gap-4">
        <Link href="/guide/2fa" className="group">
          <h2 className="text-xl group-hover:underline">Návod k 2FA</h2>
        </Link>
      </div>
    </div>
  );
}
