# Dopa-Mean

**A fake app icon that gives your brain a 30-second pause before social media.**

→ **[dopamean.hidas.dev](https://dopamean.hidas.dev)**

---

## What it does

You delete Instagram from your home screen. You install this instead.

When you tap the icon, you don't get the app. You get a 30-second countdown — same icon, same name, same color as the real thing. Your brain enters the habit loop, but instead of delivering dopamine, it delivers a pause.

After 30 seconds, you choose: continue to the app, or close it.

The placebo effect is the point. The fake icon removes the anxiety of deletion. The pause removes the automation.

## Why 30 seconds

Cravings follow a predictable curve — they peak and begin fading within 20–40 seconds if you don't act on them. The problem is we act before the urge has a chance to pass.

The pause activates the prefrontal cortex, the deliberate part of the brain that the habit bypasses entirely. Once you're conscious of the impulse, it loses most of its power.

Full science: [dopamean.hidas.dev/why](https://dopamean.hidas.dev/why)

---

## The technical trick

Each social media "fake icon" is its own isolated PWA, generated from a single codebase.

The app list lives in `src/data/registry.json`. The `scripts/gen-open-pages.js` post-build script generates app-specific HTML and manifests:

```json
// /open/instagram/manifest.json
{
  "id": "/open/instagram",
  "name": "Instagram",
  "scope": "/open/instagram",
  "start_url": "/open/instagram",
  "background_color": "#E1306C",
  "theme_color": "#E1306C",
  "icons": [{ "src": "/icons/instagram.png", "sizes": "512x512" }]
}
```

Because each manifest has its own `id` and `scope`, iOS and Android treat them as independent installed apps — each with the correct name, icon, and brand color on the home screen and in the app switcher.

**Supported apps:** Instagram · TikTok · X · Reddit · Snapchat · Facebook · YouTube · Threads · Discord · Twitch

---

## Use it

1. Go to [dopamean.hidas.dev](https://dopamean.hidas.dev)
2. Tap the app you want to intercept
3. Add it to your home screen (Safari on iOS, Chrome on Android)
4. Delete the original app (optional but recommended)

## Run locally

```bash
npm install
npm run dev       # dev server on localhost:8080
npm run build     # Vite build + generates /open/{app} pages + manifests
npm run test      # Vitest
```

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · GitHub Pages

## Contributing

Good first issues:
- **Add a new app** — add icons to `src/assets/icons/ios/` and `android/`, add an entry to `src/data/registry.json`
- **Improve accessibility** — keyboard navigation, ARIA labels on the countdown
- **Translations** — the facts database (`src/data/facts.ts`) and UI strings

## License

MIT — open source, no tracking, free forever.
