"use client";
import React, { useEffect } from "react";
import Draw from "ol/interaction/Draw.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import Select from "ol/interaction/Select.js";
import "ol/ol.css";
import { click } from "ol/events/condition";
import GeoJSON from "ol/format/GeoJSON.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { transform } from "ol/proj";
import { Check, Pen } from "lucide-react";
import Link from "next/link";

export default function RequestMap({ requestJSON }: { requestJSON: { geodata: any, id: string } }) {
  const mapStateRef = React.useRef<any>(null);
  const sourceRef = React.useRef<any>(null);
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);
  const mapSelectedFeatureRef = React.useRef<any>(null);

  useEffect(() => {
    if (mapStateRef.current === null) {
      const raster = new TileLayer({
        source: new OSM(),
      });

      console.log(requestJSON);

      const geojson = new GeoJSON();
      sourceRef.current = new VectorSource({
        features: geojson.readFeatures(
          requestJSON.geodata,
          {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          }
        ),
      });


      const vector = new VectorLayer({
        source: sourceRef.current,
      });

      mapStateRef.current = new Map({
        layers: [raster, vector],
        target: "map",
        view: new View({
          center: transform(
            [15.243629268374999, 49.272716766783859],
            "EPSG:4326",
            "EPSG:3857",
          ),
          zoom: 7,
        }),
      });

      mapSelectedFeatureRef.current = new Select({
        condition: click,
      });

      mapStateRef.current.addInteraction(mapSelectedFeatureRef.current);
      mapSelectedFeatureRef.current.on("select", function (e) {
        e.preventDefault();
        setSelectedFeature(e?.selected[0]);
      });
    } 
  }, []);

  function selectedFeatureToNull() {
    setSelectedFeature(null);
    mapSelectedFeatureRef.current.getFeatures().clear();
  }

  function deleteSelectedFeature() {
    mapStateRef.current
      .getLayers()
      .getArray()
      .forEach((layer: any) => {
        const source = layer.getSource();
        if (source instanceof VectorSource) {
          const featureExists = source.getFeatures();
          source.removeFeature(
            featureExists.find((f: any) => {
              return (
                f.getProperties().geometry.ol_uid ===
                selectedFeature?.getProperties().geometry.ol_uid
              );
            }),
          );

          /*
        if (featureExists) {
          source.removeFeature(featureExists);
        }
          */
          selectedFeatureToNull();
          return;
        }
      });
  }

  async function saveRequest() {
    const geoJSONdata = mapStateRef.current
      .getLayers()
      .getArray()
      .map((layer: any) => {
        const source = layer.getSource();
        if (source instanceof VectorSource) {
          const features = source.getFeatures();
          const geojsonFormat = new GeoJSON();
          features.forEach((feature: any) => {
            geojsonFormat.writeFeatureObject(feature);
          });
          return JSON.stringify(geojsonFormat);
        }
      });

    const res = await fetch("/api/geojson/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        georequest: geoJSONdata[1],
      }),
    });

    const data = await res.json();

    console.log(data);

    console.log(geoJSONdata[1]);
  }

  return (
    <div className="py-8 flex flex-col gap-4">
      <div id="map" className="h-96 w-full" />
      <div className="flex gap-2 justify-between items-center">
        <Label htmlFor="circling">Vybrat oblast</Label>
        <Link
    href={`/auth/dashboard/requests/edit/${requestJSON.id}`}
    className={`h-4 w-4 p-4 rounded border hover:bg-main-background-300 bg-main-background-100`}
        >
          <Pen />
        </Link>
      </div>
      <div className="flex gap-2 justify-between items-center">
        <Label htmlFor="circling">Vytvořit žádost</Label>
        <Button
          className={`h-4 w-4 p-4 rounded border`}
          variant="outline"
          onClick={saveRequest}
        >
          <Check />
        </Button>
      </div>
      <Dialog onOpenChange={selectedFeatureToNull} open={!!selectedFeature}>
        <DialogContent>
          <DialogHeader className="flex flex-col gap-4">
            <DialogTitle>Chcete smazat vybraný kruh?</DialogTitle>
            <DialogDescription>
              Akce nelze navrátit, rozhodněte se zda chcete smazat vybraný kruh.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={deleteSelectedFeature} variant="destructive">
            Smazat kruh
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
