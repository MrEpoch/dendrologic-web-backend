import React from "react";
import { SortableListRequests } from "./_sections/SortableListRequests";
import { cookies } from "next/headers";

export default async function Page() {
  const geoRequestsData = await fetch(
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3752"
      : "https://dendrologic-web.stencukpage.com") +
      `/api/geojson/requests?limit=10&offset=0`,
    {
      method: "GET",
      headers: {
        Cookie: cookies().toString(),
        "Content-Type": "application/json",
      },
    },
  );

  const jsonData = await geoRequestsData.json();

  console.log(jsonData);

  return (
    <div className="max-w-container">
      <h1 className="text-3xl">Hlavní panel</h1>
      <div className="py-8">
        <SortableListRequests georequests={jsonData.data} />
      </div>
    </div>
  );
}
