// Warna diambil dari palet referensi. Ditetapkan berdasarkan urutan kategori dari API.
const PALETTE = ["#005144", "#94000C", "#176B5B", "#34675B", "#3B6D61"];

export function colorById(kategori: { id: number }[]): Record<number, string> {
  return Object.fromEntries(kategori.map((k, i) => [k.id, PALETTE[i % PALETTE.length]]));
}
