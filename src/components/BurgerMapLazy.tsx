"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./BurgerMap";

// Kortet hentes kun i browseren, så resten af siden loader lynhurtigt
const BurgerMap = dynamic(() => import("./BurgerMap"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse bg-[#FBEEC4] sm:h-[520px]" />,
});

export function BurgerMapLazy({ pins }: { pins: MapPin[] }) {
  return <BurgerMap pins={pins} />;
}
