"use client";

import { Check, Clock, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ClinicError, deleteService, newId, STAFF, upsertService, type Service } from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import { useLang } from "@/components/demo/lang";
import { fill } from "@/lib/demos/format";
import { countText, errorText, ui } from "./copy";
import { formatTHB } from "@/lib/demos/format";
import type { Lang } from "@/lib/demos/lang";
import { useDemoStore } from "@/lib/use-demo-store";
import { fieldClass, focusRing } from "./admin-format";
import { CrudError, Saved } from "./crud-parts";

const DURATIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * 15); // 15–180

interface Draft {
  id?: string;
  name: string;
  durationMin: number;
  price: string;
}

type Errors = Partial<Record<"name" | "price", string>>;

const priceText = (price: number, lang: Lang) => (price === 0 ? ui.free[lang] : formatTHB(price));

export function ServicesCrud() {
  const lang = useLang();
  const [data, setData] = useDemoStore(clinicData);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [crudError, setCrudError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const formOpen = draft !== null;
  useEffect(() => {
    if (formOpen) nameRef.current?.focus();
  }, [formOpen]);

  const counts = new Map<string, number>();
  for (const b of data.bookings) counts.set(b.serviceId, (counts.get(b.serviceId) ?? 0) + 1);

  function openNew() {
    setCrudError(null);
    setSaved(null);
    setErrors({});
    setDraft({ name: "", durationMin: 60, price: "" });
  }

  function openEdit(s: Service) {
    setCrudError(null);
    setSaved(null);
    setErrors({});
    setDraft({ id: s.id, name: s.name[lang], durationMin: s.durationMin, price: String(s.price) });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    const price = draft.price.trim() === "" ? NaN : Number(draft.price);
    const next: Errors = {};
    if (!name) next.name = ui.svcNameRequired[lang];
    if (!Number.isInteger(price) || price < 0) next.price = ui.svcPriceError[lang];
    setErrors(next);
    if (next.name) return nameRef.current?.focus();
    if (next.price) return priceRef.current?.focus();

    const durationMin = Math.min(180, Math.max(15, Math.round(draft.durationMin / 15) * 15));
    // A new treatment gets the typed name in both languages; editing changes only the language being read.
    setData((d) => {
      const existing = draft.id ? d.services.find((x) => x.id === draft.id) : undefined;
      const names = existing ? { ...existing.name, [lang]: name } : { th: name, en: name };
      return upsertService(d, { id: draft.id ?? newId("s"), name: names, durationMin, price });
    });
    setSaved(fill(draft.id ? ui.svcSaved[lang] : ui.svcAdded[lang], { name }));
    setDraft(null);
  }

  function remove(s: Service) {
    setSaved(null);
    try {
      const next = deleteService(clinicData.get(), s.id);
      setData(next);
      setCrudError(null);
      if (draft?.id === s.id) setDraft(null);
    } catch (err) {
      setCrudError(`${s.name[lang]}: ${err instanceof ClinicError ? errorText[err.code][lang] : ui.deleteFailed[lang]}`);
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] leading-[1.25] font-medium text-(--wine) sm:text-[2.25rem]">{ui.svcTitle[lang]}</h1>
          <p className="mt-1.5 text-(--muted)">{fill(ui.svcCount[lang], { n: String(data.services.length) })}</p>
        </div>
        <button
          type="button"
          data-testid="service-add"
          onClick={openNew}
          className={`inline-flex items-center gap-2 rounded-full bg-(--wine) px-5 py-2.5 text-base text-white hover:bg-[#7d2a49] ${focusRing}`}
        >
          <Plus className="size-4" aria-hidden />
          {ui.svcAdd[lang]}
        </button>
      </header>

      {draft && (
        <form
          onSubmit={save}
          noValidate
          aria-labelledby="service-form-title"
          className="mt-5 rounded-2xl border border-(--accent)/50 bg-white p-5 shadow-[0_18px_40px_-28px_rgb(107_31_58/0.5)] sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="service-form-title" className="text-lg leading-[1.3] font-medium text-(--wine)">
              {draft.id ? ui.svcFormEdit[lang] : ui.svcFormNew[lang]}
            </h2>
            <button
              type="button"
              onClick={() => setDraft(null)}
              aria-label={ui.formClose[lang]}
              className={`grid size-9 place-items-center rounded-full text-(--muted) hover:bg-(--rose) ${focusRing}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <label htmlFor="service-name" className="text-[14px] font-medium">
                {ui.svcNameLabel[lang]}
              </label>
              <input
                ref={nameRef}
                id="service-name"
                data-testid="service-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                aria-required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "service-name-error" : undefined}
                placeholder={ui.svcNamePh[lang]}
                className={fieldClass}
              />
              {draft.id && <p className="mt-1.5 text-[14px] text-(--muted)">{ui.svcNameNote[lang]}</p>}
              {errors.name && (
                <p id="service-name-error" role="alert" className="mt-1.5 text-base text-(--error)">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="service-duration" className="text-[14px] font-medium">
                {ui.svcDurationLabel[lang]}
              </label>
              <select
                id="service-duration"
                data-testid="service-duration"
                value={draft.durationMin}
                onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })}
                className={fieldClass}
              >
                {DURATIONS.map((m) => (
                  <option key={m} value={m}>
                    {fill(ui.minutes[lang], { n: String(m) })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="service-price" className="text-[14px] font-medium">
                {ui.svcPriceLabel[lang]}
              </label>
              <input
                ref={priceRef}
                id="service-price"
                data-testid="service-price"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                aria-required
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "service-price-error" : undefined}
                placeholder="0"
                className={`${fieldClass} tabular-nums`}
              />
              {errors.price && (
                <p id="service-price-error" role="alert" className="mt-1.5 text-base text-(--error)">
                  {errors.price}
                </p>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              data-testid="service-save"
              className={`inline-flex items-center gap-2 rounded-full bg-(--wine) px-5 py-2.5 text-base text-white hover:bg-[#7d2a49] ${focusRing}`}
            >
              <Check className="size-4" aria-hidden />
              {ui.save[lang]}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className={`rounded-full px-4 py-2.5 text-base text-(--muted) hover:bg-(--rose) hover:text-(--ink) ${focusRing}`}
            >
              {ui.cancel[lang]}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {crudError && <CrudError message={crudError} hint={ui.svcDeleteHint[lang]} closeLabel={ui.toastDismiss[lang]} onClose={() => setCrudError(null)} />}
        {saved && <Saved message={saved} />}
      </div>

      <section aria-label={ui.svcListLabel[lang]} className="mt-3 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div
          aria-hidden
          className="hidden grid-cols-[minmax(0,2fr)_7rem_7rem_6rem_6rem] gap-4 border-b border-(--line) bg-(--paper) px-5 py-2.5 text-[14px] text-(--muted) md:grid"
        >
          <span>{ui.colService[lang]}</span>
          <span>{ui.colDuration[lang]}</span>
          <span className="text-right">{ui.colPrice[lang]}</span>
          <span className="text-right">{ui.colBookings[lang]}</span>
          <span />
        </div>
        {data.services.length === 0 ? (
          <p className="px-5 py-10 text-center text-base leading-[1.6] text-(--muted)">
            {ui.svcEmpty[lang]}
          </p>
        ) : (
          <ul>
            {data.services.map((s) => {
              const staff = STAFF.filter((st) => st.serviceIds.includes(s.id));
              const n = counts.get(s.id) ?? 0;
              return (
                <li
                  key={s.id}
                  data-testid="service-row"
                  data-bookings={n}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 border-t border-(--line) px-4 py-4 first:border-t-0 md:grid-cols-[minmax(0,2fr)_7rem_7rem_6rem_6rem] md:gap-4 md:px-5"
                >
                  <div className="min-w-0 leading-[1.35]">
                    <p className="text-base">{s.name[lang]}</p>
                    <p className="mt-0.5 truncate text-sm text-(--muted)">
                      {staff.length ? staff.map((st) => st.name[lang]).join(", ") : ui.svcNoStaff[lang]}
                    </p>
                  </div>
                  <p className="text-right text-lg text-(--wine) tabular-nums md:hidden">
                    {priceText(s.price, lang)}
                  </p>
                  <p className="hidden items-center gap-1.5 text-base md:flex">
                    <Clock className="size-4 text-(--muted)" aria-hidden />
                    {fill(ui.minutes[lang], { n: String(s.durationMin) })}
                  </p>
                  <p className="hidden text-right text-base tabular-nums md:block">{priceText(s.price, lang)}</p>
                  <p className="hidden text-right text-base tabular-nums md:block">{countText(n, lang)}</p>
                  <p className="text-[14px] text-(--muted) md:hidden">
                    {fill(ui.svcMobileMeta[lang], { duration: fill(ui.minutes[lang], { n: String(s.durationMin) }), count: countText(n, lang) })}
                  </p>
                  <span className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      aria-label={fill(ui.editName[lang], { name: s.name[lang] })}
                      className={`grid size-9 place-items-center rounded-full text-(--muted) hover:bg-(--rose) hover:text-(--ink) ${focusRing}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      data-testid="service-delete"
                      onClick={() => remove(s)}
                      aria-label={fill(ui.deleteName[lang], { name: s.name[lang] })}
                      className={`grid size-9 place-items-center rounded-full text-(--muted) hover:bg-[#fbe4e2] hover:text-(--error) ${focusRing}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
