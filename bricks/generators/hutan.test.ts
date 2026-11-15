import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHutan } from "./hutan";
import { validate } from "../validate";

test("hutan lolos validasi dengan 16 pohon", () => {
  const bricks = buildHutan();
  const hasil = validate(bricks, 400);
  assert.equal(hasil.ok, true, hasil.errors.join("; "));
  assert.equal(bricks.filter((b) => b.warna === "tinta").length, 16);
});
