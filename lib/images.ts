export function unsplash(id: string, width: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=75&auto=format&fit=crop`;
}

// Every id below was verified with `curl -sI` to return 200 (Unsplash License).
export const PHOTOS = {
  saleIngredient1: "1781707538246-61b5e9e18642",
  saleIngredient2: "1723475158232-819e29803f4d",
  saleIngredient3: "1775204059233-c59e8599ebe3",
  companyHero: "1716191299980-a6e8827ba10b",
  companyService1: "1740209475472-aa7d280f7452",
  companyService2: "1666634157070-6fd830fb5672",
  companyService3: "1764114235891-66ff86abaf87",
  companyService4: "1717386255773-a456c611dc4e",
  resortHero: "1773378998468-dca683d776e7",
  resortRoom1: "1611892440504-42a792e24d32",
  resortRoom2: "1776500587875-8a0653e9c10e",
  resortRoom3: "1780777683076-c1f652c40efd",
  resortRoom4: "1731336478850-6bce7235e320",
  resortRoom5: "1774280954999-9758f11f3d41",
  resortGallery1: "1669741043336-36eb9c3db071",
  resortGallery2: "1729717949948-56b52db111dd",
  resortGallery3: "1543489822-c49534f3271f",
  resortGallery4: "1788059284971-85ad138c31ba",
  resortGallery5: "1686238349945-82074ce9f02f",
  resortGallery6: "1506665531195-3566af2b4dfa",
  resortGallery7: "1729808642586-dc886f2176aa",
  resortGallery8: "1669741043333-f2752f430184",
  resortGallery9: "1713843841925-6af6ed0df472",
  resortAbout: "1759372945658-1e9f56e751bd",
  clinicHero: "1595871151608-bc7abd1caca3",
  clinicInterior: "1596740926849-2d473dee8d60",
} as const;
