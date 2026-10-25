import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import registry from "@/data/registry.json";
import { GITHUB_URL } from "@/data/constants";
import Intercept from "@/pages/Intercept";
import { ROOT } from "./scan";

// Neutral facts so the check covers product UI, not the editorial quotes.
vi.mock("@/data/facts", () => ({ facts: ["Take a slow breath.", "Notice your shoulders.", "Look away from the screen."] }));

const BANNED = /\b(upgrade|premium|buy|purchase|donate|support|tip|subscribe|unlock)/i;
const ALLOWED_LINKS = new Set(["/", GITHUB_URL, ...registry.map((a) => a.url)]);

const ids = [...registry.map((a) => a.id), "not-an-app"];

describe("pause screens carry no upsell", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("the /open routes in App.tsx are exactly the one rendered here", () => {
    const app = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
    expect([...app.matchAll(/path="(\/open[^"]*)"/g)].map((m) => m[1])).toEqual(["/open/:appId"]);
  });

  const cases = ids.flatMap((id) => [`/open/${id}`, `/open/${id}?setup=1`]);
  it.each(cases)("%s: no upsell wording and only allowed links, running and done", (url) => {
    const { container } = render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/open/:appId" element={<Intercept />} />
        </Routes>
      </MemoryRouter>
    );
    for (const phase of ["running", "done"]) {
      if (phase === "done") act(() => { vi.advanceTimersByTime(30000); });
      expect(container.textContent ?? "", `${url} ${phase}`).not.toMatch(BANNED);
      const bad = [...container.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")!).filter((h) => !ALLOWED_LINKS.has(h));
      expect(bad, `${url} ${phase}`).toEqual([]);
    }
  });
});
