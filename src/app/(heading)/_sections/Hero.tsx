import { UserPlus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="text-gray-600 body-font">
      <div className="flex py-24 md:flex-row flex-col items-center">
        <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0">
          <img
            className="object-cover object-center rounded"
            alt="hero"
            src="/maps.webp"
          />
          Photo by{" "}
          <a href="https://unsplash.com/@anniespratt?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
            Annie Spratt
          </a>{" "}
          on{" "}
          <a href="https://unsplash.com/photos/white-and-green-state-maps-AFB6S2kibuk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
            Unsplash
          </a>
        </div>
        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
            Dendrologické mapování oblastí
          </h1>
          <p className="mb-8 leading-relaxed">
            Projekt určen k mapování památných stromů v české republice, je
            mobilní android verze a webová aplikace, kterou lze použít při
            mapování.
          </p>
          <div className="flex lg:flex-row md:flex-col">
            <Link
              href="/auth/register"
              className="bg-main-background-200 inline-flex gap-4 justify-center py-3 px-5 rounded-lg items-center hover:bg-main-background-300 focus:outline-none"
            >
              <UserPlus />
              <span>Registrovat se</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
