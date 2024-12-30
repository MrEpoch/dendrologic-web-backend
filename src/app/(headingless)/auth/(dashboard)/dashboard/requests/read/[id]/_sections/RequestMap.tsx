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
import { Circle, Polygon } from "ol/geom";
import { fromCircle } from "ol/geom/Polygon";

export default function RequestMap({
  requestJSON,
}: {
  requestJSON: { geodata: any; id: string };
}) {
  const mapStateRef = React.useRef<any>(null);
  const sourceRef = React.useRef<any>(null);
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);
  const mapSelectedFeatureRef = React.useRef<any>(null);

  useEffect(() => {
    if (mapStateRef.current === null) {
      const raster = new TileLayer({
        source: new OSM(),
      });

      console.log(requestJSON.geodata[0].features);

      const geojson = new GeoJSON();
      const transformedData = requestJSON.geodata[0].features
        .map((feature: any) => {
          const flatCoordinates = feature.properties.geometry.flatCoordinates;

          if (flatCoordinates.length === 2) {
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: flatCoordinates,
              },
              properties: {},
            };
          } else if (flatCoordinates.length > 2) {
            const coordinates = [];

            for (let i = 0; i < flatCoordinates.length; i += 2) {
              coordinates.push([flatCoordinates[i], flatCoordinates[i + 1]]);
            }

            const centerX = (flatCoordinates[0] + flatCoordinates[2]) / 2;
            const centerY = (flatCoordinates[1] + flatCoordinates[3]) / 2;

            const radius =
              Math.sqrt(
                Math.pow(flatCoordinates[2] - flatCoordinates[0], 2) +
                  Math.pow(flatCoordinates[3] - flatCoordinates[1], 2),
              ) / 2;

            const circle = new Circle([centerX, centerY], radius);
            const polygon = fromCircle(circle, 28);

            return {
              type: "Feature",
              geometry: JSON.parse(
                new GeoJSON().writeGeometry(polygon, {
                  dataProjection: "EPSG:4326",
                  featureProjection: "EPSG:3857",
                }),
              ),
              properties: {},
            };
          }

          return null;
        })
        .filter(Boolean);

      const transformedGeoJson = {
        type: "FeatureCollection",
        features: transformedData,
      };

      console.log(transformedGeoJson);

      sourceRef.current = new VectorSource({
        features: geojson.readFeatures(transformedGeoJson, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }),
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
        <Button className={`h-4 w-4 p-4 rounded border`} variant="outline">
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
