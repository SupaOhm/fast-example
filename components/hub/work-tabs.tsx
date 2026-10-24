"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { services, type ServiceId, type ServiceTile } from "@/lib/packages";
import { ServiceTiles } from "./service-tiles";

const noopSubscribe = () => () => {};

// The page is static, so ?service= (set by the compare page's back link) is read in the browser.
function readService(): ServiceId | null {
  const id = new URLSearchParams(window.location.search).get("service");
  return services.find((s) => s.id === id)?.id ?? null;
}

// Holds the selected service on the hub. The lineups are server-rendered and passed in as panels.
export function WorkTabs({
  tiles,
  panels,
  label,
  plansFrom,
}: {
  tiles: ServiceTile[];
  panels: ReactNode[];
  label: string;
  plansFrom: string;
}) {
  const fromUrl = useSyncExternalStore(noopSubscribe, readService, () => null);
  const [picked, setPicked] = useState<ServiceId | null>(null);
  const selected = picked ?? fromUrl ?? tiles[0].id;
  return (
    <>
      <ServiceTiles
        idPrefix="work"
        tiles={tiles}
        selected={selected}
        onSelect={setPicked}
        label={label}
        plansFrom={plansFrom}
      />
      {tiles.map((tile, i) => (
        <div
          key={tile.id}
          role="tabpanel"
          id={`panel-work-${tile.id}`}
          aria-labelledby={`tab-work-${tile.id}`}
          hidden={tile.id !== selected}
          className="mt-14"
        >
          {panels[i]}
        </div>
      ))}
    </>
  );
}
