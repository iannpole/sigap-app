import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTuguKujang } from "./tugu-kujang";
import { validate } from "../validate";

test("Tugu Kujang lolos validasi dengan statistik yang diharapkan", () => {
  const bricks = buildTuguKujang();
  const hasil = validate(bricks, 400);
  assert.equal(hasil.ok, true, hasil.errors.join("; "));
  assert.deepEqual(hasil.stats, { brick: 149, stud: 225, layer: 22 });
});

test("generator deterministik", () => {
  assert.deepEqual(buildTuguKujang(), buildTuguKujang());
});

test("validator menangkap brick yang melayang", () => {
  const bricks = buildTuguKujang();
  const tanpaAlas = bricks.filter((b) => !(b.y === 1 && b.x === 6 && b.z === 6));
  const hasil = validate(tanpaAlas, 400);
  assert.equal(hasil.ok, false);
  assert.ok(hasil.errors.some((e) => e.startsWith("melayang")));
});
