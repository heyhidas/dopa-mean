#!/usr/bin/env node
// Usage: node scripts/scan-bundle.js [dir=dist] [--expect-publishable]
// Fails when the built site contains secret-shaped strings. Never prints a full match.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

export const RULES = [
  { name: "Supabase secret key", re: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: "JWT", re: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/ },
  { name: "service_role", re: /service_role/i },
  { name: "private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "SUPABASE_SERVICE", re: /SUPABASE_SERVICE/ },
];

const TEXT_EXT = new Set([".js", ".mjs", ".css", ".html", ".json", ".map", ".txt", ".webmanifest", ".xml", ".svg"]);

export function scanText(text) {
  return RULES.filter(({ re }) => re.test(text)).map(({ name }) => name);
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (TEXT_EXT.has(extname(p).toLowerCase())) yield p;
  }
}

export function scanDir(dir, { expectPublishable = false } = {}) {
  const findings = [];
  let publishable = 0;
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    for (const rule of scanText(text)) findings.push({ file, rule });
    if (file.endsWith(".js") && text.includes("sb_publishable_")) publishable++;
  }
  if (expectPublishable && publishable === 0) {
    findings.push({ file: dir, rule: "expected an sb_publishable_ key in the JS bundle (is the build env set?)" });
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith("--")) ?? "dist";
  const findings = scanDir(dir, { expectPublishable: args.includes("--expect-publishable") });
  for (const f of findings) console.error(`SECRET SCAN FAIL: ${f.rule} in ${f.file}`);
  if (findings.length) process.exit(1);
  console.log(`secret scan ok: ${dir}`);
}
