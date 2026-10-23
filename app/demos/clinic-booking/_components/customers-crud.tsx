"use client";

import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { addDays, toISODate } from "@/lib/dates";
import {
  ClinicError,
  deleteCustomer,
  displayStatus,
  GUEST_ID,
  newId,
  upsertCustomer,
  type Customer,
} from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import { useLang } from "@/components/demo/lang";
import { fill, formatDate } from "@/lib/demos/format";
import { errorText, ui } from "./copy";
import { useDemoStore } from "@/lib/use-demo-store";
import { isThaiPhone, normalizePhone } from "@/lib/validation";
import { fieldClass, focusRing, formatPhone, monogramOf } from "./admin-format";
import { CrudError, Saved } from "./crud-parts";

interface Draft {
  id?: string;
  name: string;
  phone: string;
  note: string;
}

type Errors = Partial<Record<"name" | "phone", string>>;

export function CustomersCrud() {
  const lang = useLang();
  const [data, setData] = useDemoStore(clinicData);
  // Rendered only after hydration (RequireSession), so these are the browser's dates.
  const [[today, tomorrow]] = useState(() => [toISODate(new Date()), toISODate(addDays(new Date(), 1))]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [crudError, setCrudError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const formOpen = draft !== null;
  useEffect(() => {
    if (formOpen) nameRef.current?.focus();
  }, [formOpen]);

  // Today's bookings use the status the queue shows (moved on by the clock), so one already under way is not "next".
  const now = new Date();
  const duration = (id: string) => data.services.find((s) => s.id === id)?.durationMin ?? 30;
  const stats = new Map<string, { count: number; next?: string; last?: string }>();
  for (const b of data.bookings) {
    const s = stats.get(b.customerId) ?? { count: 0 };
    s.count++;
    const at = `${b.date} ${b.time}`;
    const status = b.date === today ? displayStatus(b, duration(b.serviceId), now) : b.status;
    if (b.date >= today && status === "booked" && (!s.next || at < s.next)) s.next = at;
    if (b.status === "done" && (!s.last || b.date > s.last)) s.last = b.date;
    stats.set(b.customerId, s);
  }

  const q = query.trim().toLowerCase();
  const qDigits = normalizePhone(q).replace(/\D/g, "");
  const rows = [...data.customers]
    .sort((a, b) => a.name.localeCompare(b.name, lang))
    .filter((c) => !q || c.name.toLowerCase().includes(q) || (qDigits.length > 0 && c.phone.includes(qDigits)));

  const when = (at: string) => {
    const [date, time] = at.split(" ");
    const day = date === today ? ui.whenToday[lang] : date === tomorrow ? ui.whenTomorrow[lang] : formatDate(date, lang, "dayMonth");
    return fill(ui.whenAt[lang], { day, time });
  };

  const phoneText = (p: string) => (p ? formatPhone(p) : ui.viaLine[lang]);

  function openNew() {
    setCrudError(null);
    setSaved(null);
    setErrors({});
    setDraft({ name: "", phone: "", note: "" });
  }

  function openEdit(c: Customer) {
    setCrudError(null);
    setSaved(null);
    setErrors({});
    setDraft({ id: c.id, name: c.name, phone: c.phone, note: c.note ?? "" });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    const phone = normalizePhone(draft.phone.trim());
    const next: Errors = {};
    if (!name) next.name = ui.custNameRequired[lang];
    // The LINE guest has no phone number (LINE already knows who is chatting), so theirs may stay empty.
    const guestWithoutPhone = draft.id === GUEST_ID && phone === "";
    if (!guestWithoutPhone && !isThaiPhone(phone)) next.phone = ui.phoneHint[lang];
    else if (!guestWithoutPhone) {
      const owner = data.customers.find((c) => c.phone === phone && c.id !== draft.id);
      if (owner) next.phone = fill(ui.custPhoneTaken[lang], { name: owner.name });
    }
    setErrors(next);
    if (next.name) return nameRef.current?.focus();
    if (next.phone) return phoneRef.current?.focus();

    const note = draft.note.trim();
    const customer: Customer = { id: draft.id ?? newId("c"), name, phone, ...(note ? { note } : {}) };
    setData((d) => upsertCustomer(d, customer));
    setSaved(fill(draft.id ? ui.custSaved[lang] : ui.custAdded[lang], { name }));
    setDraft(null);
  }

  function remove(c: Customer) {
    setSaved(null);
    try {
      const next = deleteCustomer(clinicData.get(), c.id);
      setData(next);
      setCrudError(null);
      if (draft?.id === c.id) setDraft(null);
    } catch (err) {
      setCrudError(`${c.name}: ${err instanceof ClinicError ? errorText[err.code][lang] : ui.deleteFailed[lang]}`);
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] leading-[1.25] font-medium text-(--wine) sm:text-[2.25rem]">{ui.custTitle[lang]}</h1>
          <p className="mt-1.5 text-(--muted)">{fill(ui.custCount[lang], { n: String(data.customers.length) })}</p>
        </div>
        <button
          type="button"
          data-testid="customer-add"
          onClick={openNew}
          className={`inline-flex items-center gap-2 rounded-full bg-(--wine) px-5 py-2.5 text-base text-white hover:bg-[#7d2a49] ${focusRing}`}
        >
          <Plus className="size-4" aria-hidden />
          {ui.custAdd[lang]}
        </button>
      </header>

      <div className="relative mt-5 max-w-md">
        <label htmlFor="customer-search" className="sr-only">
          {ui.custSearchLabel[lang]}
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--muted)" aria-hidden />
        <input
          id="customer-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ui.custSearchPh[lang]}
          className={`${fieldClass} mt-0 pl-10`}
        />
      </div>

      {draft && (
        <form
          onSubmit={save}
          noValidate
          aria-labelledby="customer-form-title"
          className="mt-5 rounded-2xl border border-(--accent)/50 bg-white p-5 shadow-[0_18px_40px_-28px_rgb(107_31_58/0.5)] sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="customer-form-title" className="text-lg leading-[1.3] font-medium text-(--wine)">
              {draft.id ? ui.custFormEdit[lang] : ui.custFormNew[lang]}
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customer-name" className="text-[14px] font-medium">
                {ui.custNameLabel[lang]}
              </label>
              <input
                ref={nameRef}
                id="customer-name"
                data-testid="customer-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                aria-required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "customer-name-error" : undefined}
                placeholder={ui.custNamePh[lang]}
                className={fieldClass}
              />
              {errors.name && (
                <p id="customer-name-error" role="alert" className="mt-1.5 text-base text-(--error)">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="customer-phone" className="text-[14px] font-medium">
                {ui.custPhoneLabel[lang]}
              </label>
              <input
                ref={phoneRef}
                id="customer-phone"
                data-testid="customer-phone"
                type="tel"
                inputMode="tel"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                aria-required={draft.id !== GUEST_ID}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "customer-phone-error" : undefined}
                placeholder="08x-xxx-xxxx"
                className={fieldClass}
              />
              {errors.phone && (
                <p id="customer-phone-error" role="alert" className="mt-1.5 text-base text-(--error)">
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="customer-note" className="text-[14px] font-medium">
                {ui.custNoteLabel[lang]} <span className="font-normal text-(--muted)">{ui.optional[lang]}</span>
              </label>
              <input
                id="customer-note"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder={ui.custNotePh[lang]}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              data-testid="customer-save"
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
        {crudError && <CrudError message={crudError} hint={ui.custDeleteHint[lang]} closeLabel={ui.toastDismiss[lang]} onClose={() => setCrudError(null)} />}
        {saved && <Saved message={saved} />}
      </div>

      <section aria-label={ui.custListLabel[lang]} className="mt-3 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div
          aria-hidden
          className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_6rem_minmax(0,1fr)_6rem] gap-4 border-b border-(--line) bg-(--paper) px-5 py-2.5 text-[14px] text-(--muted) md:grid"
        >
          <span>{ui.colName[lang]}</span>
          <span>{ui.colPhone[lang]}</span>
          <span className="text-right">{ui.colBookings[lang]}</span>
          <span className="pl-4">{ui.colNext[lang]}</span>
          <span />
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-base leading-[1.6] text-(--muted)">
            {fill(ui.custEmpty[lang], { q: query })}
          </p>
        ) : (
          <ul>
            {rows.map((c) => {
              const s = stats.get(c.id) ?? { count: 0 };
              return (
                <li
                  key={c.id}
                  data-testid="customer-row"
                  data-bookings={s.count}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-t border-(--line) px-4 py-3.5 first:border-t-0 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_6rem_minmax(0,1fr)_6rem] md:gap-4 md:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-(--rose-2) text-base text-(--wine)"
                    >
                      {monogramOf(c.name)}
                    </span>
                    <span className="min-w-0 leading-[1.35]">
                      <span className="block truncate text-base">{c.name}</span>
                      <span className="block truncate text-sm text-(--muted)">
                        <span className="tabular-nums md:hidden">{phoneText(c.phone)}</span>
                        <span className="hidden md:inline">
                          {c.note ?? (s.last ? fill(ui.custLastVisit[lang], { date: formatDate(s.last, lang, "dayMonth") }) : ui.custNoVisits[lang])}
                        </span>
                      </span>
                    </span>
                  </div>
                  <p className="hidden text-base tabular-nums md:block">{phoneText(c.phone)}</p>
                  <p className="hidden text-right text-base tabular-nums md:block">{fill(ui.custTimes[lang], { n: String(s.count) })}</p>
                  <p className="hidden pl-4 text-base tabular-nums first-letter:uppercase md:block">
                    {s.next ? when(s.next) : <span className="text-(--muted)">{ui.custNoNext[lang]}</span>}
                  </p>
                  <div className="row-span-2 flex items-center justify-end gap-1 md:row-span-1">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      aria-label={fill(ui.editName[lang], { name: c.name })}
                      className={`grid size-9 place-items-center rounded-full text-(--muted) hover:bg-(--rose) hover:text-(--ink) ${focusRing}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      data-testid="customer-delete"
                      onClick={() => remove(c)}
                      aria-label={fill(ui.deleteName[lang], { name: c.name })}
                      className={`grid size-9 place-items-center rounded-full text-(--muted) hover:bg-[#fbe4e2] hover:text-(--error) ${focusRing}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="pl-[3.25rem] text-[14px] text-(--muted) md:hidden">
                    {s.next ? fill(ui.custMobileNext[lang], { n: String(s.count), when: when(s.next) }) : fill(ui.custMobileMeta[lang], { n: String(s.count) })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
