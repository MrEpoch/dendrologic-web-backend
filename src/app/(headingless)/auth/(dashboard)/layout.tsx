import React from "react";
import BreadcrumbsNav from "./_sections/BreadcrumbsNav";

export default function Layout({ children }) {
  return (
    <>
      <BreadcrumbsNav />
      {children}
    </>
  );
}
