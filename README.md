# sigap-app

WebGIS untuk menemukan fasilitas kesehatan dan tempat refresh di Tangerang Selatan.

## Fitur

- Interactive map dengan Leaflet & OpenStreetMap
- Filter fasilitas kesehatan dan rekreasi
- Pencarian real-time
- Auto-hide left panel navigation
- Nearby facilities panel
- Responsive design (desktop, tablet, mobile)
- Dark/Light mode ready

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **Mapping**: Leaflet + React Leaflet
- **Icons**: Lucide React
- **Font**: Plus Jakarta Sans (Google Fonts)

## Syarat Sistem

- Node.js 18+ atau 20+
- npm 9+ atau pnpm / yarn

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd sehat-refresh-tangsel
```

### 2. Install Dependencies

```bash
npm install
```

atau dengan pnpm:

```bash
pnpm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

```bash
# BACKEND: Add your API endpoints here
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
# NEXT_PUBLIC_GEOJSON_URL=http://localhost:3000/api/facilities.json
```

### 4. Run Development Server

```bash
npm run dev
```

Buka browser ke `http://localhost:3000`


## Usage

### Struktur Data Fasilitas

Fasilitas didefinisikan di `data/facilities.ts` sebagai GeoJSON FeatureCollection:

```typescript
{
  type: "Feature",
  properties: {
    id: string,
    name: string,
    sub: "Klinik" | "Puskesmas" | "Rumah Sakit" | "Apotek" | "Taman" | ...,
    description: string,
    address: string,
    open: boolean,
    hours: string
  },
  geometry: {
    type: "Point",
    coordinates: [longitude, latitude]
  }
}
```

### Menambah Kategori Baru

Edit `lib/meta.tsx`:

```typescript
export const GROUPS: Record<Group, ...> = {
  // existing groups...
  nama_grup: {
    label: "Nama Grup",
    color: "#hexcolor",
    soft: "#hexcolor-soft",
    icon: SomeIcon,
    subs: ["Subkategori 1", "Subkategori 2"],
  },
};

export const SUB_META: Record<Sub, ...> = {
  "Subkategori 1": { group: "nama_grup", icon: SomeIcon },
  "Subkategori 2": { group: "nama_grup", icon: SomeIcon },
};
```

### Integrasi API Backend

**BACKEND:** Ganti data lokal dengan fetch API. Di `app/page.tsx`:

```typescript
const [all, setAll] = useState<Facility[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch(process.env.NEXT_PUBLIC_API_URL + "/facilities")
    .then(r => r.json())
    .then(fc => {
      const facilities = toFacilities(fc, USER);
      setAll(facilities);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);
```

### Lokasi & Radius Default

Di `data/facilities.ts`:

```typescript
export const USER = { 
  lat: -6.301, 
  lng: 106.652, 
  label: "Jl. BSD Raya Utama, Serpong" 
};
export const RADIUS_KM = 3;
```

## Fitur Interaktif

Setiap button yang belum terhubung ke backend menampilkan toast "Hello World":

- Navigation buttons
- Search & filter buttons
- Marker popups (Lihat Detail, Rute)
- Info cards
- Profile & admin portal

Marker interactions (zoom, pan, select, popup) bekerja secara real-time.

## Responsive Breakpoints

- **Mobile**: < 640px (penuh lebar, collapsible panels)
- **Tablet**: 640px - 1024px (layout hybrid)
- **Desktop**: ≥ 1024px (full layout dengan side panels)

## Customization

### Warna Tema

Edit `tailwind.config.ts`:

```typescript
colors: {
  brand: "#0b6b63",        // Primary color
  health: "#0e7490",       // Healthcare color
  refresh: "#4d9a2e",      // Recreation color
  // ... more colors
}
```

### Font

File default menggunakan Plus Jakarta Sans dari Google Fonts di `app/layout.tsx`.

### Map Basemap

Di `components/MapView.tsx`, ubah `BASES`:

```typescript
const BASES = {
  standar: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "&copy; OpenStreetMap contributors",
  },
  // Add more basemaps here
};
```

## Build untuk Production

```bash
npm run build
npm start
```

## Troubleshooting

### Leaflet CSS tidak muncul

Pastikan `import "leaflet/dist/leaflet.css"` ada di `components/MapView.tsx` (baris pertama).

### Map tidak render di SSR

`MapView` sudah wrap dengan `dynamic()` dan `ssr: false` di `app/page.tsx`.

### Icons tidak muncul

Pastikan `lucide-react` ter-install:

```bash
npm install lucide-react
```

## API Endpoints (BACKEND)

Siapkan endpoints ini di backend Anda:
