import React from "react";
import DrawingMap from "./_sections/DrawingMap";

export default async function page() {
  return (
    <div className="max-w-container">
      <h1 className="text-3xl">Vytvořit novou dendrologickou žádost</h1>
      <DrawingMap />
    </div>
  );
}
