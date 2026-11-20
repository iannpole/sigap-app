import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Cross, Gamepad2, Map, MapPin, Shield, Siren, Waypoints } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Tentang SIGAP Bogor",
  description: "Kenali tujuan, cakupan, sumber data, dan cara melaporkan informasi fasilitas di SIGAP Bogor.",
};

const layanan = [
  { nama: "Kesehatan", keterangan: "Rumah sakit dan fasilitas kesehatan", ikon: Cross, warna: "#C8261E", teks: "#FFFFFF" },
  { nama: "Keamanan", keterangan: "Kantor polisi dan layanan keamanan", ikon: Shield, warna: "#1F5FD1", teks: "#FFFFFF" },
  { nama: "Olahraga", keterangan: "Fasilitas olahraga yang didukung sistem", ikon: Waypoints, warna: "#1B7F37", teks: "#FFFFFF" },
  { nama: "Hiburan", keterangan: "Taman dan tempat rekreasi", ikon: Gamepad2, warna: "#F5C400", teks: "#1B2433" },
];

function BrickCity() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl" aria-label="Ilustrasi brick peta layanan Bogor" role="img">
      <div className="absolute inset-x-[4%] bottom-[5%] top-[16%] -skew-y-3 rounded-[2rem] border-4 border-[#1B2433] bg-[#DCE9D0] shadow-[12px_14px_0_#1B2433] dark:bg-[#344C3A]" />
      <div className="absolute left-[13%] top-[36%] h-[18%] w-[25%] rounded-md border-4 border-[#1B2433] bg-[#C8261E] shadow-[6px_7px_0_#1B2433]">
        <span className="absolute -top-3 left-[12%] h-4 w-4 rounded-sm border-2 border-[#1B2433] bg-[#F5C400] shadow-[34px_0_0_#F5C400,68px_0_0_#F5C400]" />
        <span className="absolute left-1/2 top-1/2 h-8 w-3 -translate-x-1/2 -translate-y-1/2 bg-white" />
        <span className="absolute left-1/2 top-1/2 h-3 w-8 -translate-x-1/2 -translate-y-1/2 bg-white" />
      </div>
      <div className="absolute right-[12%] top-[25%] h-[28%] w-[27%] rounded-md border-4 border-[#1B2433] bg-[#1F5FD1] shadow-[6px_7px_0_#1B2433]">
        <span className="absolute -top-3 left-[9%] h-4 w-4 rounded-sm border-2 border-[#1B2433] bg-[#F5C400] shadow-[34px_0_0_#F5C400,68px_0_0_#F5C400]" />
        <span className="absolute inset-x-[18%] bottom-[12%] h-[42%] border-2 border-[#1B2433] bg-white/90" />
      </div>
      <div className="absolute bottom-[16%] left-[34%] h-[23%] w-[34%] rounded-md border-4 border-[#1B2433] bg-[#F5C400] shadow-[6px_7px_0_#1B2433]">
        <span className="absolute -top-3 left-[8%] h-4 w-4 rounded-sm border-2 border-[#1B2433] bg-[#C8261E] shadow-[34px_0_0_#C8261E,68px_0_0_#C8261E,102px_0_0_#C8261E]" />
        <span className="absolute bottom-0 left-[18%] h-[55%] w-[22%] border-x-2 border-t-2 border-[#1B2433] bg-[#1F5FD1]" />
        <span className="absolute bottom-0 right-[18%] h-[55%] w-[22%] border-x-2 border-t-2 border-[#1B2433] bg-[#1B7F37]" />
      </div>
      <div className="absolute left-[45%] top-[14%] grid h-14 w-14 place-items-center rounded-full border-4 border-[#1B2433] bg-white text-[#C8261E] shadow-[5px_6px_0_#1B2433]">
        <MapPin size={30} strokeWidth={3} aria-hidden="true" />
      </div>
    </div>
  );
}

