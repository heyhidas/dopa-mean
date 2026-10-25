import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const yml = readFileSync(join(process.cwd(), ".github/workflows/ci.yml"), "utf8");
const at = yml.indexOf("\n  deploy:");
const verifyJob = yml.slice(yml.indexOf("\n  verify:"), at);
const deployJob = yml.slice(at);

describe("CI workflow policy", () => {
  it("never uses pull_request_target and runs on pull_request", () => {
    expect(yml).not.toMatch(/pull_request_target/);
    expect(yml).toMatch(/^on:\n {2}pull_request:/m);
  });
  it("only the deploy job references secrets", () => {
    expect(at).toBeGreaterThan(0);
    expect(yml.slice(0, at)).not.toMatch(/\$\{\{\s*secrets\./);
    expect(deployJob).toMatch(/\$\{\{\s*secrets\./);
  });
  it("verify runs lint, typecheck, tests, build and the bundle scan", () => {
    for (const step of ["npm run lint", "npm run typecheck", "npm test", "npm run build", "npm run scan:bundle"])
      expect(verifyJob).toContain(step);
  });
  it("deploy needs verify and only runs on main outside pull requests", () => {
    expect(deployJob).toMatch(/needs: verify/);
    expect(deployJob).toMatch(/if: github\.ref == 'refs\/heads\/main' && github\.event_name != 'pull_request'/);
    expect(deployJob).toContain("--expect-publishable");
  });
  it("uses no third-party actions", () => {
    const uses = [...yml.matchAll(/uses:\s*([^\s@]+)@/g)].map((m) => m[1]);
    expect(uses.length).toBeGreaterThan(0);
    expect(uses.filter((u) => !u.startsWith("actions/"))).toEqual([]);
  });
});
