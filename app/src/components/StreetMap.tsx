import { useEffect, useRef, useState } from "react";
import type { Map as MlMap } from "maplibre-gl";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { circlePolygon, ringBounds, type LngLat } from "../lib/geo";
import { COUNT_MS } from "../story/motion";
import { RingMap } from "./RingMap";
import "./StreetMap.css";

// Free vector tiles, no key. Attribution is shown on the map.
const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";
const PADDING = 28;

interface StreetMapProps {
  center: LngLat;
  rings: readonly number[];
  title: string;
  /** Start zoomed on the block, then pull out to the rings (address card). */
  startClose?: boolean;
  points?: { restaurants: readonly LngLat[]; cultural: readonly LngLat[] };
}

function hasWebGL(): boolean {
  return typeof window !== "undefined" && typeof window.WebGL2RenderingContext !== "undefined";
}

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

function ringsGeoJSON(center: LngLat, rings: readonly number[]) {
  return {
    type: "FeatureCollection" as const,
    features: rings.map((miles) => ({
      type: "Feature" as const,
      properties: { label: `${miles} mi` },
      geometry: { type: "Polygon" as const, coordinates: [circlePolygon(center, miles)] },
    })),
  };
}

function pointsGeoJSON(points: NonNullable<StreetMapProps["points"]>) {
  const feat = (kind: string) => (c: LngLat) => ({
    type: "Feature" as const,
    properties: { kind },
    geometry: { type: "Point" as const, coordinates: c },
  });
  return {
    type: "FeatureCollection" as const,
    features: [...points.restaurants.map(feat("restaurant")), ...points.cultural.map(feat("cultural"))],
  };
}

/**
 * Street basemap (MapLibre + OpenFreeMap) with rings, site pin, and optional dots.
 * Non-interactive so card swipes still work. Falls back to the SVG ring diagram
 * when WebGL or the tiles are unavailable, and while the map loads.
 */
export function StreetMap({ center, rings, title, startClose = false, points }: StreetMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!hasWebGL());

  useEffect(() => {
    if (failed || !box.current) return;
    let map: MlMap | null = null;
    let cancelled = false;
    // Card entrance animation and breakpoints change the box size after creation.
    const observer = new ResizeObserver(() => map?.resize());
    observer.observe(box.current);
    const outer = ringBounds(center, Math.max(...rings));

    import("maplibre-gl")
      .then(({ Map: MapCtor }) => {
        if (cancelled || !box.current) return;
        const m = new MapCtor({
          container: box.current,
          style: STYLE_URL,
          bounds: startClose ? ringBounds(center, 0.08) : outer,
          fitBoundsOptions: { padding: PADDING },
          interactive: false,
          attributionControl: { compact: true },
        });
        map = m;
        m.on("error", (e) => {
          if (!m.loaded()) setFailed(Boolean(e));
        });
        m.on("load", () => {
          if (!map) return;
          map.addSource("rings", { type: "geojson", data: ringsGeoJSON(center, rings) });
          map.addLayer({ id: "rings-line", type: "line", source: "rings",
            paint: { "line-color": "#ffffff", "line-opacity": 0.7, "line-width": 1.5, "line-dasharray": [2, 2] } });
          map.addLayer({ id: "rings-label", type: "symbol", source: "rings",
            layout: { "symbol-placement": "line", "text-field": ["get", "label"], "text-size": 12, "text-font": ["Noto Sans Bold"] },
            paint: { "text-color": "#ffffff", "text-halo-color": "#000000", "text-halo-width": 1.5 } });
          if (points) {
            map.addSource("pts", { type: "geojson", data: pointsGeoJSON(points) });
            map.addLayer({ id: "pts", type: "circle", source: "pts",
              paint: {
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 1.6, 16, 4],
                "circle-color": ["match", ["get", "kind"], "cultural", "#2fd17a", "#a1a1aa"],
                "circle-opacity": ["match", ["get", "kind"], "cultural", 1, 0.55],
              } });
          }
          map.addSource("site", { type: "geojson", data: { type: "Point", coordinates: center } });
          map.addLayer({ id: "site-halo", type: "circle", source: "site", paint: { "circle-radius": 12, "circle-color": "#068e4a", "circle-opacity": 0.35 } });
          map.addLayer({ id: "site-dot", type: "circle", source: "site",
            paint: { "circle-radius": 6, "circle-color": "#068e4a", "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 } });
          // Start the attribution collapsed; the (i) button still opens it.
          box.current?.querySelector(".maplibregl-compact-show")?.classList.remove("maplibregl-compact-show");
          map.resize();
          setReady(true);
          if (startClose) {
            map.fitBounds(ringBounds(center, Math.min(...rings)), { padding: PADDING, duration: reduce ? 0 : COUNT_MS });
          }
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [center, rings, startClose, points, reduce, failed]);

  const n = points ? `${plural(points.restaurants.length, "restaurant", "restaurants")} and ${plural(points.cultural.length, "cultural organization", "cultural organizations")}` : null;

  return (
    <figure className="streetmap" data-ready={ready || undefined}>
      {!failed && <div ref={box} className="streetmap-canvas" aria-hidden="true" />}
      {!ready && (
        <div className="streetmap-fallback">
          <RingMap rings={rings} title={title} />
        </div>
      )}
      {ready && <span className="sr-only" role="img" aria-label={title} />}
      {n && (
        <figcaption className="streetmap-legend">
          <span className="dot dot-rest" aria-hidden="true" /> Restaurants
          <span className="dot dot-cult" aria-hidden="true" /> Cultural organizations
          <span className="sr-only">Within {Math.max(...rings)} miles: {n}.</span>
        </figcaption>
      )}
    </figure>
  );
}
