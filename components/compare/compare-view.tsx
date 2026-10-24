"use client";

import Link from "next/link";
import { Fragment, useState, useSyncExternalStore } from "react";
import { ServiceTiles } from "@/components/hub/service-tiles";
import { SpecCell } from "@/components/hub/spec-cell";
import type { Locale } from "@/lib/i18n/config";
import {
  formatTHB,
  getService,
  packagesByService,
  services,
  type ServiceId,
  type ServiceTile,
  type Tier,
} from "@/lib/packages";

interface CompareLabels {
  services: string;
  plansFrom: string;
  tryDemo: string;
  included: string;
  notIncluded: string;
  tiers: Record<Tier, string>;
}

const noopSubscribe = () => () => {};

// The page is static, so ?service= is read in the browser (server snapshot: websites).
function readService(): ServiceId {
  const id = new URLSearchParams(window.location.search).get("service");
  return services.find((s) => s.id === id)?.id ?? "web";
}

export function CompareView({ locale, tiles, labels }: { locale: Locale; tiles: ServiceTile[]; labels: CompareLabels }) {
  const fromUrl = useSyncExternalStore(noopSubscribe, readService, () => "web" as ServiceId);
  const [picked, setPicked] = useState<ServiceId | null>(null);
  const selected = picked ?? fromUrl;
  const service = getService(selected);
  const plans = packagesByService(selected);

  function select(id: ServiceId) {
    setPicked(id);
    const url = new URL(window.location.href);
    url.searchParams.set("service", id);
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <ServiceTiles
        idPrefix="compare"
        panelId="panel-compare"
        compact
        tiles={tiles}
        selected={selected}
        onSelect={select}
        label={labels.services}
        plansFrom={labels.plansFrom}
      />
      <div
        role="tabpanel"
        id="panel-compare"
        aria-labelledby={`tab-compare-${selected}`}
        className={`acc-${service.accent} mt-10`}
      >
        <div className="grid grid-cols-3 gap-x-2 sm:gap-x-7">
          <div
            data-testid="compare-head"
            className="sticky top-16 z-20 col-span-3 grid grid-cols-subgrid border-b border-rule bg-forest py-4"
          >
            {plans.map((p) => (
              <div key={p.id} className="text-center">
                <p className="font-display text-lg leading-none font-extrabold tracking-[-0.03em] sm:text-2xl">
                  {labels.tiers[p.tier]}
                </p>
                <p className="mt-1 font-display text-sm font-extrabold text-(--acc) sm:text-lg">{formatTHB(p.priceTHB)}</p>
                <Link
                  href={p.demoPath}
                  prefetch={false}
                  className="mt-2.5 inline-block rounded-full bg-(--acc) px-3 py-1.5 text-xs font-bold whitespace-nowrap text-forest transition hover:bg-cream sm:text-[13px]"
                >
                  {labels.tryDemo}
                  <span className="sr-only"> {labels.tiers[p.tier]}</span>
                </Link>
              </div>
            ))}
          </div>
          {service.rows.map((row) => (
            <Fragment key={row.key}>
              {row.group && (
                <h2 className="col-span-3 mt-9 border-b border-rule pb-2.5 font-display text-xl font-extrabold tracking-[-0.03em]">
                  {row.group[locale]}
                </h2>
              )}
              {plans.map((p) => (
                <div key={p.id} data-testid={`cell-${row.key}-${p.id}`} className="px-1 pt-4 text-center">
                  <span className="sr-only">{labels.tiers[p.tier]}: </span>
                  <SpecCell
                    row={row}
                    value={p.values[row.key]}
                    locale={locale}
                    yes={labels.included}
                    no={labels.notIncluded}
                  />
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
