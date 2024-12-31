"use client";
import React, { useEffect, useState } from "react";
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
import Feature from "ol/Feature";
import { Drag } from "./Dragger";
import { defaults as defaultInteractions, Modify } from "ol/interaction";
import { useRouter } from "next/navigation";
import { fromCircle } from "ol/geom/Polygon";
import { Input } from "@/components/ui/input";

export default function DrawingMap() {
  const mapStateRef = React.useRef<any>(null);
  const [circling, setCircling] = React.useState<boolean>(false);
  const drawRef = React.useRef<any>(null);
  const sourceRef = React.useRef<any>(null);
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);
  const mapSelectedFeatureRef = React.useRef<any>(null);
  const router = useRouter();
  const [geoRequestName, setGeoRequestName] = useState<string>("");

  useEffect(() => {
    function addInteraction() {
      drawRef.current = new Draw({
        source: sourceRef.current,
        type: "Circle",
        freehand: true,
      });
      mapStateRef.current?.addInteraction(drawRef.current);
    }

    /**
     * Handle change event.
     */

    if (mapStateRef.current === null) {
      const raster = new TileLayer({
        source: new OSM(),
      });

      sourceRef.current = new VectorSource({ wrapX: false });

      const vector = new VectorLayer({
        source: sourceRef.current,
      });

      mapStateRef.current = new Map({
        interactions: defaultInteractions().extend([new Drag()]),
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

      mapStateRef.current.addInteraction(
        new Modify({ source: sourceRef.current }),
      );

      mapSelectedFeatureRef.current = new Select({
        condition: click,
      });

      mapStateRef.current.addInteraction(mapSelectedFeatureRef.current);
      mapSelectedFeatureRef.current.on("select", function (e) {
        e.preventDefault();
        if (e.selected instanceof VectorSource) {
          setSelectedFeature(null);
          return;
        }
        setSelectedFeature(e?.selected[0]);
      });
    } else if (circling === true) {
      addInteraction();
    } else if (circling === false) {
      mapStateRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
  }, [circling]);

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
      .filter((layer: any) => {
        const source = layer.getSource();
        return source instanceof VectorSource;
      })
      .map((layer: any) => {
        const source = layer.getSource();
        const features = source.getFeatures().map((feature) => {
          const circle = feature.getGeometry();
          return new Feature({
            geometry: fromCircle(circle, 16),
            name: "Circle",
          });
        });
        const featureCollectionJson = new GeoJSON().writeFeatures(features);
        return featureCollectionJson;
      })
      .filter(Boolean);

    const res = await fetch("/api/geojson/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        georequest: JSON.stringify(geoJSONdata),
        georequest_name: geoRequestName,
      }),
    });

    const data = await res.json();
    console.log(data);
    if (data.success) {
      router.push(`/auth/dashboard/requests/read/${data.geoRequest.id}`);
    }
  }

  return (
    <div className="py-8 flex flex-col gap-4">
      <div id="map" className="h-96 w-full" />
      <div className="flex gap-2 justify-between items-center">
        <Label htmlFor="circling">Vybrat oblast</Label>
        <Button
          className={`h-4 w-4 p-4 rounded border ${circling ? "bg-main-background-300" : "bg-main-background-100"}`}
          variant="outline"
          onClick={() => setCircling((prev) => !prev)}
        >
          <Pen />
        </Button>
      </div>
      <div className="flex gap-2 justify-between items-center">
        <Label htmlFor="circling">Název žádosti* (3-255)</Label>
        <Input onChange={(e) => setGeoRequestName(e.target.value)} />
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
