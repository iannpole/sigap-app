"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Check, Layers, LocateFixed, Maximize2, Minus, Plus } from "lucide-react";
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
  return L.divIcon({ html, className: "", iconSize: [34, 34], iconAnchor: [8, 34], popupAnchor: [10, -34] });
}
const userIcon = L.divIcon({ html: '<div class="user-dot"></div>', className: "", iconSize: [18, 18], iconAnchor: [9, 9] });

function Fit({ facilities }: { facilities: LokasiView[] }) {
  const map = useMap();
  const key = facilities.map((f) => f.id).join("|");
  useEffect(() => {
    if (!facilities.length) return;
    map.fitBounds(L.latLngBounds(facilities.map((f) => [f.lat, f.lng] as [number, number])), {
      paddingTopLeft: [60, 60], paddingBottomRight: [window.innerWidth >= 1024 ? 460 : 60, 60], maxZoom: 15,
    });
  }, [facilities, key, map]);
  return null;
}

function Focus({ focus }: { focus: Props["focus"] }) {
  const map = useMap();
  useEffect(() => { if (focus) map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 15), { duration: 0.8 }); }, [focus, map]);
  return null;
}

function FacilityMarker({ f, selected, onSelect, color }: { f: LokasiView; selected: boolean; onSelect: (id: number) => void; color: string }) {
  const ref = useRef<L.Marker>(null);
  const icon = useMemo(() => makePin(color, selected), [color, selected]);
  useEffect(() => { if (selected) ref.current?.openPopup(); }, [selected]);
  return (
    <Marker ref={ref} position={[f.lat, f.lng]} icon={icon} eventHandlers={{ click: () => onSelect(f.id) }}>
      <Popup closeButton={false} minWidth={250} maxWidth={280} className="sehat-popup">
        <div className="space-y-2.5">
          <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: "#B8EEDE", color }}>{f.sub}</span>
          <h3 className="text-base font-bold leading-tight">{f.nama}</h3>
          <p className="text-xs text-[var(--abu)]">{f.kategori} • {f.wilayah}</p>
          <dl className="space-y-1 text-[11px]">
            {f.alamat && <div className="flex gap-2"><dt className="w-16 shrink-0 font-bold">Alamat</dt><dd className="text-[var(--abu)]">{f.alamat}</dd></div>}
            {f.noKontak && <div className="flex gap-2"><dt className="w-16 shrink-0 font-bold">Kontak</dt><dd className="text-[var(--abu)]">{f.noKontak}</dd></div>}
            {f.jamOperasional && <div className="flex gap-2"><dt className="w-16 shrink-0 font-bold">Jam</dt><dd className="text-[var(--abu)]">{f.jamOperasional}</dd></div>}
          </dl>
        </div>
      </Popup>
    </Marker>
  );
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
  const btn = "grid h-10 w-10 place-items-center rounded-xl bg-[var(--panel)] text-[var(--tinta)] shadow-card transition hover:bg-[var(--mist)]";

  return (
    <div className="relative h-full w-full">
      <MapContainer ref={setMap} center={[user.lat, user.lng]} zoom={14} zoomControl={false} className="h-full w-full">
        <TileLayer key={`${base}-${gelap}`} url={peta.url} attribution={peta.attr} />
        {showArea && <GeoJSON data={area} style={{ color: "#005144", weight: 2, dashArray: "6 6", fillColor: "#005144", fillOpacity: 0.06 }} />}
        {showRadius && <Circle center={[user.lat, user.lng]} radius={radiusKm * 1000} pathOptions={{ color: "#005144", weight: 1.5, fillColor: "#005144", fillOpacity: 0.07 }} />}
        <Marker position={[user.lat, user.lng]} icon={userIcon} interactive={false} />
        {facilities.map((f) => <FacilityMarker key={f.id} f={f} selected={selectedId === f.id} onSelect={onSelect} color={colors[f.kategoriId] ?? "#005144"} />)}
        <Fit facilities={facilities} /><Focus focus={focus} />
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[900] hidden max-w-[70%] items-center gap-2 rounded-full bg-[var(--panel)]/95 px-4 py-2 text-[11px] font-bold shadow-card sm:flex"><span className="h-2.5 w-2.5 rounded-full bg-brand" />{user.label}</div>
      {map && <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2 lg:right-[446px]">
        {menu && <div className="w-56 rounded-2xl bg-[var(--panel)] p-3 text-xs shadow-soft">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--abu)]">Peta Dasar</p>
          {(Object.keys(BASES) as BaseKey[]).map((k) => <button type="button" key={k} onClick={() => setBase(k)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 font-bold hover:bg-[var(--mist)]">{BASES[k].name}{base === k && <Check size={14} className="text-brand" />}</button>)}
          <p className="mb-2 mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--abu)]">Lapisan</p>
          <label className="flex items-center justify-between rounded-lg px-2 py-2 font-bold">Batas Wilayah<input type="checkbox" checked={showArea} onChange={() => setShowArea((v) => !v)} /></label>
          <label className="flex items-center justify-between rounded-lg px-2 py-2 font-bold">Radius {radiusKm} km<input type="checkbox" checked={showRadius} onChange={() => setShowRadius((v) => !v)} /></label>
        </div>}
        <button type="button" aria-label="Pusatkan titik acuan" className={btn} onClick={() => map.flyTo([user.lat, user.lng], 15, { duration: 0.8 })}><LocateFixed size={18} /></button>
        <button type="button" aria-label="Atur lapisan peta" aria-expanded={menu} className={btn} onClick={() => setMenu((v) => !v)}><Layers size={18} /></button>
        <div className="flex flex-col overflow-hidden rounded-xl bg-[var(--panel)] shadow-card"><button type="button" aria-label="Perbesar" className="grid h-10 w-10 place-items-center hover:bg-[var(--mist)]" onClick={() => map.zoomIn()}><Plus size={18} /></button><button type="button" aria-label="Perkecil" className="grid h-10 w-10 place-items-center border-t border-black/5 hover:bg-[var(--mist)]" onClick={() => map.zoomOut()}><Minus size={18} /></button></div>
        <button type="button" aria-label="Layar penuh" className={btn} onClick={onFullscreen}><Maximize2 size={18} /></button>
      </div>}
    </div>
  );
}
