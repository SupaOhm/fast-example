"use client";

import { useEffect } from "react";
import { LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n/config";

// Lets the demo pill speak the same language the visitor chose on the hub.
export function RememberLocale({ locale }: { locale: Locale }) {
  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);
  return null;
}
