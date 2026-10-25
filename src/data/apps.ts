import registry from "./registry.json";

const byName = (files: Record<string, string>) =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split("/").pop()!.replace(".png", ""), url]));

const iosIcons = byName(import.meta.glob("@/assets/icons/ios/*.png", { eager: true, import: "default" }));
const androidIcons = byName(import.meta.glob("@/assets/icons/android/*.png", { eager: true, import: "default" }));

export type Platform = "ios" | "android" | "other";

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

export interface SocialApp {
  id: string;
  name: string;
  icon: string;
  iconIos: string;
  iconAndroid: string;
  color: string;
  url: string;
}

export const socialApps: SocialApp[] = registry.map((a) => {
  const iconIos = iosIcons[a.id];
  const iconAndroid = androidIcons[a.id];
  if (!iconIos || !iconAndroid) throw new Error(`Missing icon for registry app "${a.id}"`);
  return { ...a, icon: iconIos, iconIos, iconAndroid };
});

export const getApp = (id: string | undefined): SocialApp | undefined =>
  socialApps.find((a) => a.id === id);
