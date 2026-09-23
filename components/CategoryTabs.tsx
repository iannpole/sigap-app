"use client";

import { LayoutGrid } from "lucide-react";
import { ALL_SUBS, GROUPS, SUB_META } from "@/lib/meta";
import type { Filter, Group, Sub } from "@/lib/types";

interface Counts {
  all: number;
  kesehatan: number;
  rekreasi: number;
  subs: Record<string, number>;
}

interface Props {
  filter: Filter;
  counts: Counts;
  onGroup: (g: "all" | Group) => void;
  onSub: (s: "all" | Sub) => void;
}

export default function CategoryTabs({ filter, counts, onGroup, onSub }: Props) {
  const tabs = [
    { id: "all" as const, label: "Semua (Aktif)", icon: LayoutGrid, count: counts.all, color: "#0f1f26" },
    { id: "kesehatan" as const, label: GROUPS.kesehatan.label, icon: GROUPS.kesehatan.icon, count: counts.kesehatan, color: GROUPS.kesehatan.color },
    { id: "rekreasi" as const, label: GROUPS.rekreasi.label, icon: GROUPS.rekreasi.icon, count: counts.rekreasi, color: GROUPS.rekreasi.color },
  ];

  const subs = filter.group === "all" ? ALL_SUBS : GROUPS[filter.group].subs;
  const activeSoft = filter.group === "all" ? "#d8efe6" : GROUPS[filter.group].soft;

  return (
    <section className="space-y-4">
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0">
        {tabs.map((t) => {
          const active = filter.group === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onGroup(t.id)}
              className={`flex shrink-0 items-center justify-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-extrabold shadow-card transition ${
                active ? "bg-ink text-white" : "bg-white text-ink hover:bg-mist"
              }`}
            >
              <Icon size={18} style={{ color: active ? "#fff" : t.color }} />
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  active ? "bg-white/20 text-white" : "bg-mist text-slate-600"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        <span className="shrink-0 pr-2 text-xs font-extrabold">Subkategori:</span>
        <button
          onClick={() => onSub("all")}
          className="shrink-0 rounded-lg px-5 py-2.5 text-xs font-extrabold shadow-card"
          style={{
            background: filter.sub === "all" ? activeSoft : "#fff",
            color: "#0f1f26",
          }}
        >
          Semua
        </button>
        {subs.map((s) => {
          const Icon = SUB_META[s].icon;
          const active = filter.sub === s;
          return (
            <button
              key={s}
              onClick={() => onSub(s)}
              className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-extrabold shadow-card transition hover:brightness-95"
              style={{ background: active ? GROUPS[SUB_META[s].group].soft : "#fff" }}
            >
              <Icon size={14} style={{ color: GROUPS[SUB_META[s].group].color }} />
              {s}
              <span className="text-[11px] font-bold text-slate-500">{counts.subs[s] ?? 0}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}