import type { Metadata } from "next";
import Image from "next/image";
import { PHOTOS, unsplash } from "@/lib/images";
import { ClinicLoginForm } from "../../_components/clinic-login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบเจ้าหน้าที่" };

export default function ClinicLoginPage() {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={unsplash(PHOTOS.clinicHero, 1200)}
          alt="ห้องทรีตเมนต์ของลูมิ คลินิก โทนชมพูอ่อน"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(43_34_38/0)_40%,rgb(43_34_38/0.72))]" />
        <div className="absolute inset-x-10 bottom-32 max-w-md text-white">
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid size-11 place-items-center rounded-full bg-white text-lg text-(--wine)">
              L
            </span>
            <p className="text-xl leading-[1.3]">ลูมิ คลินิก</p>
          </div>
          <p className="mt-6 text-[2rem] leading-[1.35] font-light">
            คิวที่ลูกค้าจองผ่าน LINE เข้ามาอยู่ในตารางของคลินิกทันที
          </p>
        </div>
      </div>
      <div className="grid min-h-screen place-items-center px-4 pt-10 pb-28">
        <ClinicLoginForm />
      </div>
    </main>
  );
}
