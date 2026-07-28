import { describe, it, expect } from "vitest";
import { socialApps, SocialApp } from "./apps";

describe("socialApps", () => {
  it("exports an array of 10 social apps", () => {
    expect(socialApps).toHaveLength(10);
  });

  it("each app has required fields", () => {
    socialApps.forEach((app: SocialApp) => {
      expect(app.id).toBeTruthy();
      expect(app.name).toBeTruthy();
      expect(app.icon).toBeTruthy();
      expect(app.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(app.url).toMatch(/^https:\/\//);
    });
  });

  it("has unique ids", () => {
    const ids = socialApps.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains expected platforms", () => {
    const ids = socialApps.map((a) => a.id);
    expect(ids).toContain("instagram");
    expect(ids).toContain("tiktok");
    expect(ids).toContain("x");
    expect(ids).toContain("reddit");
    expect(ids).toContain("snapchat");
    expect(ids).toContain("facebook");
    expect(ids).toContain("youtube");
    expect(ids).toContain("threads");
    expect(ids).toContain("linkedin");
  });
});
