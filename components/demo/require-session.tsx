"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { DemoStore } from "@/lib/demo-store";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";

export function RequireSession({
  store,
  loginPath,
  children,
}: {
  store: DemoStore<boolean>;
  loginPath: string;
  children: React.ReactNode;
}) {
  const [session] = useDemoStore(store);
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !session) router.replace(loginPath);
  }, [hydrated, session, router, loginPath]);

  if (!hydrated || !session) return null;
  return <>{children}</>;
}
