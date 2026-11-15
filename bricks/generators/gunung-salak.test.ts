import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGunungSalak } from "./gunung-salak";
import { validate } from "../validate";

test("Gunung Salak lolos validasi", () => {
  const hasil = validate(buildGunungSalak(), 400);
  assert.equal(hasil.ok, true, hasil.errors.join("; "));
});

test("Gunung Salak deterministik", () => {
  assert.deepEqual(buildGunungSalak(), buildGunungSalak());
});
