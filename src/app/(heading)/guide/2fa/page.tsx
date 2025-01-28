import React from "react";

export default function Page() {
  return (
    <div className="max-w-container">
      <div className="h-full w-full flex flex-col gap-8">
        <h1 className="text-3xl">Návod k nastavení 2FA</h1>
        <p className="text-gray-500">
          Tato aplikace implementuje metodu 2-fázového ověření za pomoci TOTP.
          Je to metoda generování unikátního klíče za pomocí ověřovací aplikace
          v mobile, který se zadá do Dendree aby ověřil platnost přihlášení.
        </p>
        <hr className="h-0.5 self-center rounded-full shadow-lg bg-main-300 w-full" />
        <div className="flex flex-col gap-4 py-6">
          <h2 className="text-xl">
            1. Stáhněte nebo otevřete authenticator aplikaci
          </h2>
          <ul className="gap-4 flex flex-col list-disc list-inside">
            <li>
              <a
                className="underline text-blue-600 hover:text-blue-700"
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&pcampaignid=web_share"
              >
                Google Authenticator
              </a>
            </li>
            <li>
              <a
                className="underline text-blue-600 hover:text-blue-700"
                href="https://play.google.com/store/apps/details?id=com.azure.authenticator&pcampaignid=web_share"
              >
                Microsoft Authenticator
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4 py-6">
          <h2 className="text-xl">2. Vyberte metodu vložení klíče</h2>
          <ul className="gap-8 flex flex-col list-inside">
            <li>
              <h3 className="text-lg font-bold">Google Authenticator</h3>
              <br />
              <p>
                Klikněte na tlačitko plus dole v pravo, otevře se okéno možností
                pokud se přihlašujete na počítači přes mobil, tak vyberte QR kód
                skenování.
              </p>
              <br />V případě že se přihlašujete na mobile klikněte na možnost
              Zadat klíč pro nastavení, pojmenujte Kódové označení Dendree, poté
              běžte na aplikace Dendree a klikněte na tlačítko kopírovat klíč a
              zkopířovaný klíč vložte do druhého pole "Váš klíč" a pak klikněte
              přidat.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
