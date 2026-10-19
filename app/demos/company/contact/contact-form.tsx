"use client";

import { CheckCircle2, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "@/lib/demos/company/content";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/demos/company/validate-contact";

const empty: ContactInput = { name: "", company: "", email: "", phone: "", service: "", message: "" };
const fieldOrder: (keyof ContactInput)[] = ["name", "company", "email", "phone", "service", "message"];

const inputClass =
  "mt-2 block w-full rounded-[2px] border bg-white px-3.5 py-3 text-base leading-[1.5] text-(--ink) outline-none transition-colors placeholder:text-[#8a94a3] focus:border-(--navy) focus:ring-2 focus:ring-(--navy)/20";

function Field({
  id,
  label,
  required,
  optional,
  error,
  children,
}: {
  id: keyof ContactInput;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`contact-${id}`} className="block text-[15px] leading-[1.4] font-medium text-(--ink)">
        {label}
        {required && (
          <span className="ml-1 text-(--orange-ink)" aria-hidden>
            *
          </span>
        )}
        {optional && <span className="ml-1.5 text-[13px] font-normal text-(--muted)">(ไม่บังคับ)</span>}
      </label>
      {children}
      {error && (
        <p id={`contact-${id}-error`} data-testid={`error-${id}`} className="mt-1.5 text-sm leading-[1.5] text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  function update(key: keyof ContactInput, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const found = validateContact(values);
    setErrors(found);
    const first = fieldOrder.find((k) => found[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    timer.current = setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 600);
  }

  function reset() {
    setValues(empty);
    setErrors({});
    setSent(false);
  }

  const a11y = (key: keyof ContactInput) => ({
    id: `contact-${key}`,
    name: key,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `contact-${key}-error` : undefined,
  });

  const border = (key: keyof ContactInput) => (errors[key] ? "border-[#b42318]" : "border-(--line)");

  if (sent) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        data-testid="contact-success"
        className="mt-8 border-l-4 border-(--orange) bg-(--steel) p-6 outline-none sm:p-8"
      >
        <CheckCircle2 className="size-9 text-(--navy)" aria-hidden />
        <p className="mt-4 text-xl leading-[1.5] font-bold text-(--navy)">ได้รับข้อมูลแล้ว</p>
        <p className="mt-2 text-base leading-[1.7] text-(--ink)">
          ทีมขายจะติดต่อกลับภายใน 1 วันทำการ (เว็บตัวอย่าง: ไม่มีการส่งข้อมูลจริง)
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-[3px] border-2 border-(--navy) px-6 py-2.5 text-[15px] leading-[1.3] font-bold text-(--navy) transition-colors hover:bg-(--navy) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy)"
        >
          ส่งอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="mt-8 grid gap-6 sm:grid-cols-2">
      <Field id="name" label="ชื่อผู้ติดต่อ" required error={errors.name}>
        <input
          {...a11y("name")}
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className={`${inputClass} ${border("name")}`}
        />
      </Field>
      <Field id="company" label="บริษัท" optional error={errors.company}>
        <input
          {...a11y("company")}
          type="text"
          autoComplete="organization"
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
          className={`${inputClass} ${border("company")}`}
        />
      </Field>
      <Field id="email" label="อีเมล" required error={errors.email}>
        <input
          {...a11y("email")}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="name@company.co.th"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          className={`${inputClass} ${border("email")}`}
        />
      </Field>
      <Field id="phone" label="เบอร์โทร" optional error={errors.phone}>
        <input
          {...a11y("phone")}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="08x-xxx-xxxx"
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={`${inputClass} ${border("phone")}`}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field id="service" label="บริการที่สนใจ" required error={errors.service}>
          <div className="relative">
            <select
              {...a11y("service")}
              value={values.service}
              onChange={(e) => update("service", e.target.value)}
              className={`${inputClass} ${border("service")} appearance-none pr-10`}
            >
              <option value="">เลือกบริการ</option>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 bottom-3.5 size-5 text-(--navy)" aria-hidden />
          </div>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="message" label="รายละเอียดงาน" required error={errors.message}>
          <textarea
            {...a11y("message")}
            rows={5}
            placeholder="เช่น วัสดุ ขนาด จำนวนชิ้น และวันที่ต้องการรับงาน"
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            className={`${inputClass} ${border("message")} resize-y`}
          />
        </Field>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="submit"
          data-testid="contact-submit"
          disabled={submitting}
          className="rounded-[3px] bg-(--orange) px-10 py-4 text-lg leading-[1.3] font-bold text-(--navy) transition-colors hover:bg-[#f7a24f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "กำลังส่ง…" : "ส่งข้อมูล"}
        </button>
        <p className="text-sm leading-[1.5] text-(--muted)">ตอบกลับภายใน 1 วันทำการ</p>
      </div>
    </form>
  );
}
