import Header from "@/components/shared/header";
import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="h-view-container">{children}</main>
    </>
  );
}
