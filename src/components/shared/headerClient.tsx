"use client";
import Link from "next/link";
import React from "react";

export default function HeaderClient({ isLogged }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <div className="flex md:p-0 p-4 gap-6 flex-col-reverse md:flex-row min-h-full flex-1 items-center justify-end md:justify-between">
      <nav
        aria-label="Global"
        className={`${menuOpen ? "flex md:flex-row flex-col max-[700px]:w-full max-[700px]:h-full" : "hidden"} md:block`}
      >
        <ul
          className={`${menuOpen ? "max-[700px]:w-full max-[700px]:h-full flex md:flex-row flex-col bg-main-background-200 rounded-lg max-[700px]:p-4" : ""} sm:bg-transparent flex items-center gap-6 text-sm`}
        >
          <li>
            <a
              className="text-gray-500 transition hover:text-gray-500/75"
              href="/guide"
            >
              Návod
            </a>
          </li>

          <li>
            <a
              className="text-gray-500 transition hover:text-gray-500/75"
              href="/about"
            >
              O projektu
            </a>
          </li>

          <li>
            <a
              className="text-gray-500 transition hover:text-gray-500/75"
              href="/contact"
            >
              Kontakt
            </a>
          </li>

          <li>
            <a
              className="text-gray-500 transition hover:text-gray-500/75"
              href="/attribution"
            >
              Atribuce zdrojů
            </a>
          </li>
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        {isLogged ? (
          <Link
            className="block w-full rounded-md bg-main-background-300 border-transparent hover:border-black border hover:bg-transparent px-5 py-2.5 text-sm font-medium text-main-text-100 transition"
            href="/auth/dashboard"
          >
            Hlavní panel
          </Link>
        ) : (
          <div className="sm:flex sm:gap-4">
            <Link
              className="block rounded-md bg-main-background-300 border-transparent hover:border-black border hover:bg-transparent px-5 py-2.5 text-sm font-medium text-main-text-100 transition"
              href="/auth/login"
            >
              Přihlásit
            </Link>

            <Link
              className="hidden rounded-md bg-main-300 px-5 py-2.5 text-sm font-medium text-main-text-200 transition hover:text-main-text-100 sm:block"
              href="/auth/register"
            >
              Registorovat
            </Link>
          </div>
        )}

        <button
          onClick={toggleMenu}
          className="block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:h-0 md:w-0 md:absolute md:hidden"
        >
          <span className="sr-only">Toggle menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
