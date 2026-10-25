import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import registry from "./registry.json";
import { socialApps, getApp, SocialApp } from "./apps";

const ids = ["instagram", "tiktok", "x", "reddit", "snapchat", "facebook", "youtube", "threads", "discord", "twitch"];
const pngIds = (dir: string) => readdirSync(dir).filter((f) => f.endsWith(".png")).map((f) => f.replace(".png", "")).sort();

describe("socialApps", () => {
  it("is exactly the 10 registry apps, in order", () => {
    expect(socialApps.map((a) => a.id)).toEqual(ids);
  });

  it("each app has required fields", () => {
    socialApps.forEach((app: SocialApp) => {
      expect(app.name).toBeTruthy();
      expect(app.icon).toBeTruthy();
      expect(app.iconAndroid).toBeTruthy();
      expect(app.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(app.url).toMatch(/^https:\/\//);
    });
  });

  it("has unique ids", () => {
    expect(new Set(registry.map((a) => a.id)).size).toBe(registry.length);
  });

  it("registry and icon files match both ways", () => {
    const expected = [...ids].sort();
    for (const dir of ["src/assets/icons/ios", "src/assets/icons/android", "public/icons"]) {
      expect(pngIds(dir), dir).toEqual(expected);
    }
  });

  it("getApp matches exact ids only", () => {
    expect(getApp("instagram")).toBeDefined();
    expect(getApp("linkedin")).toBeUndefined();
    expect(getApp("Instagram")).toBeUndefined();
    expect(getApp(undefined)).toBeUndefined();
  });
});
