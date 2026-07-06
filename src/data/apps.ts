// iOS App Store icons
import instagramIos from "@/assets/icons/ios/instagram.png";
import tiktokIos from "@/assets/icons/ios/tiktok.png";
import xIos from "@/assets/icons/ios/x.png";
import redditIos from "@/assets/icons/ios/reddit.png";
import snapchatIos from "@/assets/icons/ios/snapchat.png";
import facebookIos from "@/assets/icons/ios/facebook.png";
import youtubeIos from "@/assets/icons/ios/youtube.png";
import threadsIos from "@/assets/icons/ios/threads.png";
import discordIos from "@/assets/icons/ios/discord.png";
import twitchIos from "@/assets/icons/ios/twitch.png";

// Android Play Store icons
import instagramAndroid from "@/assets/icons/android/instagram.png";
import tiktokAndroid from "@/assets/icons/android/tiktok.png";
import xAndroid from "@/assets/icons/android/x.png";
import redditAndroid from "@/assets/icons/android/reddit.png";
import snapchatAndroid from "@/assets/icons/android/snapchat.png";
import facebookAndroid from "@/assets/icons/android/facebook.png";
import youtubeAndroid from "@/assets/icons/android/youtube.png";
import threadsAndroid from "@/assets/icons/android/threads.png";
import discordAndroid from "@/assets/icons/android/discord.png";
import twitchAndroid from "@/assets/icons/android/twitch.png";

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

export const socialApps: SocialApp[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: instagramIos,
    iconIos: instagramIos,
    iconAndroid: instagramAndroid,
    color: "#E1306C",
    url: "https://www.instagram.com",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: tiktokIos,
    iconIos: tiktokIos,
    iconAndroid: tiktokAndroid,
    color: "#000000",
    url: "https://www.tiktok.com",
  },
  {
    id: "x",
    name: "X",
    icon: xIos,
    iconIos: xIos,
    iconAndroid: xAndroid,
    color: "#000000",
    url: "https://x.com",
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: redditIos,
    iconIos: redditIos,
    iconAndroid: redditAndroid,
    color: "#FF4500",
    url: "https://www.reddit.com",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    icon: snapchatIos,
    iconIos: snapchatIos,
    iconAndroid: snapchatAndroid,
    color: "#FFFC00",
    url: "https://www.snapchat.com",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: facebookIos,
    iconIos: facebookIos,
    iconAndroid: facebookAndroid,
    color: "#1877F2",
    url: "https://www.facebook.com",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: youtubeIos,
    iconIos: youtubeIos,
    iconAndroid: youtubeAndroid,
    color: "#FF0000",
    url: "https://www.youtube.com",
  },
  {
    id: "threads",
    name: "Threads",
    icon: threadsIos,
    iconIos: threadsIos,
    iconAndroid: threadsAndroid,
    color: "#000000",
    url: "https://www.threads.com",
  },
  {
    id: "discord",
    name: "Discord",
    icon: discordIos,
    iconIos: discordIos,
    iconAndroid: discordAndroid,
    color: "#5865F2",
    url: "https://discord.com",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: twitchIos,
    iconIos: twitchIos,
    iconAndroid: twitchAndroid,
    color: "#9146FF",
    url: "https://www.twitch.tv",
  },
];
