import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; // sb_publishable_..., safe to ship

// Anonymous counter only: no sessions, no token refresh timers, no URL parsing.
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : null;

export async function getInstallationCount(): Promise<number | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc("get_installation_count");
    if (error || typeof data !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

const INSTALL_KEY = "dopamean_tracked";

export async function trackInstallation(): Promise<void> {
  if (!supabase) return;
  if (localStorage.getItem(INSTALL_KEY)) return;
  try {
    const { error } = await supabase.rpc("increment_installations");
    if (!error) localStorage.setItem(INSTALL_KEY, "1");
  } catch {
    // silently fail
  }
}
