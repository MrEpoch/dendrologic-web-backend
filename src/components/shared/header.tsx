import React from "react";
import HeaderClient from "./headerClient";
import Link from "next/link";

export default function Header({ isLogged }) {
  return (
    <header className="bg-main-background-100">
      <div className="mx-auto flex min-h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link className="block text-green-600" href="/">
          <span className="sr-only">Home</span>
          <img src="/logo.png" alt="logo" className="h-16 w-auto" />
        </Link>
        <HeaderClient isLogged={isLogged} />
      </div>
    </header>
  );
}
