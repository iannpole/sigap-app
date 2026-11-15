import { test } from "node:test";
import assert from "node:assert/strict";
import { buildKebunRaya } from "./kebun-raya";
import { validate } from "../validate";

test("Kebun Raya lolos validasi", () => {
  const hasil = validate(buildKebunRaya(), 400);
  assert.equal(hasil.ok, true, hasil.errors.join("; "));
});

test("Kebun Raya deterministik", () => {
  assert.deepEqual(buildKebunRaya(), buildKebunRaya());
});
