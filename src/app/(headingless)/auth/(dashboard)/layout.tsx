import React from "react";
import BreadcrumbsNav from "./_sections/BreadcrumbsNav";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/sessionTokens";

export default async function Layout({ children }) {

  const { session, user } = await getCurrentSession();
  if (session === null) {
    return redirect("/auth/login");
  }
  if (!user?.emailVerified) {
    return redirect("/auth/verify-email");
  }
  if (!user.registered2FA && !session.twoFactorVerified) {
    return redirect("/auth/2fa/setup");
  }

  return (
    <>
      <BreadcrumbsNav />
      {children}
    </>
  );
}
