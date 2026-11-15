export interface SubKategori {
  id: number;
  namaSubKategori: string;
}

export interface Kategori {
  id: number;
  namaKategori: string;
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
