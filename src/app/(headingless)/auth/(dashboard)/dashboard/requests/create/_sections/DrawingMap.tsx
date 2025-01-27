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
import { Check, Circle, CircleDot, Lock, LockOpen, Pen, Trees } from "lucide-react";
import Feature from "ol/Feature";
import { Drag } from "./Dragger";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import stromy from "@/assets/stromy-geo.json";
import { Point, Polygon } from "ol/geom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";


export const formSchema = z
  .object({
    NAZEV: z
      .string()
      .min(3, { message: "Musi být nejkratě 1 znak" })
      .max(255, { message: "Musi být měně než 255 znaků" }),
    POCET: z
      .coerce
      .number({ required_error: "Musi být číslo" })
      .max(100)
  });


export default function DrawingMap() {
  const mapStateRef = React.useRef<any>(null);
  const [circling, setCircling] = React.useState<boolean>(false);
  const drawRef = React.useRef<any>(null);
  const sourceRef = React.useRef<any>(null);
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);
  const mapSelectedFeatureRef = React.useRef<any>(null);
  const router = useRouter();
  const [geoRequestName, setGeoRequestName] = useState<string>("");
  const dragRef = React.useRef<any>(null);
  const [addNewPoint, setAddNewPoint] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { NAZEV: "", POCET: 1 },
  });


  useEffect(() => {
    function addInteraction() {
      drawRef.current = new Draw({
        source: sourceRef.current,
        type: "Polygon",
        freehand: true,
      });
      mapStateRef.current?.addInteraction(drawRef.current);
    }

    function addDragInteraction() {
      dragRef.current = new Drag();
      mapStateRef.current?.addInteraction(dragRef.current);
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

      addDragInteraction();

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

          if (featureExists) {
            source.removeFeature(featureExists);
          }
          selectedFeatureToNull();
          return;
        }
      });
  }

  function isPointInsidePolygon(pointCoords, polygon) {
    const point = new Point(pointCoords);
    const geometry = polygon.getGeometry();
    if (geometry.getType() === "Polygon") {
      const transformedCoords = transform(
        point.getCoordinates(),
        "EPSG:4326",
        "EPSG:3857",
      );
      return geometry.intersectsCoordinate(transformedCoords);
    }
    return false;
  }

  function showSelected() {
    console.log("called 0");
    mapStateRef.current
      .getLayers()
      .getArray()
      .filter((layer: any) => {
        const source = layer.getSource();
        return source instanceof VectorSource;
      })
      .map((layer: any) => {
        const source = layer.getSource();
        let purified;
        let object_id_container = [];
        const features = source.getFeatures().map((feature) => {
          if (feature.getGeometry().getType() !== "Polygon") {
            return feature;
          }
          purified = JSON.parse(JSON.stringify(stromy));
          purified.features = purified.features.filter((point) => {
            if (object_id_container.includes(point.properties.OBJECTID)) {
              return false;
            }
            const pointCoords = point.geometry.coordinates;
            console.log(point);
            const isPointInsidePolygonVar = isPointInsidePolygon(
              pointCoords,
              feature,
            );
            if (isPointInsidePolygonVar) {
              object_id_container.push(point.properties.OBJECTID);
            }
            return isPointInsidePolygonVar;
          });

          source.addFeatures(
            new GeoJSON().readFeatures(purified, {
              featureProjection: "EPSG:3857",
            }),
          );

          const circle = feature.getGeometry();
          return new Feature({
            geometry: circle,
            name: "Polygon",
          });
        });
        const featureCollectionJson = new GeoJSON().writeFeatures(features);
        return featureCollectionJson;
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
        const features = source
          .getFeatures()
          .filter((feature) => feature.getGeometry().getType() === "Polygon")
          .map((feature) => {
            const circle = feature.getGeometry();
            return new Feature({
              geometry: circle,
              name: "Polygon",
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
      router.push(`/auth/dashboard/requests/read/${data.geoRequest[0].id}`);
    }
  }

  const [isDragActive, setIsDragActive] = useState(false);

  function lockDrag() {
    dragRef.current?.setActive(false);
    setIsDragActive(false);
  }

  function unlockDrag() {
    dragRef.current?.setActive(true);
    setIsDragActive(true);
  }

  // Function which will geojson point with properties this will be saved into db
  function addPoint(values: z.infer<typeof formSchema>) {
    const geoJsonPoints = [];

    for (let i = 0; i < values.POCET; i++) {
      geoJsonPoints.push(new Feature({
        geometry: new Point(
          transform(
          [15.243629268374999 + (i / 10), 49.272716766783859 + (i / 10)],
            "EPSG:4326",
            "EPSG:3857",
          )
        ),
        properties: {
          NAZEV: values.NAZEV,
          POCET: values.POCET,
          FROM_APP: true
        },
      }));
    }

    const source = mapStateRef.current
      .getLayers()
      .getArray()
      .filter((layer: any) => {
        const source = layer.getSource();
        return source instanceof VectorSource;
      })
      .map((layer: any) => {
        const source = layer.getSource();
        geoJsonPoints.forEach((geoJsonPoint) => {
          source.addFeature(geoJsonPoint);
        })
        return source;
      });
  }

  console.log(selectedFeature);

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
        <Label htmlFor="circling">Ukázat vybrané</Label>
        <Button
          className={`h-4 w-4 p-4 rounded border`}
          variant="outline"
          onClick={showSelected}
        >
          <CircleDot />
        </Button>
      </div>
      <div className="flex gap-2 justify-between items-center">
        <Label htmlFor="circling">Přidat záznam</Label>
        <Button
          className={`h-4 w-4 p-4 rounded border`}
          variant="outline"
          onClick={() => setAddNewPoint(true)}
        >
          <Trees />
        </Button>
      </div>
      <div className="flex gap-2 justify-between items-center">
        <Label htmlFor="circling">{isDragActive ? "Uzamknout pohyb" : "Odemknout pohyb"}</Label>
        <Button
          className={`h-4 w-4 p-4 rounded border`}
          variant="outline"
    onClick={() => isDragActive ? lockDrag() : unlockDrag()}
        >
    {isDragActive ? <Lock /> : <LockOpen />}
        </Button>
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
            <DialogTitle>Chcete smazat vybraný záznam?</DialogTitle>
            <DialogDescription>
              Akci nelze navrátit, rozhodněte se zda chcete smazat vybraný kruh.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col p-4 gap-2 bg-main-background-200 rounded w-full overflow-x-auto">
            <p className="flex items-center justify-between gap-2"><span>Název:</span><span>{selectedFeature?.values_.properties["NAZEV"]}</span></p>
            <p className="flex items-center justify-between gap-2">
              <span>Počet:</span>
              <span>{selectedFeature?.values_.properties["POCET"]}</span></p>
          </div>
          <Button onClick={deleteSelectedFeature} variant="destructive">
            Smazat záznam
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={() => setAddNewPoint(false)} open={!!addNewPoint}>
        <DialogContent>
          <DialogHeader className="flex flex-col gap-4">
            <DialogTitle>Přidat nový záznam</DialogTitle>
            <DialogDescription>
              Vyplňte základní informace o záznamu
            </DialogDescription>
          </DialogHeader>
              <Form {...form}>
      <form
        onSubmit={form.handleSubmit(addPoint)}
        className="max-w-[500px] w-full flex flex-col items-center p-6 space-y-8"
      >
          <FormField
      control={form.control}
      name={"NAZEV"}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Název záznamu (3-255 písmen)</FormLabel>
          <FormControl>
             <Input
                type="text"
                className="bg-main-background-100 shadow border border-main-accent-100"
                {...field}
              />
          </FormControl>
        </FormItem>
      )}
    />
          <FormField
      control={form.control}
      name={"POCET"}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Počet záznamů (max 100)</FormLabel>
          <FormControl>
             <Input
                type="number"
                className="bg-main-background-100 shadow border border-main-accent-100"
                {...field}
              />
          </FormControl>
        </FormItem>
      )}
    />

         
          <Button type="submit" variant="default">
            Přidat záznam
          </Button>
        </form>
      </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
