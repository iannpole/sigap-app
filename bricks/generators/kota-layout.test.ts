import { test } from "node:test";
import assert from "node:assert/strict";
import { PENEMPATAN, validasiPenempatan } from "./kota-layout";
import { buildKotaSigap } from "./kota-sigap";
import { validate } from "../validate";

test("semua aset berada di baseplate dan tidak saling bertabrakan", () => {
  assert.deepEqual(validasiPenempatan(), []);
});

test("id penempatan unik", () => {
  assert.equal(new Set(PENEMPATAN.map((p) => p.id)).size, PENEMPATAN.length);
});

test("Kota SIGAP lolos validasi dan anggaran scene", () => {
  const hasil = validate(buildKotaSigap(), 4000);
  assert.equal(hasil.ok, true, hasil.errors.slice(0, 10).join("; "));
});
