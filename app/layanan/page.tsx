import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DaftarLayanan from "@/components/layanan/DaftarLayanan";
import KatalogData from "@/components/layanan/KatalogData";

export const metadata: Metadata = {
  title: "Daftar layanan | SIGAP Bogor",
  description: "Cari layanan kesehatan, keamanan, olahraga, dan hiburan di Kota dan Kabupaten Bogor.",
};

export default function LayananPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] space-y-8 px-4 pb-16 pt-24 md:px-8">
        <div className="space-y-2">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-[var(--abu)]">
            SIGAP Bogor <span aria-hidden="true">›</span> <span className="font-bold text-[#1F5FD1]">Direktori layanan publik</span>
          </nav>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#005F50]">Infrastruktur &amp; pelayanan sipil</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--tinta)] md:text-4xl">Daftar layanan</h1>
          <p className="max-w-2xl text-sm text-[var(--abu)]">
            Cari fasilitas berdasarkan nama, alamat, atau kategori. Gunakan peta untuk melihat sebarannya.
          </p>
        </div>
        <KatalogData />
        <DaftarLayanan />
      </main>
      <Footer />
    </>
  );
}
