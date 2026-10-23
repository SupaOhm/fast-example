"use client";

import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { addDays, toISODate } from "@/lib/dates";
import { ClinicError, deleteCustomer, newId, upsertCustomer, type Customer } from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import { errorText } from "./copy";
import { useDemoStore } from "@/lib/use-demo-store";
import { isThaiPhone, normalizePhone } from "@/lib/validation";
import { fieldClass, focusRing, formatPhone, monogramOf, thDayMonth } from "./admin-format";
import { CrudError, Saved } from "./crud-parts";

interface Draft {
  id?: string;
  name: string;
  phone: string;
  note: string;
}

type Errors = Partial<Record<"name" | "phone", string>>;

export function CustomersCrud() {
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

  const stats = new Map<string, { count: number; next?: string; last?: string }>();
  for (const b of data.bookings) {
    const s = stats.get(b.customerId) ?? { count: 0 };
    s.count++;
    const at = `${b.date} ${b.time}`;
    if (b.date >= today && b.status === "booked" && (!s.next || at < s.next)) s.next = at;
    if (b.status === "done" && (!s.last || b.date > s.last)) s.last = b.date;
    stats.set(b.customerId, s);
  }

  const q = query.trim().toLowerCase();
  const qDigits = normalizePhone(q).replace(/\D/g, "");
  const rows = [...data.customers]
    .sort((a, b) => a.name.localeCompare(b.name, "th"))
    .filter((c) => !q || c.name.toLowerCase().includes(q) || (qDigits.length > 0 && c.phone.includes(qDigits)));

  const when = (at: string) => {
    const [date, time] = at.split(" ");
    const day = date === today ? "วันนี้" : date === tomorrow ? "พรุ่งนี้" : thDayMonth(date);
    return `${day} ${time}`;
  };

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
    if (!name) next.name = "กรุณากรอกชื่อลูกค้า";
    if (!isThaiPhone(phone)) next.phone = "เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 9–10 หลัก";
    else {
      const owner = data.customers.find((c) => c.phone === phone && c.id !== draft.id);
      if (owner) next.phone = `เบอร์นี้เป็นของ${owner.name}อยู่แล้ว`;
    }
    setErrors(next);
    if (next.name) return nameRef.current?.focus();
    if (next.phone) return phoneRef.current?.focus();

    const note = draft.note.trim();
    const customer: Customer = { id: draft.id ?? newId("c"), name, phone, ...(note ? { note } : {}) };
    setData((d) => upsertCustomer(d, customer));
    setSaved(draft.id ? `บันทึกการแก้ไข${name}แล้ว` : `เพิ่ม${name}แล้ว`);
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
      setCrudError(`${c.name}: ${err instanceof ClinicError ? errorText[err.code].th : "ลบไม่สำเร็จ"}`);
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] leading-[1.25] font-normal sm:text-[2rem]">ลูกค้า</h1>
          <p className="mt-1 text-[15px] text-(--muted)">ทั้งหมด {data.customers.length} คน</p>
        </div>
        <button
          type="button"
          data-testid="customer-add"
          onClick={openNew}
          className={`inline-flex items-center gap-2 rounded-full bg-(--rose-deep) px-4.5 py-2.5 text-[15px] text-white hover:bg-[#76323f] ${focusRing}`}
        >
          <Plus className="size-4" aria-hidden />
          เพิ่มลูกค้า
        </button>
      </header>

      <div className="relative mt-5 max-w-md">
        <label htmlFor="customer-search" className="sr-only">
          ค้นหาลูกค้า
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--muted)" aria-hidden />
        <input
          id="customer-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อหรือเบอร์โทร"
          className={`${fieldClass} mt-0 pl-10`}
        />
      </div>

      {draft && (
        <form
          onSubmit={save}
          noValidate
          aria-labelledby="customer-form-title"
          className="mt-5 rounded-2xl border border-(--rose)/50 bg-white p-5 shadow-[0_18px_40px_-28px_rgb(142_62_77/0.5)] sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="customer-form-title" className="text-lg leading-[1.3] font-medium">
              {draft.id ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
            </h2>
            <button
              type="button"
              onClick={() => setDraft(null)}
              aria-label="ปิดฟอร์ม"
              className={`grid size-9 place-items-center rounded-full text-(--muted) hover:bg-(--blush) ${focusRing}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customer-name" className="text-sm font-medium">
                ชื่อลูกค้า
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
                placeholder="เช่น คุณแพร"
                className={fieldClass}
              />
              {errors.name && (
                <p id="customer-name-error" role="alert" className="mt-1.5 text-sm text-(--error)">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="customer-phone" className="text-sm font-medium">
                เบอร์โทร
              </label>
              <input
                ref={phoneRef}
                id="customer-phone"
                data-testid="customer-phone"
                type="tel"
                inputMode="tel"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                aria-required
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "customer-phone-error" : undefined}
                placeholder="08x-xxx-xxxx"
                className={fieldClass}
              />
              {errors.phone && (
                <p id="customer-phone-error" role="alert" className="mt-1.5 text-sm text-(--error)">
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="customer-note" className="text-sm font-medium">
                หมายเหตุ <span className="font-normal text-(--muted)">(ไม่บังคับ)</span>
              </label>
              <input
                id="customer-note"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder="เช่น แพ้น้ำหอม ผิวแพ้ง่าย"
                className={fieldClass}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              data-testid="customer-save"
              className={`inline-flex items-center gap-2 rounded-full bg-(--rose-deep) px-5 py-2.5 text-[15px] text-white hover:bg-[#76323f] ${focusRing}`}
            >
              <Check className="size-4" aria-hidden />
              บันทึก
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className={`rounded-full px-4 py-2.5 text-[15px] text-(--muted) hover:bg-(--blush) hover:text-(--ink) ${focusRing}`}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {crudError && <CrudError message={crudError} hint="ลูกค้าที่เคยจองต้องเก็บไว้เพื่อดูประวัติย้อนหลัง" onClose={() => setCrudError(null)} />}
        {saved && <Saved message={saved} />}
      </div>

      <section aria-label="รายชื่อลูกค้า" className="mt-3 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div
          aria-hidden
          className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_6rem_minmax(0,1fr)_6rem] gap-4 border-b border-(--line) bg-(--paper) px-5 py-2.5 text-[13px] text-(--muted) md:grid"
        >
          <span>ชื่อ</span>
          <span>เบอร์โทร</span>
          <span className="text-right">การจอง</span>
          <span className="pl-4">นัดถัดไป</span>
          <span />
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-[15px] leading-[1.6] text-(--muted)">
            ไม่พบลูกค้าที่ตรงกับ “{query}” ลองค้นด้วยชื่อเล่นหรือเบอร์โทรบางส่วน
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
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-(--blush-2) text-[15px] text-(--rose-deep)"
                    >
                      {monogramOf(c.name)}
                    </span>
                    <span className="min-w-0 leading-[1.35]">
                      <span className="block truncate text-base">{c.name}</span>
                      <span className="block truncate text-sm text-(--muted)">
                        <span className="tabular-nums md:hidden">{formatPhone(c.phone)}</span>
                        <span className="hidden md:inline">
                          {c.note ?? (s.last ? `มาล่าสุด ${thDayMonth(s.last)}` : "ยังไม่เคยมาใช้บริการ")}
                        </span>
                      </span>
                    </span>
                  </div>
                  <p className="hidden text-[15px] tabular-nums md:block">{formatPhone(c.phone)}</p>
                  <p className="hidden text-right text-[15px] tabular-nums md:block">{s.count} ครั้ง</p>
                  <p className="hidden pl-4 text-[15px] tabular-nums md:block">
                    {s.next ? when(s.next) : <span className="text-(--muted)">ไม่มีนัด</span>}
                  </p>
                  <div className="row-span-2 flex items-center justify-end gap-1 md:row-span-1">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      aria-label={`แก้ไข ${c.name}`}
                      className={`grid size-9 place-items-center rounded-full text-(--muted) hover:bg-(--blush) hover:text-(--ink) ${focusRing}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      data-testid="customer-delete"
                      onClick={() => remove(c)}
                      aria-label={`ลบ ${c.name}`}
                      className={`grid size-9 place-items-center rounded-full text-(--muted) hover:bg-[#fbe4e2] hover:text-(--error) ${focusRing}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="pl-[3.25rem] text-[13px] text-(--muted) md:hidden">
                    จอง {s.count} ครั้ง{s.next ? ` นัดถัดไป ${when(s.next)}` : ""}
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
