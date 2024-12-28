"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Cog, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function BreadcrumbsNav() {
  const pathname = usePathname();
  return (
    <header className="mx-auto flex h-16 max-w-screen-xl justify-between w-full items-center gap-8 px-4 sm:px-6 lg:px-8">
      <Link className="block text-green-600" href="/">
        <span className="sr-only">Home</span>
        <img src="/logo.png" alt="logo" className="h-16 w-auto" />
      </Link>
      <Breadcrumb>
        <BreadcrumbList>
          {pathname === "/auth/dashboard" ? (
            <BreadcrumbItem>
              <BreadcrumbPage>Hlavní panel</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbLink href="/auth/dashboard">
                Hlavní panel
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {pathname === "/auth/settings" && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Nastavení</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {pathname.startsWith("/auth/dashboard/requests") && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {pathname.split("/").length === 4 ? (
                  <BreadcrumbPage>Žádosti</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href="/auth/dashboard/requests">
                    Žádosti
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {pathname.split("/")[4] === "create" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Nová</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {pathname.split("/")[4] === "update" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Změna</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {pathname.split("/")[4] === "read" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Žádost</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-4">
        <button className="p-2 bg-main-100 rounded text-white">
          <Search />
        </button>
        <Link
          href="/auth/settings"
          className="p-2 bg-main-100 rounded text-white"
        >
          <Cog />
        </Link>
      </div>
    </header>
  );
}
