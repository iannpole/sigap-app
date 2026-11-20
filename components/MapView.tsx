"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Check, Layers, LocateFixed, Maximize2, Minus, Plus } from "lucide-react";
import FacilityVisual from "@/components/FacilityVisual";
import TombolRute from "@/components/TombolRute";
import { teksDiAtasKategori } from "@/lib/category-color";
import { area } from "@/data/area";
import type { LokasiView } from "@/lib/types";

const BASES = {
  standar: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "&copy; OpenStreetMap contributors" },
  terang: { name: "Peta Terang", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", attr: "&copy; OpenStreetMap contributors &copy; CARTO" },
} as const;
const TEMA_GELAP = BASES.standar;
type BaseKey = keyof typeof BASES;

interface Props {
  facilities: LokasiView[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  user: { lat: number; lng: number; label: string };
  radiusKm: number;
  focus: { lat: number; lng: number; n: number } | null;
  onFullscreen: () => void;
  colors: Record<number, string>;
}

function makePin(color: string, selected: boolean) {
  const html = `<div class="pin${selected ? " sel" : ""}" style="--c:${color}"><span aria-hidden="true"></span></div>`;
  return L.divIcon({ html, className: "", iconSize: [34, 38], iconAnchor: [17, 38], popupAnchor: [0, -38] });
}
const userIcon = L.divIcon({ html: '<div class="user-dot"></div>', className: "", iconSize: [18, 18], iconAnchor: [9, 9] });

function Fit({ facilities }: { facilities: LokasiView[] }) {
  const map = useMap();
  const key = facilities.map((f) => f.id).join("|");
  useEffect(() => {
    if (!facilities.length) return;
    map.fitBounds(L.latLngBounds(facilities.map((f) => [f.lat, f.lng] as [number, number])), {
      paddingTopLeft: [60, 60], paddingBottomRight: [60, 60], maxZoom: 15,
    });
  }, [facilities, key, map]);
  return null;
}

function Focus({ focus }: { focus: Props["focus"] }) {
  const map = useMap();
  useEffect(() => { if (focus) map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 15), { duration: 0.8 }); }, [focus, map]);
  return null;
}

