import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { escapeHtml, replaceOnce, validateApp, renderOpenPage, renderManifest } from "./open-pages.js";

const base = readFileSync("index.html", "utf8");
const registry = JSON.parse(readFileSync("src/data/registry.json", "utf8"));
const app = (id) => registry.find((a) => a.id === id);
const golden = (id) => readFileSync(`scripts/__fixtures__/${id}.manifest.json`, "utf8");

describe("renderOpenPage", () => {
  it("sets all five tags on the real index.html", () => {
    const html = renderOpenPage(base, app("instagram"));
    expect(html).toContain("<title>Instagram</title>");
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="Instagram" />');
    expect(html).toContain('<meta name="theme-color" content="#E1306C" />');
    expect(html).toContain('<link rel="manifest" href="/open/instagram/manifest.json" />');
    expect(html).toContain('<link rel="apple-touch-icon" href="/icons/instagram.png" />');
  });

  it("escapes hostile names and keeps $ patterns inert", () => {
    const name = `"><script>alert(1)</script> $& $' $1`;
    const html = renderOpenPage(base, { ...app("instagram"), name });
    expect(html).not.toContain("<script>alert(1)");
    expect(html).toContain(escapeHtml(name));
    expect(html).toContain("$&amp;");
  });
});

describe("replaceOnce", () => {
  it("throws when the tag is missing", () => {
    expect(() => replaceOnce("<p></p>", /<title>[^<]*<\/title>/, "x", "title")).toThrow("title: expected 1 match, found 0");
  });

  it("throws when the tag is duplicated, even with a non-g regex", () => {
    const html = "<title>a</title><title>b</title>";
    expect(() => replaceOnce(html, /<title>[^<]*<\/title>/, "x", "title")).toThrow("found 2");
  });
});

describe("renderManifest", () => {
  it.each(["instagram", "twitch"])("matches the golden manifest for %s", (id) => {
    expect(renderManifest(app(id))).toBe(golden(id));
  });
});

describe("validateApp", () => {
  const ok = app("instagram");
  it("accepts a registry entry", () => expect(() => validateApp(ok)).not.toThrow());
  it.each([
    [{ ...ok, id: "../x" }],
    [{ ...ok, id: "Instagram" }],
    [{ ...ok, color: "red" }],
    [{ ...ok, url: "http://x" }],
  ])("rejects %j", (bad) => expect(() => validateApp(bad)).toThrow());
});
