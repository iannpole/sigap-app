import { test } from "node:test";
import assert from "node:assert/strict";
import { MODEL } from "./index";
import { validate } from "../validate";

for (const m of MODEL) {
  test(`${m.nama} lolos validasi dan di bawah anggaran ${m.anggaran}`, () => {
    const hasil = validate(m.build(), m.anggaran);
    assert.equal(hasil.ok, true, hasil.errors.slice(0, 10).join("; "));
  });
}
