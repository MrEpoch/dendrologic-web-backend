import Image from "next/image";
import React from "react";

export default function Page() {
  return (
    <div className="max-w-container">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl">O projektu</h1>
        <hr className="h-0.5 self-center rounded-full shadow-lg bg-main-300 w-full" />
        <div
          className="flex gap-8 py-8 lg:flex-row flex-col justify-between items-center"
          id="db-10k"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl">Databáze 10k+</h2>
            <p>
              Projekt obsahuje databázi stromů s rozsahem 10 000 stromů,
              kritické informace o daných stromech jako jejich geo lokaci, jméno
              a unikátní id identifikaci.
            </p>
            <p>
              Zdrojem dat byl <span />
              <a
                className="underline text-blue-600 hover:text-blue-700"
                href="https://gis-aopkcr.opendata.arcgis.com/datasets/aopkcr::pam%C3%A1tn%C3%A9-stromy/about"
              >
                arcgis
              </a>
              , se sbírkou památných stromů od agentury ochrany přírody a
              krajiny České republiky. Data byla naposledy aktualizovány v
              červenci roku 2024. Jsou to CC BY 4.0 License, veřejně dostupná s
              atribucí, data.
            </p>
            <p>
              Data byla přepsána přes python do databáze, a několik jednotlivých
              informací bylo ze stromů odstraněno, co jsem posoudil že nebude
              použito. K datům má přistup pouze autorizovaný uživatel, takže
              podmínkou pro využívání je se registorovat nebo přihlásit.
            </p>
          </div>
          <div className="w-full flex flex-col gap-2">
            <Image
              src="/library.webp"
              alt="Fotka z knihovny"
              width={500}
              height={500}
            />
            <p>
              Photo by{" "}
              <a href="https://unsplash.com/@tofi?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Tobias Fischer
              </a>{" "}
              on{" "}
              <a href="https://unsplash.com/photos/photo-of-5-story-library-building-PkbZahEG2Ng?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Unsplash
              </a>
            </p>
          </div>
        </div>
        <hr className="h-0.5 self-center rounded-full shadow-lg bg-main-300 w-full" />
        <div
          className="flex gap-8 py-8 justify-between items-center"
          id="image-saving"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl">Ukládání obrázků stromů</h2>
            <p>
              Uživatelé mohou přidávat fotografie stromů, které chtějí
              zdokumentavot ve svém okolí, nebo vytvořit nové stromy.
            </p>
            <p>
              Aplikace obsahuje metody pro ukládání a zobrazování obrázků
              jednotlivých stromů, k ukládání daných stromů bylo použito datové
              uložiště{" "}
              <a
                href="https://min.io/"
                className="underline text-blue-600 hover:text-blue-700"
              >
                MinIO
              </a>
              .
            </p>
          </div>
          <div className="w-full flex flex-col gap-2">
            <Image
              src="/trees-photo.webp"
              alt="Obrázek stromů ze země"
              width={500}
              height={500}
            />
            <p>
              Photo by{" "}
              <a href="https://unsplash.com/@tbzr?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Arnaud Mesureur
              </a>{" "}
              on{" "}
              <a href="https://unsplash.com/photos/low-angle-photography-of-green-trees-7EqQ1s3wIAI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Unsplash
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
