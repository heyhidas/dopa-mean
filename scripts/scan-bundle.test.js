import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { scanText } from "./scan-bundle.js";

const seg = "abcdefgh12345678";
const hits = {
  "Supabase secret key": "sb_secret_" + "a".repeat(20),
  JWT: `eyJ${seg}.eyJ${seg}.${seg}`,
  service_role: "x service_role y",
  "private key block": "-----BEGIN RSA PRIVATE KEY-----",
  SUPABASE_SERVICE: "process.env.SUPABASE_SERVICE_KEY",
};

describe("scanText", () => {
  it.each(Object.entries(hits))("flags %s", (rule, text) => {
    expect(scanText(text)).toContain(rule);
  });
  it("passes clean code and a publishable key", () => {
    expect(scanText("const a = 1; // sb_publishable_abc123")).toEqual([]);
  });
});

describe("CLI", () => {
  const dirs = [];
  const run = (files, ...args) => {
    const dir = mkdtempSync(join(tmpdir(), "scan-"));
    dirs.push(dir);
    for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
    return spawnSync("node", ["scripts/scan-bundle.js", dir, ...args], { encoding: "utf8" });
  };
  afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

  it("fails without echoing the secret", () => {
    const r = run({ "a.js": hits["Supabase secret key"] });
    expect(r.status).toBe(1);
    expect(r.stderr).not.toContain("aaaaaaaaaa");
  });
  it("passes a clean bundle with a publishable key under --expect-publishable", () => {
    expect(run({ "a.js": "k='sb_publishable_x'" }, "--expect-publishable").status).toBe(0);
  });
  it("fails under --expect-publishable when the key is missing", () => {
    expect(run({ "a.js": "ok" }, "--expect-publishable").status).toBe(1);
  });
});
