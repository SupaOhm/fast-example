import type { Metadata } from "next";
import { OrdersTable } from "../../_components/orders-table";

export const metadata: Metadata = { title: "Orders · คำสั่งซื้อ" };

export default function ShopOrdersPage() {
  return <OrdersTable />;
}
