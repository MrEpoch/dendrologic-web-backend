import React from "react";
import HeaderClient from "./headerClient";

export default function Header({ isLogged }) {
  return (
    <header className="bg-white">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <a className="block text-green-600" href="/">
          <span className="sr-only">Home</span>
          <img src="/logo.png" alt="logo" className="h-16 w-auto" />
        </a>
        <HeaderClient isLogged={isLogged} />
      </div>
    </header>
  );
}
