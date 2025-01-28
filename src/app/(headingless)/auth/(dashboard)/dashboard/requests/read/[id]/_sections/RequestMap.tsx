"use client";
import React, { useEffect } from "react";
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
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function RequestMap({
  requestJSON,
}: {
  requestJSON: { geodata: any; id: string };
}) {
  const loading = React.useRef(false);
  const mapStateRef = React.useRef<any>(null);
  const sourceRef = React.useRef<any>(null);
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);
  const mapSelectedFeatureRef = React.useRef<any>(null);
  const [allFeaturesData, setAllFeaturesData] = React.useState<any>(null);
  const { toast } = useToast();

  async function transformToGeoJson({ data }) {
    const geojson = {
      type: "FeatureCollection",
      features: data.map((feature) => {
        const new_feature = {
          type: "Feature",
          geometry: {
            type: feature.geometry_type,
            coordinates: [
              feature.geometry_coordinates.x,
              feature.geometry_coordinates.y,
            ],
          },
          properties: {
            id: feature.id,
            NAZEV: feature.nazev,
            POCET: feature.pocet,
            images: feature.images || [],
          },
        };
        return new_feature;
      }),
    };

    return geojson;
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

  async function showSelected() {
    loading.current = true;
    try {
      mapStateRef.current
        .getLayers()
        .getArray()
        .filter((layer: any) => {
          const source = layer.getSource();
          return source instanceof VectorSource;
        })
        .map(async (layer: any) => {
          const source = layer.getSource();
          let purified;
          let object_id_container = [];
          const features = source.getFeatures().map(async (feature) => {
            if (feature.getGeometry().getType() !== "Polygon") {
              return feature;
            }
            if (allFeaturesData === null) {
              const geoData = await fetch(`/api/geojson/all`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              const stromy = await geoData.json();
              setAllFeaturesData(await transformToGeoJson(stromy));
              purified = await transformToGeoJson(stromy);
            } else {
              purified = allFeaturesData;
            }
            purified.features = purified.features.filter((point) => {
              if (object_id_container.includes(point.properties.id)) {
                return false;
              }
              const pointCoords = point.geometry.coordinates;
              const isPointInsidePolygonVar = isPointInsidePolygon(
                pointCoords,
                feature,
              );
              if (isPointInsidePolygonVar) {
                object_id_container.push(point.properties.id);
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
          const features_json = await Promise.all(features);
          const featureCollectionJson = new GeoJSON().writeFeatures(
            features_json,
          );
          return featureCollectionJson;
        });
      loading.current = false;
    } catch (e) {
      console.log(e);
      loading.current = false;
    }
  }

  useEffect(() => {
    if (mapStateRef.current === null) {
      const raster = new TileLayer({
        source: new OSM(),
      });
      const geojson = new GeoJSON();
      const transformedData = JSON.parse(requestJSON.geodata[0]);

      sourceRef.current = new VectorSource({
        features: geojson.readFeatures(transformedData),
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

      showSelected();
    }
  }, []);

  function selectedFeatureToNull() {
    setSelectedFeature(null);
    mapSelectedFeatureRef.current.getFeatures().clear();
  }

  async function addGeoImage(e) {
    loading.current = true;
    try {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = async () => {
        const imageJson = {
          image: reader.result,
          id: selectedFeature.values_.properties
            ? selectedFeature.values_.properties["id"]
            : selectedFeature.values_["id"],
        };

        const res_json = await fetch("/api/images", {
          method: "POST",
          body: JSON.stringify(imageJson),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await res_json.json();
        const data = res.data;

        if (!data.success && data.error) {
          toast({
            title: "Chyba při přidávání obrázku",
            description: "Prosím zkuste znovu",
            variant: "destructive",
            duration: 9000,
          });
          return;
        } else {
          console.log(data);
          mapStateRef.current
            .getLayers()
            .getArray()
            .filter((layer: any) => {
              const source = layer.getSource();
              return source instanceof VectorSource;
            })
            .map((layer: any) => {
              const source = layer.getSource();
              if (source instanceof VectorSource) {
                const featureExists = source.getFeatures();
                featureExists.forEach((feature: any) => {
                  if (
                    feature.getProperties().geometry.ol_uid ===
                    selectedFeature?.getProperties().geometry.ol_uid
                  ) {
                    feature.setProperties({
                      images: [...data.dendrologic_image[0].images],
                    });
                  }
                });

                if (featureExists) {
                  source.removeFeature(featureExists);
                }
                setSelectedFeature((prev) => {
                  if (prev.values_.properties) {
                    return {
                      ...prev,
                      values_: {
                        ...prev.values_,
                        properties: {
                          ...prev.values_.properties,
                          images: [...data.dendrologic_image[0].images],
                        },
                      },
                    };
                  } else {
                    return {
                      ...prev,
                      values_: {
                        ...prev.values_,
                        images: [...data.dendrologic_image[0].images],
                      },
                    };
                  }
                });
                return;
              }
            });
        }
      };
    } catch (e) {
      console.error(e);
    }
    loading.current = false;
  }

  return (
    <div className="py-8 flex flex-col gap-4">
      <div id="map" className="h-96 w-full" />
      <div className="flex gap-2 justify-between items-center">
        <Label htmlFor="circling">Změnit žádost</Label>
        <Link
          href={`/auth/dashboard/requests/edit/${requestJSON.id}`}
          className={`h-4 flex relative items-center justify-center w-4 p-4 rounded border hover:bg-main-background-300 bg-main-background-100`}
        >
          <Pen className="min-h-4 min-w-4 justify-self-center z-10" />
        </Link>
      </div>
      <Dialog onOpenChange={selectedFeatureToNull} open={!!selectedFeature}>
        <DialogContent>
          <DialogHeader className="flex flex-col gap-4">
            <DialogTitle>Informace o záznamu</DialogTitle>
            <DialogDescription>
              Základní informace o záznamu.
            </DialogDescription>
          </DialogHeader>
          {selectedFeature && !((selectedFeature.values_ && selectedFeature.values_.properties && selectedFeature.values_.properties["FROM_APP"]) ||
            (selectedFeature.values_ && selectedFeature.values_["FROM_APP"])) && (
          <Input onChange={addGeoImage} id="picture" type="file" />
            )
          }
          {selectedFeature &&
            selectedFeature.values_ &&
            ((selectedFeature.values_.properties &&
              selectedFeature.values_.properties["POCET"] &&
              selectedFeature.values_.properties["NAZEV"]) ||
              (selectedFeature.values_["NAZEV"] &&
                selectedFeature.values_["POCET"])) && (
              <div className="flex h-full flex-col p-4 gap-2 bg-main-background-200 rounded w-full overflow-x-auto">
                {((selectedFeature?.values_["images"] &&
                  selectedFeature?.values_["images"]?.length > 0) ||
                  (selectedFeature?.values_?.properties &&
                    selectedFeature?.values_?.properties["images"] &&
                    selectedFeature?.values_?.properties["images"]?.length >
                      0)) && (
                  <div className="flex items-center h-full w-full justify-center p-4 rounded">
                    <Image
                      className="object-cover w-full h-full rounded"
                      src={
                        "https://minio.stencukpage.com/dendrologic-bucket/" +
                        (selectedFeature?.values_["images"][0] ||
                          selectedFeature?.values_?.properties["images"][0])
                      }
                      alt={
                        selectedFeature.values_["NAZEV"] ||
                        selectedFeature.values_.properties["NAZEV"]
                      }
                      width={1000}
                      height={1000}
                    />
                  </div>
                )}
                <p className="flex h-full min-h-24 items-center justify-between gap-2">
                  <span>Název:</span>
                  <span>
                    {selectedFeature.values_.properties
                      ? selectedFeature.values_.properties["NAZEV"]
                      : selectedFeature.values_["NAZEV"]}
                  </span>
                </p>
                <p className="flex h-full min-h-24 items-center justify-between gap-2">
                  <span>Počet:</span>
                  <span>
                    {selectedFeature.values_.properties
                      ? selectedFeature.values_.properties["POCET"]
                      : selectedFeature.values_["POCET"]}
                  </span>
                </p>
              </div>
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
