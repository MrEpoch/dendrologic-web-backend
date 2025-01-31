import React from "react";

export default function Page() {
  return (
    <div className="max-w-container flex flex-col gap-4 py-16">
      <h1 className="text-3xl">Použité zdroje</h1>
      <a className="text-blue-500 hover:underline hover:text-blue-700" href="https://lucia-auth.com/">Lucia Auth, zdroje na implementaci autentikace</a>
      <a className="text-blue-500 hover:underline hover:text-blue-700" href="https://gis-aopkcr.opendata.arcgis.com/datasets/aopkcr::pam%C3%A1tn%C3%A9-stromy">Zdrojová data pro databázi od AOPK ČR</a>
      <a className="text-blue-500 hover:underline hover:text-blue-700" href="https://openlayers.org/">Open layers knihovna na mapovou manipulaci</a>
      <a className="text-blue-500 hover:underline hover:text-blue-700" href="https://ui.shadcn.com/">Shadcn UI, komponenty</a>
    </div>
  )
}
