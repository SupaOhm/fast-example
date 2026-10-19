import { createDemoStore } from "@/lib/demo-store";
import type { Lang } from "./logic";

export const resortLang = createDemoStore<Lang>("resort:lang", "th");
