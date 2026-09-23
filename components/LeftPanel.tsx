"use client";

import { useState } from "react";
import { ChevronRight, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { GROUPS, SUB_META } from "@/lib/meta";
import type { Filter, Group, Sub } from "@/lib/types";

interface Props {
  filter: Filter;
  counts: { all: number; kesehatan: number; rekreasi: number; subs: Record<string, number> };
  onGroup: (g: "all" | Group) => void;
  onSub: (s: Sub) => void;
}

export default function LeftPanel({ filter, counts, onGroup, onSub }: Props) {
  const [open, setOpen] = useState(false);

  const row = (active: boolean) =>
    `flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
      active ? "bg-ink text-white" : "hover:bg-mist"
    }`;

  return (
    <>
      <div className="absolute inset-y-0 left-0 z-[1000] hidden w-3 md:block" onMouseEnter={() => setOpen(true)} />

      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute left-4 top-4 z-[1001] flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-extrabold shadow-soft"
      >
        {open ? <X size={14} /> : <SlidersHorizontal size={14} />}
        Filter
      </button>

      <aside
        onMouseLeave={() => setOpen(false)}
        className={`absolute bottom-4 left-4 top-16 z-[1001] w-[280px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-3xl bg-white/95 p-3 shadow-soft backdrop-blur transition-transform duration-300 ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-[115%]"
        }`}
      >
        <p className="px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Kategori Peta</p>

        <button onClick={() => onGroup("all")} className={row(filter.group === "all" && filter.sub === "all")}>
          <span className="flex items-center gap-2">
            <LayoutGrid size={16} />
            Semua
          </span>
          <span className="text-xs opacity-80">{counts.all}</span>
        </button>

        {(Object.keys(GROUPS) as Group[]).map((g) => {
          const G = GROUPS[g];
          const Icon = G.icon;
          return (
            <div key={g} className="mt-2">
              <button onClick={() => onGroup(g)} className={row(filter.group === g && filter.sub === "all")}>
                <span className="flex items-center gap-2">
                  <Icon size={16} style={{ color: filter.group === g && filter.sub === "all" ? "#fff" : G.color }} />
                  {G.label}
                </span>
                <span className="text-xs opacity-80">{counts[g]}</span>
              </button>
              <div className="ml-4 mt-1 space-y-0.5 border-l border-black/10 pl-2">
                {G.subs.map((s) => {
                  const SubIcon = SUB_META[s].icon;
                  const active = filter.sub === s;
                  return (
                    <button
                      key={s}
                      onClick={() => onSub(s)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                        active ? "font-extrabold" : "hover:bg-mist"
                      }`}
                      style={{ background: active ? G.soft : undefined }}
                    >
                      <span className="flex items-center gap-2">
                        <SubIcon size={14} style={{ color: G.color }} />
                        {s}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        {counts.subs[s] ?? 0}
                        <ChevronRight size={12} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </aside>
    </>
  );
}