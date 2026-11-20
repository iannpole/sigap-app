const WARNA: Record<string, string> = {
  kesehatan: "#C8261E",
  keamanan: "#1F5FD1",
  olahraga: "#1B7F37",
  hiburan: "#F5C400",
};

const CADANGAN = ["#C8261E", "#1F5FD1", "#1B7F37", "#F5C400"];

export function colorById(kategori: { id: number; namaKategori?: string }[]): Record<number, string> {
  return Object.fromEntries(
    kategori.map((k, i) => [k.id, WARNA[k.namaKategori?.toLowerCase() ?? ""] ?? CADANGAN[i % CADANGAN.length]])
  );
}

export function warnaKategori(nama: string): string {
  return WARNA[nama.toLowerCase()] ?? "#1B2433";
}

// Warna kategori di atas panel gelap (#1D2636) gagal AA bila memakai palet terang.
const WARNA_GELAP: Record<string, string> = {
  kesehatan: "#FF8A82",
  keamanan: "#8FB4FF",
  olahraga: "#7BD69B",
  hiburan: "#FFD84D",
};

export function warnaKategoriGelap(nama: string): string {
  return WARNA_GELAP[nama.toLowerCase()] ?? "#F1EFE6";
}

// Teks di atas bidang berwarna kategori. Kuning tidak lolos AA dengan teks putih.
export function teksDiAtasKategori(nama: string): string {
  const key = nama.toLowerCase();
  return key === "hiburan" || key === "olahraga" ? "#1B2433" : "#FFFFFF";
}
