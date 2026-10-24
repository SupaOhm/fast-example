import type { Metadata } from "next";
import { ServicesCrud } from "../../../_components/services-crud";

export const metadata: Metadata = { title: "Treatments · บริการ" };

export default function ClinicServicesPage() {
  return <ServicesCrud />;
}
