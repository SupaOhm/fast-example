import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersTable } from "../../_components/orders-table";

export const metadata: Metadata = { title: "Orders · คำสั่งซื้อ" };

export default function ShopOrdersPage() {
  // OrdersTable reads `?status=` with useSearchParams, which needs a Suspense boundary on a static page.
  return (
    <Suspense>
      <OrdersTable />
    </Suspense>
  );
}
