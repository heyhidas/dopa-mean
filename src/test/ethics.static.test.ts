import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import registry from "@/data/registry.json";
import { scanSource, ROOT } from "./scan";

const files = scanSource();
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

// Editorial pages quote the research on streaks, badges and points; they are not product UI.
const EDITORIAL = new Set(["src/data/facts.ts", "src/pages/Why.tsx", "src/pages/CaseStudy.tsx"]);

// Every host the shipped source may mention. Add a host here only on purpose.
const ALLOWED_HOSTS = new Set([
  "dopamean.hidas.dev", // the site itself
  "github.com", // source repository link (path checked below)
  "ko-fi.com", // home page support link
  "www.producthunt.com", // home page rating link
  ...registry.map((a) => new URL(a.url).host), // the apps a pause leads to
]);

describe("no tracking or engagement mechanics", () => {
  it("never uses notification or push APIs", () => {
    const banned = new Set(["Notification", "PushManager", "pushManager", "requestPermission"]);
    const hits = files.flatMap((f) => f.identifiers.filter((i) => banned.has(i)).map((i) => `${f.file}: ${i}`));
    expect(hits).toEqual([]);
  });

  it("has no analytics or ad SDKs in package.json", () => {
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const bad = /google-analytics|react-ga|gtag|mixpanel|@segment|posthog|amplitude|hotjar|@sentry|facebook-pixel|adsense/;
    expect(deps.filter((d) => bad.test(d))).toEqual([]);
  });

  it("loads scripts in index.html only from the allowlist", () => {
    const html = readFileSync(join(ROOT, "index.html"), "utf8");
    const hosts = [...html.matchAll(/<script[^>]*\ssrc=["']https?:\/\/([^/"']+)/g)].map((m) => m[1]);
    const allowed = ["static.cloudflareinsights.com"]; // existing privacy-friendly page-view counter
    expect(hosts.filter((h) => !allowed.includes(h))).toEqual([]);
  });

  it("mentions only allowlisted hosts in source strings", () => {
    const hits: string[] = [];
    for (const f of files) {
      for (const s of f.strings) {
        for (const m of s.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)([^\s"']*)/g)) {
          const host = m[1];
          const ok = ALLOWED_HOSTS.has(host) || host.endsWith(".supabase.co");
          const gh = host !== "github.com" || m[2].startsWith("/heyhidas/");
          if (!ok || !gh) hits.push(`${f.file}: ${m[0]}`);
        }
      }
    }
    expect(hits).toEqual([]);
  });

  it("has no engagement words in product UI strings", () => {
    const re = /\b(streaks?|badges?|leaderboards?|time saved|points)\b/i;
    const hits = files
      .filter((f) => !EDITORIAL.has(f.file))
      .flatMap((f) => f.strings.filter((s) => re.test(s)).map((s) => `${f.file}: ${s.trim().slice(0, 40)}`));
    expect(hits).toEqual([]);
  });
});
