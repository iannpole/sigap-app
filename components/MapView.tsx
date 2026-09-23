"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Circle, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Check, Clock, Layers, LocateFixed, Maximize2, Minus, Plus } from "lucide-react";
import { area } from "@/data/facilities";
import { GROUPS, SUB_META } from "@/lib/meta";
import type { Facility } from "@/lib/types";
import { useHello } from "./Toast";

const BASES = {
  standar: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "&copy; OpenStreetMap contributors",
  },
  terang: {
    name: "Peta Terang",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attr: "&copy; OpenStreetMap contributors &copy; CARTO",
  },
} as const;

type BaseKey = keyof typeof BASES;

interface Props {
  facilities: Facility[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  user: { lat: number; lng: number; label: string };
  radiusKm: number;
  focus: { lat: number; lng: number; n: number } | null;
  onFullscreen: () => void;
}

function makePin(f: Facility, selected: boolean) {
  const Icon = SUB_META[f.sub].icon;
  const html = renderToStaticMarkup(
    <div className={`pin${selected ? " sel" : ""}`} style={{ ["--c" as string]: GROUPS[f.group].color }}>
      <span>
        <Icon size={15} />
      </span>
    </div>
  );
  return L.divIcon({ html, className: "", iconSize: [34, 34], iconAnchor: [8, 34], popupAnchor: [10, -34] });
}

const userIcon = L.divIcon({ html: '<div class="user-dot"></div>', className: "", iconSize: [18, 18], iconAnchor: [9, 9] });

function Fit({ facilities }: { facilities: Facility[] }) {
  const map = useMap();
  const latest = useRef(facilities);
  latest.current = facilities;
  const key = facilities.map((f) => f.id).join("|");

  useEffect(() => {
    const list = latest.current;
    if (!list.length) return;
    const bounds = L.latLngBounds(list.map((f) => [f.lat, f.lng] as [number, number]));
    const wide = window.innerWidth >= 1024;
    map.fitBounds(bounds, {
      paddingTopLeft: [60, 60],
      paddingBottomRight: [wide ? 460 : 60, 60],
      maxZoom: 15,
    });
  }, [key, map]);

  return null;
}

function Focus({ focus }: { focus: Props["focus"] }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [focus, map]);
  return null;
}

function FacilityMarker({
  f,
  selected,
  onSelect,
}: {
  f: Facility;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const hello = useHello();
  const ref = useRef<L.Marker>(null);
  const icon = useMemo(() => makePin(f, selected), [f, selected]);
  const G = GROUPS[f.group];

  useEffect(() => {
    if (selected) ref.current?.openPopup();
  }, [selected]);

  return (
    <Marker ref={ref} position={[f.lat, f.lng]} icon={icon} eventHandlers={{ click: () => onSelect(f.id) }}>
      <Popup closeButton={false} minWidth={250} maxWidth={280} className="sehat-popup">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold" style={{ background: G.soft, color: G.color }}>
              {f.sub}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-bold ${f.open ? "text-brand" : "text-alert"}`}>
              <Clock size={10} />
              {f.hours}
            </span>
          </div>
          <h3 className="text-base font-extrabold leading-tight">{f.name}</h3>
          <p className="text-xs text-slate-600">{f.description}</p>
          <dl className="space-y-0.5 text-[11px]">
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 font-bold">Alamat</dt>
              <dd className="text-slate-600">{f.address}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 font-bold">Latitude</dt>
              <dd className="text-slate-600">{f.lat.toFixed(5)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 font-bold">Longitude</dt>
              <dd className="text-slate-600">{f.lng.toFixed(5)}</dd>
            </div>
          </dl>
          <div className="flex gap-2 pt-1">
            <button onClick={hello} className="flex-1 rounded-lg bg-ink px-3 py-2 text-[11px] font-extrabold text-white">
              Lihat Detail
            </button>
            <button
              onClick={hello}
              className="flex-1 rounded-lg px-3 py-2 text-[11px] font-extrabold text-white"
              style={{ background: G.color }}
            >
              Rute
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapView({ facilities, selectedId, onSelect, user, radiusKm, focus, onFullscreen }: Props) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [base, setBase] = useState<BaseKey>("standar");
  const [showArea, setShowArea] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [menu, setMenu] = useState(false);

  const btn =
    "grid h-10 w-10 place-items-center rounded-xl bg-white text-ink shadow-card transition hover:bg-mist";

  return (
    <div className="relative h-full w-full">
      <MapContainer ref={setMap} center={[user.lat, user.lng]} zoom={14} zoomControl={false} className="h-full w-full">
        <TileLayer key={base} url={BASES[base].url} attribution={BASES[base].attr} />
        {showArea && (
          <GeoJSON
            data={area}
            style={{ color: "#0b6b63", weight: 2, dashArray: "6 6", fillColor: "#0b6b63", fillOpacity: 0.06 }}
          />
        )}
        {showRadius && (
          <Circle
            center={[user.lat, user.lng]}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#0b6b63", weight: 1.5, fillColor: "#0b6b63", fillOpacity: 0.07 }}
          />
        )}
        <Marker position={[user.lat, user.lng]} icon={userIcon} interactive={false} />
        {facilities.map((f) => (
          <FacilityMarker key={f.id} f={f} selected={selectedId === f.id} onSelect={onSelect} />
        ))}
        <Fit facilities={facilities} />
        <Focus focus={focus} />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[900] hidden max-w-[70%] items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[11px] font-bold shadow-card sm:flex">
        <span className="h-2.5 w-2.5 rounded-full bg-brand" />
        {user.label}
        <span className="text-slate-400">|</span>
        <span className="font-semibold text-slate-600">
          Koordinat: {Math.abs(user.lat).toFixed(4)}° S, {user.lng.toFixed(4)}° E
        </span>
      </div>

      {map && (
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2 lg:right-[446px]">
          {menu && (
            <div className="w-56 rounded-2xl bg-white p-3 text-xs shadow-soft">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Peta Dasar</p>
              {(Object.keys(BASES) as BaseKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setBase(k)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 font-bold hover:bg-mist"
                >
                  {BASES[k].name}
                  {base === k && <Check size={14} className="text-brand" />}
                </button>
              ))}
              <p className="mb-2 mt-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Lapisan</p>
              <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 font-bold hover:bg-mist">
                Batas Wilayah
                <input type="checkbox" checked={showArea} onChange={() => setShowArea((v) => !v)} className="accent-[#0b6b63]" />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 font-bold hover:bg-mist">
                Radius {radiusKm} km
                <input type="checkbox" checked={showRadius} onChange={() => setShowRadius((v) => !v)} className="accent-[#0b6b63]" />
              </label>
            </div>
          )}
          <button aria-label="Lokasi saya" className={btn} onClick={() => map.flyTo([user.lat, user.lng], 15, { duration: 0.8 })}>
            <LocateFixed size={18} />
          </button>
          <button aria-label="Lapisan peta" className={btn} onClick={() => setMenu((v) => !v)}>
            <Layers size={18} />
          </button>
          <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-card">
            <button aria-label="Perbesar" className="grid h-10 w-10 place-items-center hover:bg-mist" onClick={() => map.zoomIn()}>
              <Plus size={18} />
            </button>
            <button aria-label="Perkecil" className="grid h-10 w-10 place-items-center border-t border-black/5 hover:bg-mist" onClick={() => map.zoomOut()}>
              <Minus size={18} />
            </button>
          </div>
          <button aria-label="Layar penuh" className={btn} onClick={onFullscreen}>
            <Maximize2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}