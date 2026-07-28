#!/usr/bin/env node
// Post-build script: generates /open/{appId}/index.html files in dist/
// by injecting per-app meta tags into the built dist/index.html.
// Run after `vite build`.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");

const apps = [
  { id: "instagram", name: "Instagram", color: "#E1306C" },
  { id: "tiktok",    name: "TikTok",    color: "#000000" },
  { id: "x",         name: "X",         color: "#000000" },
  { id: "reddit",    name: "Reddit",    color: "#FF4500" },
  { id: "snapchat",  name: "Snapchat",  color: "#FFFC00" },
  { id: "facebook",  name: "Facebook",  color: "#1877F2" },
  { id: "youtube",   name: "YouTube",   color: "#FF0000" },
  { id: "threads",   name: "Threads",   color: "#000000" },
  { id: "discord",   name: "Discord",   color: "#5865F2" },
  { id: "linkedin",  name: "LinkedIn",  color: "#0A66C2" },
  { id: "twitch",    name: "Twitch",    color: "#9146FF" },
];

const base = readFileSync(join(distDir, "index.html"), "utf8");

for (const app of apps) {
  // Replace the generic meta tags with per-app values
  let html = base
    .replace(
      /<meta name="apple-mobile-web-app-title" content="[^"]*" \/>/,
      `<meta name="apple-mobile-web-app-title" content="${app.name}" />`
    )
    .replace(
      /<meta name="theme-color" content="[^"]*" \/>/,
      `<meta name="theme-color" content="${app.color}" />`
    )
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${app.name}</title>`
    )
    // Replace generic manifest with per-app manifest
    .replace(
      /<link rel="manifest" href="[^"]*" \/>/,
      `<link rel="manifest" href="/open/${app.id}/manifest.json" />`
    );

  // Inject apple-touch-icon after <link rel="icon" ...>
  // (replace existing one if present, or inject after rel="icon")
  if (html.includes('rel="apple-touch-icon"')) {
    html = html.replace(
      /<link rel="apple-touch-icon"[^>]*>/,
      `<link rel="apple-touch-icon" href="/icons/${app.id}.png" />`
    );
  } else {
    html = html.replace(
      /(<link rel="icon"[^>]*>)/,
      `$1\n    <link rel="apple-touch-icon" href="/icons/${app.id}.png" />`
    );
  }

  const outDir = join(distDir, "open", app.id);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);

  // Generate per-app manifest.json
  const manifest = {
    id: `/open/${app.id}`,
    name: app.name,
    short_name: app.name,
    description: `Mindful pause before opening ${app.name}`,
    start_url: `/open/${app.id}`,
    scope: `/open/${app.id}`,
    display: "standalone",
    background_color: app.color,
    theme_color: app.color,
    icons: [
      {
        src: `/icons/${app.id}.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`✓ dist/open/${app.id}/index.html + manifest.json`);
}
