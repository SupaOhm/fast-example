import type { Metadata } from "next";
import { StockTable } from "../../_components/stock-table";

export const metadata: Metadata = { title: "Stock · สต็อกสินค้า" };

export default function ShopStockPage() {
  return <StockTable />;
}
