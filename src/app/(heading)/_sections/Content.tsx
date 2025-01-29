import React from "react";

export default function Content() {
  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col">
          <div className="h-1 bg-gray-200 rounded overflow-hidden">
            <div className="w-24 h-full bg-main-background-300"></div>
          </div>
          <div className="flex flex-wrap sm:flex-row flex-col py-6 mb-12">
            <h1 className="sm:w-2/5 text-gray-900 font-medium title-font text-2xl mb-2 sm:mb-0">
              Popis projektu
            </h1>
            <p className="sm:w-3/5 leading-relaxed text-base sm:pl-10 pl-0">
              Hlavní funkce projektu zajímací se tématikou dendrologického
              mapování
            </p>
          </div>
        </div>
        <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4">
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
              <img
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/library.webp"
              />
            </div>
            Photo by{" "}
            <a href="https://unsplash.com/@tofi?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
              Tobias Fischer
            </a>{" "}
            on{" "}
            <a href="https://unsplash.com/photos/photo-of-5-story-library-building-PkbZahEG2Ng?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
              Unsplash
            </a>
            <h2 className="text-xl font-medium title-font text-gray-900 mt-5">
              Databáze 10k+
            </h2>
            <p className="text-base leading-relaxed mt-2">
              Při vývoji byla použita databáze památných stromů s obsahem více
              jak 100 000 stromů, které jsou umístěny na mapě ČR.
            </p>
            <a className="text-main-100 inline-flex items-center mt-3">
              Zjistit více
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
              <img
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/trees-photo.webp"
              />
            </div>
            Photo by{" "}
            <a href="https://unsplash.com/@tbzr?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
              Arnaud Mesureur
            </a>{" "}
            on{" "}
            <a href="https://unsplash.com/photos/low-angle-photography-of-green-trees-7EqQ1s3wIAI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
              Unsplash
            </a>
            <h2 className="text-xl font-medium title-font text-gray-900 mt-5">
              Ukládání obrázků stromů
            </h2>
            <p className="text-base leading-relaxed mt-2">
              Uživatelé mohou přidávat fotografie stromů, které chtějí
              zdokumentavot ve svém okolí, nebo vytvořit nové stromy.
            </p>
            <a className="text-main-100 inline-flex items-center mt-3">
              Zjistit více
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
              <img
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/interface.webp"
              />
            </div>
            Photo by{" "}
            <a href="https://unsplash.com/@kellysikkema?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
              Kelly Sikkema
            </a>{" "}
            on{" "}
            <a href="https://unsplash.com/photos/a-couple-of-pieces-of-glass-sitting-on-top-of-a-table-wxvz-g1nM_k?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
              Unsplash
            </a>
            <h2 className="text-xl font-medium title-font text-gray-900 mt-5">
              Uživatelské funkce
            </h2>
            <p className="text-base leading-relaxed mt-2">
              Uživatelé se mohou lze přihlasit a sledovat své vlastní fotografie
              a záznamy stromů co přidali, lze vytvářet menší mapky.
            </p>
            <a className="text-main-100 inline-flex items-center mt-3">
              Zjistit více
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
