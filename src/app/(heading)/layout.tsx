import React from "react";
import Header from "@/components/shared/header";
import { cookies } from "next/headers";

export default function Layout({ children }) {
  return (
    <>
      <Header isLogged={cookies().has("session")} />
      <main className="h-view-container flex h-full bg-main-background-100">
        {children}
      </main>
    </>
  );
}
