import { test } from "node:test";
import assert from "node:assert/strict";
import { sisaJatuh } from "./anim";

test("di akhir animasi semua layer sudah di posisi", () => {
  for (let layer = 0; layer < 20; layer++) {
    assert.equal(sisaJatuh(layer, 20, 1), 0);
  }
});

test("di awal semua layer masih di atas", () => {
  for (let layer = 0; layer < 20; layer++) {
    assert.equal(sisaJatuh(layer, 20, 0), 1);
  }
});

test("layer atas mulai jatuh setelah layer bawah", () => {
  assert.ok(sisaJatuh(0, 20, 0.3) < 1);
  assert.equal(sisaJatuh(19, 20, 0.3), 1);
});
