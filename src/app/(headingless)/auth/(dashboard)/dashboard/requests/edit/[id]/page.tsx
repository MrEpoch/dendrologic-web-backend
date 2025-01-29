import React from "react";
import DrawingMap from "./_sections/DrawingMap";
import { cookies } from "next/headers";

export default async function page({ params }: { params: { id: string } }) {
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

  return (
    <div className="max-w-container">
      <h1 className="text-3xl">Upravit žádost #{geoRequestDataJson.georequest[0].requestName}</h1>
      <DrawingMap requestInfo={geoRequestDataJson.georequest[0]} />
    </div>
  );
}
