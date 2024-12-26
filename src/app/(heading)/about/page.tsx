import React from "react";

export default function Page() {
  return (
    <div className="max-w-container">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl">O projektu</h1>
        <hr className="h-0.5 self-center rounded-full shadow-lg bg-main-300 w-full" />
        <div className="flex flex-col gap-4 py-8" id="db-10k">
          <h2 className="text-2xl">Databáze 10k+</h2>
          <p>
    Projekt obsahuje databázi stromů s rozsahem 10 000 stromů, kritické informace o daných stromech jako jejich geo lokaci, jméno a unikátní id identifikaci.
          </p>
          <p>
    Zdrojem dat byl <span/>
    <a className="underline text-blue-600 hover:text-blue-700" href="https://gis-aopkcr.opendata.arcgis.com/datasets/aopkcr::pam%C3%A1tn%C3%A9-stromy/about">arcgis</a>
      , se sbírkou památných stromů od agentury ochrany přírody a krajiny České republiky. Data byla naposledy aktualizovány v červenci roku 2024. Jsou to CC BY 4.0 License, veřejně dostupná s atribucí, data.
          </p>
        </div>
      </div>
    </div>
  );
}
