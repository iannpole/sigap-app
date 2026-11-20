import type { IkonKey } from "@/lib/beranda/katalog";

type Props = { ikon: string; size?: number };

const GARIS = "currentColor";

// Ikon brick: bentuk blok dengan stud di atas, digambar dari kotak dan lingkaran.
const GAMBAR: Record<IkonKey, React.ReactNode> = {
  peta: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="1" />
      <path d="M3 11h18M9 7v12" />
    </>
  ),
  kategori: (
    <>
      <rect x="3" y="11" width="7" height="7" />
      <rect x="14" y="11" width="7" height="7" />
      <rect x="8.5" y="3" width="7" height="6" />
    </>
  ),
  lokasi: (
    <>
      <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  "3d": (
    <>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </>
  ),
  kesehatan: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  keamanan: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    </>
  ),
  olahraga: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4v16" />
    </>
  ),
  hiburan: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20V10h12v10" />
      <path d="M9 10l3-6 3 6" />
      <path d="M12 13v4" />
    </>
  ),
  info: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 10v6M12 7h.01" />
    </>
  ),
};

export default function IkonBrick({ ikon, size = 20 }: Props) {
  const gambar = GAMBAR[ikon as IkonKey] ?? GAMBAR.info;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={GARIS}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {gambar}
    </svg>
  );
}
