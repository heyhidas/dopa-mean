import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanSource, ROOT } from "./scan";

// Ratchet: UI copy avoids en and em dashes. Existing copy is grandfathered in
// dash-baseline.json; counts may fall, never rise. Regenerate with UPDATE_DASH_BASELINE=1.
const BASELINE = join(ROOT, "src/test/dash-baseline.json");
const count = (s: string) => (s.match(/[–—]/g) ?? []).length;

function current(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const f of scanSource()) {
    if (f.file === "src/test/scan.ts") continue;
    const n = f.strings.reduce((t, s) => t + count(s), 0);
    if (n > 0) out[f.file] = n;
  }
  const n = count(readFileSync(join(ROOT, "index.html"), "utf8"));
  if (n > 0) out["index.html"] = n;
  return out;
}

describe("dash ratchet", () => {
  if (process.env.UPDATE_DASH_BASELINE) {
    it("writes the baseline", () => {
      writeFileSync(BASELINE, JSON.stringify(current(), null, 2) + "\n");
    });
    return;
  }

  it("never adds en or em dashes to UI copy", () => {
    const base: Record<string, number> = JSON.parse(readFileSync(BASELINE, "utf8"));
    const now = current();
    const worse = Object.entries(now).filter(([f, n]) => n > (base[f] ?? 0)).map(([f, n]) => `${f}: ${n} > ${base[f] ?? 0}`);
    expect(worse, "Use a comma, colon or period instead of a dash.").toEqual([]);
    const better = Object.entries(base).filter(([f, n]) => (now[f] ?? 0) < n);
    if (better.length) console.log("Dashes dropped; lower src/test/dash-baseline.json:", better.map(([f]) => f).join(", "));
  });
});
