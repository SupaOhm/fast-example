import { AdminFrame } from "../_components/admin-shell";

export default function ShopAdminAppLayout({ children }: { children: React.ReactNode }) {
  return <AdminFrame>{children}</AdminFrame>;
}
