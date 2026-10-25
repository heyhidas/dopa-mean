#!/usr/bin/env node
// Post-build script: writes dist/open/{id}/index.html and manifest.json for
// every app in src/data/registry.json, and copies dist/index.html to dist/404.html.
// Run after `vite build`.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateApp, renderOpenPage, renderManifest } from "./open-pages.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");

try {
  const base = readFileSync(join(distDir, "index.html"), "utf8");
  const apps = JSON.parse(readFileSync(join(root, "src", "data", "registry.json"), "utf8"));

  for (const app of apps) {
    validateApp(app);
    const html = renderOpenPage(base, app);
    const outDir = join(distDir, "open", app.id);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html);
    writeFileSync(join(outDir, "manifest.json"), renderManifest(app));
    console.log(`✓ dist/open/${app.id}/index.html + manifest.json`);
  }

  copyFileSync(join(distDir, "index.html"), join(distDir, "404.html"));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
