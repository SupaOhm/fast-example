import type { Metadata } from "next";
import { CustomersCrud } from "../../../_components/customers-crud";

export const metadata: Metadata = { title: "Customers · ลูกค้า" };

export default function ClinicCustomersPage() {
  return <CustomersCrud />;
}
