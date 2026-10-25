import { describe, it, expect, vi, beforeEach } from "vitest";

const rpc = vi.fn();
const createClient = vi.fn(() => ({ rpc }));
vi.mock("@supabase/supabase-js", () => ({ createClient }));

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import("./supabase");
}

const ENV = { VITE_SUPABASE_URL: "https://x.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" };

describe("supabase counter client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    rpc.mockReset();
    createClient.mockClear();
    localStorage.clear();
  });

  it("is inert without env", async () => {
    const m = await load({ VITE_SUPABASE_URL: "", VITE_SUPABASE_PUBLISHABLE_KEY: "" });
    expect(m.supabase).toBeNull();
    expect(await m.getInstallationCount()).toBeNull();
    await m.trackInstallation();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("builds a session-less client with the publishable key", async () => {
    await load(ENV);
    expect(createClient).toHaveBeenCalledWith("https://x.supabase.co", "sb_publishable_test", {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  });

  it("reads the count through the RPC and tolerates errors", async () => {
    const m = await load(ENV);
    rpc.mockResolvedValueOnce({ data: 42, error: null });
    expect(await m.getInstallationCount()).toBe(42);
    expect(rpc).toHaveBeenCalledWith("get_installation_count");
    rpc.mockResolvedValueOnce({ data: null, error: { message: "no" } });
    expect(await m.getInstallationCount()).toBeNull();
    rpc.mockRejectedValueOnce(new Error("offline"));
    expect(await m.getInstallationCount()).toBeNull();
  });

  it("counts an install once and retries after a failure", async () => {
    const m = await load(ENV);
    rpc.mockResolvedValueOnce({ error: { message: "fail" } });
    await m.trackInstallation();
    expect(localStorage.getItem("dopamean_tracked")).toBeNull();
    rpc.mockResolvedValueOnce({ error: null });
    await m.trackInstallation();
    expect(localStorage.getItem("dopamean_tracked")).toBe("1");
    await m.trackInstallation();
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenCalledWith("increment_installations");
  });
});
