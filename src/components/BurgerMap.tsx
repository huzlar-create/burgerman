"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
type MapLibreMap = maplibregl.Map;
import "maplibre-gl/dist/maplibre-gl.css";
import { formatScore } from "@/lib/format";

export type MapPin = {
  slug: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  score: number | null;
};

// Kortfarver fra stilguiden
const colors = {
  land: "#FBEEC4",
  landuse: "#F8E6B5",
  building: "#F3DDA3",
  water: "#8FC5D9",
  park: "#B9D67A",
  mainRoad: "#FFFFFF",
  sideRoad: "#F3D98A",
  casing: "#E2C27A",
};

// Farver OpenFreeMap-stilen om til Pølsevognen-paletten
function recolor(map: MapLibreMap) {
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id;
    const src = "source-layer" in layer ? layer["source-layer"] : undefined;
    try {
      if (layer.type === "background") {
        map.setPaintProperty(id, "background-color", colors.land);
      } else if (layer.type === "fill" && src === "water") {
        map.setPaintProperty(id, "fill-color", colors.water);
      } else if (layer.type === "line" && src === "waterway") {
        map.setPaintProperty(id, "line-color", colors.water);
      } else if (layer.type === "fill" && (src === "park" || /park|grass|wood|forest|meadow/.test(id))) {
        map.setPaintProperty(id, "fill-color", colors.park);
      } else if (layer.type === "fill" && (src === "landuse" || src === "landcover")) {
        map.setPaintProperty(id, "fill-color", colors.landuse);
      } else if (layer.type === "fill" && src === "building") {
        map.setPaintProperty(id, "fill-color", colors.building);
      } else if (layer.type === "line" && src === "transportation" && !/rail|path|ferry|aerialway/.test(id)) {
        const color = /casing/.test(id)
          ? colors.casing
          : /motorway|trunk|primary/.test(id)
            ? colors.mainRoad
            : colors.sideRoad;
        map.setPaintProperty(id, "line-color", color);
      }
    } catch {
      // Lag der ikke kan omfarves, beholder deres standardfarve
    }
  }
}

function pinElement(pin: MapPin, best: boolean) {
  const el = document.createElement("div");
  el.className = "burger-pin";
  el.innerHTML = `
    <span class="burger-pin__score">${formatScore(pin.score)} ★</span>
    <span class="burger-pin__drop" style="background:${best ? "var(--ketchup)" : "var(--sennep)"}"></span>`;
  el.setAttribute("aria-label", `${pin.name}, ${formatScore(pin.score)} ud af 10`);
  return el;
}

export default function BurgerMap({ pins }: { pins: MapPin[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [10.4, 56.1],
      zoom: 5.8,
      attributionControl: { compact: true },
      cooperativeGestures: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("style.load", () => recolor(map));

    const bestScore = Math.max(...pins.map((p) => p.score ?? 0));
    for (const pin of pins) {
      const popup = new maplibregl.Popup({ offset: 30, closeButton: false }).setHTML(
        `<strong>${pin.name}</strong><br>${pin.city} · <b>${formatScore(pin.score)}</b>`,
      );
      new maplibregl.Marker({ element: pinElement(pin, pin.score === bestScore), anchor: "bottom" })
        .setLngLat([pin.lng, pin.lat])
        .setPopup(popup)
        .addTo(map);
    }

    if (pins.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      pins.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 0 });
    } else if (pins.length === 1) {
      map.jumpTo({ center: [pins[0].lng, pins[0].lat], zoom: 12 });
    }

    return () => map.remove();
  }, [pins]);

  return <div ref={ref} className="h-[420px] w-full sm:h-[520px]" />;
}
