"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";

export default function BreadcrumbsNav() {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <header className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
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
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
