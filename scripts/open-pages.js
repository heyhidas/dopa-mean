// Pure helpers for the post-build page generator (no file or process access).

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function replaceOnce(html, regex, replacement, label) {
  const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
  const n = (html.match(new RegExp(regex.source, flags)) || []).length;
  if (n !== 1) throw new Error(`${label}: expected 1 match, found ${n}`);
  return html.replace(regex, () => replacement);
}

export function validateApp(app) {
  if (!app || typeof app.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(app.id)) {
    throw new Error(`Invalid app id: ${JSON.stringify(app && app.id)}`);
  }
  if (typeof app.name !== "string" || app.name.trim() === "") {
    throw new Error(`Invalid name for app "${app.id}"`);
  }
  if (typeof app.color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(app.color)) {
    throw new Error(`Invalid color for app "${app.id}": ${JSON.stringify(app.color)}`);
  }
  if (typeof app.url !== "string" || !app.url.startsWith("https://")) {
    throw new Error(`Invalid url for app "${app.id}": ${JSON.stringify(app.url)}`);
  }
}

export function renderOpenPage(baseHtml, app) {
  const name = escapeHtml(app.name);
  let html = baseHtml;
  html = replaceOnce(
    html,
    /<meta name="apple-mobile-web-app-title" content="[^"]*" \/>/,
    `<meta name="apple-mobile-web-app-title" content="${name}" />`,
    "apple-mobile-web-app-title"
  );
  html = replaceOnce(html, /<meta name="theme-color" content="[^"]*" \/>/, `<meta name="theme-color" content="${app.color}" />`, "theme-color");
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${name}</title>`, "title");
  html = replaceOnce(html, /<link rel="manifest" href="[^"]*" \/>/, `<link rel="manifest" href="/open/${app.id}/manifest.json" />`, "manifest link");
  html = replaceOnce(html, /<link rel="apple-touch-icon"[^>]*>/, `<link rel="apple-touch-icon" href="/icons/${app.id}.png" />`, "apple-touch-icon");
  return html;
}

export function renderManifest(app) {
  return JSON.stringify(
    {
      id: `/open/${app.id}`,
      name: app.name,
      short_name: app.name,
      description: `Mindful pause before opening ${app.name}`,
      start_url: `/open/${app.id}`,
      scope: `/open/${app.id}`,
      display: "standalone",
      background_color: app.color,
      theme_color: app.color,
      icons: [{ src: `/icons/${app.id}.png`, sizes: "512x512", type: "image/png", purpose: "any" }],
    },
    null,
    2
  );
}
