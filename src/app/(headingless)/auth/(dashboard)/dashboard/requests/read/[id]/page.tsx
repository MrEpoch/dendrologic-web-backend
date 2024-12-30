import { cookies } from "next/headers";
import React from "react";
import RequestMap from "./_sections/RequestMap";

export default async function Page({ params }) {
  const geoRequestData = await fetch(
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3752"
      : "https://dendrologic-web.stencukpage.com") +
      `/api/geojson/requests/${params.id}`,
    {
      method: "GET",
      headers: {
        Cookie: cookies().toString(),
        "Content-Type": "application/json",
      },
    },
  );

  const geoRequestDataJson = await geoRequestData.json();
  console.log("data", geoRequestDataJson.georequest[0]);

  return (
    <div className="max-w-container">
      <RequestMap requestJSON={geoRequestDataJson.georequest[0]} />
    </div>
  );
}
