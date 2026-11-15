import { test } from "node:test";
import assert from "node:assert/strict";
import { NPC, posisiNpc, panjangJalur } from "./npc";
import { UKURAN_KOTA } from "../generators/kota-layout";
import { warnaBaseplate } from "../generators/kota-sigap";

test("ada 6 NPC dengan rute minimal dua titik", () => {
  assert.equal(NPC.length, 6);
  for (const n of NPC) assert.ok(n.jalur.length >= 2, n.id);
});

test("posisi deterministik dan bergerak", () => {
  for (const n of NPC) {
    assert.deepEqual(posisiNpc(n, 2), posisiNpc(n, 2));
    assert.notDeepEqual(posisiNpc(n, 2), posisiNpc(n, 6));
  }
});

test("t=0 berada di titik awal dan t=paruh siklus di titik akhir", () => {
  for (const n of NPC) {
    const awal = posisiNpc(n, 0);
    assert.equal(awal.x, n.jalur[0].x);
    assert.equal(awal.z, n.jalur[0].z);

    const akhir = posisiNpc(n, panjangJalur(n.jalur) / n.kecepatan);
    const titikAkhir = n.jalur[n.jalur.length - 1];
    assert.ok(Math.abs(akhir.x - titikAkhir.x) < 1e-6);
    assert.ok(Math.abs(akhir.z - titikAkhir.z) < 1e-6);
  }
});

test("NPC selalu berada di baseplate dan di atas jalur", () => {
  for (const n of NPC) {
    for (let t = 0; t < 60; t += 0.5) {
      const p = posisiNpc(n, t);
      assert.ok(p.x >= 0 && p.x < UKURAN_KOTA.w, `${n.id} keluar baseplate x=${p.x}`);
      assert.ok(p.z >= 0 && p.z < UKURAN_KOTA.d, `${n.id} keluar baseplate z=${p.z}`);
      assert.equal(warnaBaseplate(Math.floor(p.x), Math.floor(p.z)), "tinta", `${n.id} keluar jalur di ${p.x},${p.z}`);
    }
  }
});