export default function TentangPage() {
  return (
    <>
      <Header />
      <main>
        <section className="overflow-hidden bg-[var(--mist)] px-4 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32">
          <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-lg border-2 border-[#1B2433] bg-[#F5C400] px-3 py-2 text-xs font-extrabold text-[#1B2433] shadow-[3px_4px_0_#1B2433]">
                <MapPin size={15} aria-hidden="true" /> Kota dan Kabupaten Bogor
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--tinta)] sm:text-5xl lg:text-6xl">
                Layanan publik Bogor, <span className="hero-judul-biru text-[#1F5FD1]">lebih mudah ditemukan.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--abu)] md:text-lg">
                SIGAP membantu warga mencari fasilitas berdasarkan nama, kategori, dan jarak. Informasi disajikan dalam peta agar lokasi layanan lebih mudah dibandingkan dan dituju.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/#peta-hasil" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F5FD1] px-5 py-3 text-sm font-bold text-white shadow-[4px_5px_0_#1B2433] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F5FD1]">
                  <Map size={18} aria-hidden="true" /> Buka peta layanan
                </Link>
                <Link href="/layanan" className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-[#1B2433] bg-[var(--panel)] px-5 py-3 text-sm font-bold text-[var(--tinta)] shadow-[4px_5px_0_#1B2433] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F5FD1]">
                  Lihat daftar fasilitas
                </Link>
              </div>
            </div>
            <BrickCity />
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24" aria-labelledby="tujuan">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-extrabold text-[#C8261E]">Mengapa SIGAP dibuat</p>
                <h2 id="tujuan" className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tinta)] md:text-4xl">Satu titik awal untuk mencari layanan.</h2>
              </div>
              <div className="space-y-5 text-base leading-8 text-[var(--abu)]">
                <p>Informasi fasilitas sering tersebar di banyak tempat. SIGAP mengumpulkan lokasi yang tersedia ke dalam tampilan peta dan daftar yang dapat dicari.</p>
                <p>SIGAP bukan layanan tanggap darurat dan tidak menggantikan informasi resmi dari pengelola fasilitas. Untuk keadaan darurat, hubungi 112.</p>
              </div>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {layanan.map(({ nama, keterangan, ikon: Ikon, warna, teks }) => (
                <article key={nama} className="relative overflow-hidden rounded-2xl border-2 border-[#1B2433] bg-[var(--panel)] p-5 shadow-[5px_6px_0_#1B2433]">
                  <div className="grid h-12 w-12 place-items-center rounded-lg border-2 border-[#1B2433]" style={{ background: warna, color: teks }}>
                    <Ikon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold text-[var(--tinta)]">{nama}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--abu)]">{keterangan}</p>
                  <span className="absolute -bottom-3 -right-3 h-12 w-12 rounded-lg border-2 border-[#1B2433] opacity-15" style={{ background: warna }} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#1F5FD1] px-4 py-16 text-white md:px-8 md:py-20" aria-labelledby="cakupan">
          <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div>
              <p className="text-sm font-extrabold text-[#F5C400]">Cakupan wilayah</p>
              <h2 id="cakupan" className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Kota Bogor dan Kabupaten Bogor.</h2>
              <p className="mt-5 max-w-xl leading-8 text-blue-50">Peta memuat fasilitas yang tersimpan di basis data SIGAP. Ketersediaan informasi dapat berbeda untuk setiap wilayah dan kategori.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-[#1B2433] bg-white p-6 text-[#1B2433] shadow-[6px_7px_0_#1B2433]">
                <Building2 size={30} className="text-[#C8261E]" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-extrabold">Kota Bogor</h3>
                <p className="mt-2 text-sm leading-6 text-[#3F4945]">Fasilitas di wilayah administrasi Kota Bogor.</p>
              </div>
              <div className="rounded-2xl border-2 border-[#1B2433] bg-[#F5C400] p-6 text-[#1B2433] shadow-[6px_7px_0_#1B2433]">
                <MapPin size={30} aria-hidden="true" />
                <h3 className="mt-5 text-xl font-extrabold">Kabupaten Bogor</h3>
                <p className="mt-2 text-sm leading-6 text-[#1B2433]">Fasilitas yang tersedia di wilayah Kabupaten Bogor.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24" aria-labelledby="data">
          <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
            <div>
              <p className="text-sm font-extrabold text-[#1B7F37]">Data dan ketepatan informasi</p>
              <h2 id="data" className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tinta)] md:text-4xl">Peta terbuka, data yang terus dirawat.</h2>
              <p className="mt-5 max-w-2xl leading-8 text-[var(--abu)]">Peta dasar menggunakan OpenStreetMap. Detail fasilitas berasal dari basis data SIGAP dan dapat berubah mengikuti pembaruan pengelola.</p>
              <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-[#1F5FD1] underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F5FD1] dark:text-[#8FB4FF]">
                <Map size={18} aria-hidden="true" /> Atribusi OpenStreetMap
              </a>
            </div>
            <aside className="rounded-2xl border-2 border-[#1B2433] bg-[var(--mist)] p-6 shadow-[6px_7px_0_#1B2433] md:p-8" aria-labelledby="lapor">
              <Siren size={32} className="text-[#C8261E]" aria-hidden="true" />
              <h2 id="lapor" className="mt-5 text-2xl font-extrabold text-[var(--tinta)]">Menemukan data yang keliru?</h2>
              <p className="mt-3 leading-7 text-[var(--abu)]">Kirim nama fasilitas, informasi yang perlu diperbaiki, dan sumber koreksinya melalui alamat kontak di footer. Tim pengelola akan meninjaunya sebelum memperbarui data.</p>
              <p className="mt-5 border-l-4 border-[#F5C400] pl-4 text-sm font-bold leading-6 text-[var(--tinta)]">Jangan mengirim data pribadi, kata sandi, atau informasi medis melalui laporan.</p>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
