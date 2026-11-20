export interface SubKategori {
  id: number;
  namaSubKategori: string;
  jumlahLokasi: number;
}

export interface Kategori {
  id: number;
  namaKategori: string;
  jumlahLokasi: number;
  subKategori: SubKategori[];
}

export interface Lokasi {
  id: number;
  nama: string;
  kategoriId: number;
  kategori: string;
  subKategoriId: number;
  sub: string;
  alamat: string | null;
  wilayah: string;
  noKontak: string | null;
  jamOperasional: string | null;
  fotoUrl: string | null;
  deskripsi: string | null;
  detailFasilitas: import("@/lib/lokasi-input").DetailFasilitas | null;
  jarakMeter: number | null;
  lat: number;
  lng: number;
}

export interface LokasiView extends Lokasi {
  distance: number;
}

export interface Filter {
  kategoriId: number | null;
  subKategoriId: number | null;
}

export interface Counts {
  all: number;
  kategori: Record<number, number>;
  sub: Record<number, number>;
}
