"use client";
import React from "react";
import { SortableListRequests } from "./_sections/SortableListRequests";

export default function Page() {
  return (
    <div className="max-w-container">
      <h1 className="text-3xl">Hlavní panel</h1>
      <div className="py-8">
        <SortableListRequests />
      </div>
    </div>
  );
}
