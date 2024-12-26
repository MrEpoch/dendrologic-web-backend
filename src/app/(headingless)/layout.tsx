import React from "react";

export default function Layout({ children }) {
  return (
    <main className="h-view-container flex h-full bg-main-background-100">
      {children}
    </main>
  );
}