function FacilityMarker({ f, selected, onSelect, color, user }: { f: LokasiView; selected: boolean; onSelect: (id: number) => void; color: string; user: Props["user"] }) {
  const ref = useRef<L.Marker>(null);
  const icon = useMemo(() => makePin(color, selected), [color, selected]);
  const detail = f.detailFasilitas;

  useEffect(() => {
    const el = ref.current?.getElement();
    if (el) {
      el.setAttribute("aria-label", `${f.nama}, ${f.kategori}`);
      el.setAttribute("title", f.nama);
    }
  }, [f.nama, f.kategori, icon]);

  useEffect(() => {
    if (selected && ref.current) {
      const marker = ref.current;
      if (!marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selected]);

  return (
    <Marker
      ref={ref}
      position={[f.lat, f.lng]}
      icon={icon}
      eventHandlers={{
        click: () => {
          onSelect(f.id);
          ref.current?.openPopup();
        },
      }}
    >
      <Popup closeButton={true} minWidth={290} maxWidth={330} autoPan={true} autoPanPadding={[24, 24]} className="sehat-popup">
        <div className="space-y-3">
          <FacilityVisual nama={f.nama} kategori={f.kategori} fotoUrl={f.fotoUrl} className="h-32 w-full rounded-xl overflow-hidden" />
          <div className="space-y-2 px-0.5 pb-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: color, color: teksDiAtasKategori(f.kategori) }}>
                {f.sub}
              </span>
              {detail?.terverifikasi && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#DDF5EA] px-2 py-0.5 text-[10px] font-extrabold text-[#005144]">
                  ✓ Terverifikasi
                </span>
              )}
              {detail?.statusOperasional && (
                <span className="inline-block rounded-md bg-[#EFF4FF] px-2 py-0.5 text-[10px] font-bold text-[#1F5FD1]">
                  {detail.statusOperasional}
                </span>
              )}
            </div>

            <h3 className="text-base font-extrabold leading-tight text-[#1B2433]">{f.nama}</h3>
            <p className="text-xs text-[var(--abu)]">{f.kategori} · {f.wilayah}</p>

            {f.deskripsi && <p className="text-xs leading-relaxed text-[var(--tinta)] line-clamp-3">{f.deskripsi}</p>}

            <dl className="space-y-1.5 border-t border-[#DFE5F1]/60 pt-2 text-[11px]">
              {f.alamat && (
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-bold text-[var(--abu)]">Alamat</dt>
                  <dd className="min-w-0 text-[var(--tinta)] line-clamp-2">{f.alamat}</dd>
                </div>
              )}
              {f.noKontak && (
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-bold text-[var(--abu)]">Kontak</dt>
                  <dd className="min-w-0 text-[var(--tinta)] font-semibold">{f.noKontak}</dd>
                </div>
              )}
              {f.jamOperasional && (
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-bold text-[var(--abu)]">Jam</dt>
                  <dd className="min-w-0 text-[var(--tinta)]">{f.jamOperasional}</dd>
                </div>
              )}
              {detail?.tempatTidurTersedia != null && (
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-bold text-[var(--abu)]">Kapasitas</dt>
                  <dd className="min-w-0 font-bold text-[#005F50]">
                    {detail.tempatTidurTersedia} {detail.kapasitasTempatTidur ? `/ ${detail.kapasitasTempatTidur}` : ""} tempat tidur
                  </dd>
                </div>
              )}
              {detail?.jumlahDokterJaga != null && (
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-bold text-[var(--abu)]">Dokter</dt>
                  <dd className="min-w-0 text-[var(--tinta)]">{detail.jumlahDokterJaga} dokter jaga</dd>
                </div>
              )}
              {detail?.hotlineDarurat && (
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-bold text-[#C8261E]">Darurat</dt>
                  <dd className="min-w-0 font-bold text-[#C8261E]">{detail.hotlineDarurat}</dd>
                </div>
              )}
            </dl>

            {detail?.layananUtama && detail.layananUtama.length > 0 && (
              <div className="pt-1">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--abu)]">Layanan Utama</p>
                <ul className="flex flex-wrap gap-1">
                  {detail.layananUtama.slice(0, 4).map((item) => (
                    <li key={item} className="rounded bg-[#E7EEFF] px-1.5 py-0.5 text-[10px] font-bold text-[#1F5FD1]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <TombolRute tujuan={{ lat: f.lat, lng: f.lng, alamat: f.alamat }} asal={user} nama={f.nama} telepon={f.noKontak} ringkas />
              <Link
                href={`/layanan/${f.id}`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold text-[var(--tinta)] shadow-sm hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-[#1F5FD1]"
              >
                Detail lengkap
              </Link>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function UserMarker({ user }: { user: Props["user"] }) {
  const ref = useRef<L.Marker>(null);
  useEffect(() => {
    const el = ref.current?.getElement();
    if (!el) return;
    // Titik acuan bersifat informatif, bukan kontrol.
    el.removeAttribute("tabindex");
    el.removeAttribute("role");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("title", user.label);
  }, [user.label]);
  return <Marker ref={ref} position={[user.lat, user.lng]} icon={userIcon} interactive={false} />;
}

export default function MapView({ facilities, selectedId, onSelect, user, radiusKm, focus, onFullscreen, colors }: Props) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [base, setBase] = useState<BaseKey>("standar");
  const [showArea, setShowArea] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [menu, setMenu] = useState(false);
  const [gelap, setGelap] = useState(false);
  useEffect(() => {
    const sync = () => setGelap(document.documentElement.classList.contains("dark"));
    sync();
    const pengamat = new MutationObserver(sync);
    pengamat.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => pengamat.disconnect();
  }, []);
  const peta = gelap ? TEMA_GELAP : BASES[base];
  const btn = "grid h-11 w-11 place-items-center rounded-xl bg-[var(--panel)] text-[var(--tinta)] shadow-card transition hover:bg-[var(--mist)]";

  return (
    <div className="relative h-full w-full">
      <MapContainer ref={setMap} center={[user.lat, user.lng]} zoom={14} zoomControl={false} className="h-full w-full">
        <TileLayer key={`${base}-${gelap}`} url={peta.url} attribution={peta.attr} />
        {showArea && <GeoJSON data={area} style={{ color: "#005144", weight: 2, dashArray: "6 6", fillColor: "#005144", fillOpacity: 0.06 }} />}
        {showRadius && <Circle center={[user.lat, user.lng]} radius={radiusKm * 1000} pathOptions={{ color: "#005144", weight: 1.5, fillColor: "#005144", fillOpacity: 0.07 }} />}
        <UserMarker user={user} />
        {facilities.map((f) => <FacilityMarker key={f.id} f={f} selected={selectedId === f.id} onSelect={onSelect} color={colors[f.kategoriId] ?? "#005144"} user={user} />)}
        <Fit facilities={facilities} /><Focus focus={focus} />
      </MapContainer>
      {map && <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2">
        {menu && <div className="w-56 rounded-2xl bg-[var(--panel)] p-3 text-xs shadow-soft">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--abu)]">Peta Dasar</p>
          {(Object.keys(BASES) as BaseKey[]).map((k) => <button type="button" key={k} onClick={() => setBase(k)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 font-bold hover:bg-[var(--mist)]">{BASES[k].name}{base === k && <Check size={14} className="text-brand" />}</button>)}
          <p className="mb-2 mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--abu)]">Lapisan</p>
          <label className="flex items-center justify-between rounded-lg px-2 py-2 font-bold">Batas Wilayah<input type="checkbox" checked={showArea} onChange={() => setShowArea((v) => !v)} /></label>
          <label className="flex items-center justify-between rounded-lg px-2 py-2 font-bold">Radius {radiusKm} km<input type="checkbox" checked={showRadius} onChange={() => setShowRadius((v) => !v)} /></label>
        </div>}
        <button type="button" aria-label="Pusatkan titik acuan" className={btn} onClick={() => map.flyTo([user.lat, user.lng], 15, { duration: 0.8 })}><LocateFixed size={18} /></button>
        <button type="button" aria-label="Atur lapisan peta" aria-expanded={menu} className={btn} onClick={() => setMenu((v) => !v)}><Layers size={18} /></button>
        <div className="flex flex-col overflow-hidden rounded-xl bg-[var(--panel)] shadow-card"><button type="button" aria-label="Perbesar" className="grid h-11 w-11 place-items-center hover:bg-[var(--mist)]" onClick={() => map.zoomIn()}><Plus size={18} /></button><button type="button" aria-label="Perkecil" className="grid h-11 w-11 place-items-center border-t border-black/5 hover:bg-[var(--mist)]" onClick={() => map.zoomOut()}><Minus size={18} /></button></div>
        <button type="button" aria-label="Layar penuh" className={btn} onClick={onFullscreen}><Maximize2 size={18} /></button>
      </div>}
    </div>
  );
}
