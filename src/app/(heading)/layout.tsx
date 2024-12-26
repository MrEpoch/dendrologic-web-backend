import React from "react";
import Header from "@/components/shared/header";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="h-view-container flex h-full bg-main-background-100">
        {children}
      </main>
    </>
  );
}
