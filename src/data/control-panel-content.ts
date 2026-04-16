import type { CSSProperties } from "react";
import { OWNER, PROJECTS } from "@/data/portfolio-content";
import { XP_ICONS } from "@/lib/xp-icons";

/** System / registration copy for Control Panel applets */
export const CP_SYSTEM = {
  name: OWNER.displayName,
  os: "Windows XP — Portfolio Edition (browser shell)",
  processor: "Intel Core i3 (6th gen)",
  ram: "16 GB (simulated)",
  gpu: "Ampere-class edge GPU (simulated)",
  storage: "NVMe SSD (your device)",
  org: OWNER.college,
  registered: "India",
} as const;

export const CP_SKILLS: Record<string, { name: string; pct: number }[]> = {
  "Programming Languages": [
    { name: "Python", pct: 90 },
    { name: "C / C++", pct: 82 },
    { name: "JavaScript / TypeScript", pct: 85 },
    { name: "HTML & CSS", pct: 88 },
    { name: "Bash / Shell", pct: 72 },
  ],
  "Robotics & AI": [
    { name: "ROS 2", pct: 80 },
    { name: "Autonomous navigation", pct: 88 },
    { name: "SLAM", pct: 78 },
    { name: "Sensor fusion", pct: 85 },
    { name: "Computer vision (OpenCV)", pct: 80 },
  ],
  "Hardware & Embedded": [
    { name: "Jetson / edge Linux", pct: 88 },
    { name: "CubePilot / Pixhawk", pct: 85 },
    { name: "LiDAR & cameras", pct: 82 },
    { name: "Multirotor bring-up", pct: 86 },
  ],
  "Tools": [
    { name: "Linux / Ubuntu", pct: 88 },
    { name: "Git / GitHub", pct: 85 },
    { name: "Docker", pct: 70 },
    { name: "QGroundControl / MAVLink", pct: 82 },
  ],
};

export const CP_PROGRAMS = PROJECTS.map((p) => ({
  ico: XP_ICONS.folder,
  name: p.title,
  type: p.short,
  size: "~—",
  date: p.status,
}));

/**
 * Windows XP Luna–style wallpaper names (search: “Windows XP Bliss”, “XP Azul wallpaper”, etc.).
 * Assets live in `public/wallpapers/` (PNG from your Reddit / full-res pack + a few JPG placeholders).
 */
export const CP_WALLPAPERS = [
  {
    name: "Bliss",
    css: "linear-gradient(175deg,#4870B8 0%,#84B8EC 50%,#C4EAF8 100%)",
    imageUrl: "/wallpapers/bliss.png",
  },
  {
    name: "Autumn",
    css: "linear-gradient(160deg,#8B4513 0%,#CD853F 50%,#F4A460 100%)",
    imageUrl: "/wallpapers/autumn.png",
  },
  {
    name: "Azul",
    css: "linear-gradient(180deg,#006994 0%,#0099CC 50%,#00BFFF 100%)",
    imageUrl: "/wallpapers/azul.png",
  },
  {
    name: "Crystal",
    css: "linear-gradient(145deg,#0d3d2a 0%,#1e6b4a 40%,#3d8f6a 100%)",
    imageUrl: "/wallpapers/crystal.png",
  },
  {
    name: "Friend",
    css: "linear-gradient(180deg,#001a33 0%,#003366 50%,#006699 100%)",
    imageUrl: "/wallpapers/friend.png",
  },
  {
    name: "Home",
    css: "linear-gradient(160deg,#4a3728 0%,#6b5344 50%,#8b7355 100%)",
    imageUrl: "/wallpapers/home.png",
  },
  {
    name: "Moon Flower",
    css: "linear-gradient(180deg,#1a4a6e 0%,#2a6a9e 50%,#4a9ece 100%)",
    imageUrl: "/wallpapers/moon-flower.png",
  },
  {
    name: "Radiance",
    css: "linear-gradient(175deg,#0067a3 0%,#0099cc 45%,#66d9ff 100%)",
    imageUrl: "/wallpapers/radiance.png",
  },
  {
    name: "Serenity",
    css: "linear-gradient(180deg,#0a1628 0%,#1a3a58 50%,#2a5a88 100%)",
    imageUrl: "/wallpapers/serenity.png",
  },
  {
    name: "Stonehenge",
    css: "linear-gradient(160deg,#2a3a1a 0%,#4a6a2a 50%,#6a9a4a 100%)",
    imageUrl: "/wallpapers/stonehenge.jpg",
  },
  {
    name: "Vortec Space",
    css: "linear-gradient(180deg,#000010 0%,#0a0a28 40%,#1a1a48 100%)",
    imageUrl: "/wallpapers/vortec.jpg",
  },
  {
    /** Birmingham Bullring — searchable as “Selfridges Birmingham discs building” */
    name: "Selfridges",
    css: "linear-gradient(135deg,#1a4a7a 0%,#3a6a9a 45%,#c0d0e0 100%)",
    imageUrl: "/wallpapers/selfridges.png",
  },
] as const;

export type CpWallpaper = (typeof CP_WALLPAPERS)[number];

/** Swatch / preview — full-bleed photo; `css` is only a fallback if `imageUrl` is missing. */
export function wallpaperPreviewStyle(w: {
  css: string;
  imageUrl?: string;
}): CSSProperties {
  if (w.imageUrl) {
    return {
      backgroundImage: `url('${w.imageUrl}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundImage: w.css, backgroundSize: "cover" };
}

export const CP_ACCENT_COLORS = [
  "#316AC5",
  "#CC4444",
  "#44AA44",
  "#8855BB",
  "#DD8800",
  "#008888",
  "#CC44AA",
  "#666666",
];

/** Category View rows — order matches classic XP "Pick a category" screen */
export type CpAppletId =
  | "display"
  | "printers"
  | "network"
  | "user"
  | "addremove"
  | "datetime"
  | "sounds"
  | "access"
  | "system"
  | "skills";

export const CP_CATEGORY_ROWS: {
  title: string;
  icon: string;
  applet: CpAppletId;
  subs: { label: string; applet: CpAppletId; tab?: number }[];
}[] = [
  {
    title: "Appearance and Themes",
    icon: XP_ICONS.displayProperties,
    applet: "display",
    subs: [
      { label: "Change the desktop background", applet: "display", tab: 0 },
      { label: "Choose a screen saver", applet: "display", tab: 1 },
      { label: "Change the color scheme", applet: "display", tab: 2 },
    ],
  },
  {
    title: "Printers and Other Hardware",
    icon: XP_ICONS.printer,
    applet: "printers",
    subs: [
      { label: "View installed printers", applet: "printers" },
      { label: "Add hardware", applet: "printers" },
    ],
  },
  {
    title: "Network and Internet Connections",
    icon: XP_ICONS.networkConnection,
    applet: "network",
    subs: [
      { label: "Set up or change your Internet connection", applet: "network" },
      { label: "View network status", applet: "network" },
    ],
  },
  {
    title: "User Accounts",
    icon: XP_ICONS.userAccounts,
    applet: "user",
    subs: [
      { label: "Change an account", applet: "user", tab: 0 },
      { label: "Change the way users log on or off", applet: "user", tab: 1 },
    ],
  },
  {
    title: "Add or Remove Programs",
    icon: XP_ICONS.programs,
    applet: "addremove",
    subs: [
      { label: "Install or uninstall programs", applet: "addremove" },
      { label: "Add/Remove Windows Components", applet: "addremove", tab: 2 },
    ],
  },
  {
    title: "Date, Time, Language, and Regional Options",
    icon: XP_ICONS.dateTime,
    applet: "datetime",
    subs: [{ label: "Change the date and time", applet: "datetime" }],
  },
  {
    title: "Sounds, Speech, and Audio Devices",
    icon: XP_ICONS.volume,
    applet: "sounds",
    subs: [
      { label: "Adjust system volume", applet: "sounds" },
      { label: "Change the sound scheme", applet: "sounds", tab: 1 },
    ],
  },
  {
    title: "Accessibility Options",
    icon: XP_ICONS.accessibility,
    applet: "access",
    subs: [{ label: "Adjust for vision, hearing, and mobility", applet: "access" }],
  },
  {
    title: "Performance and Maintenance",
    icon: XP_ICONS.performance,
    applet: "system",
    subs: [
      { label: "View basic system information", applet: "system" },
      { label: "Adjust visual effects", applet: "system", tab: 1 },
    ],
  },
  {
    title: "Skills & Technologies",
    icon: XP_ICONS.systemProperties,
    applet: "skills",
    subs: [
      { label: "View installed skills and proficiency", applet: "skills", tab: 0 },
      { label: "Browse tools & technologies", applet: "skills", tab: 3 },
    ],
  },
];

export const CP_CLASSIC_APPLETS: { ico: string; name: string; id: CpAppletId }[] = [
  { ico: XP_ICONS.displayProperties, name: "Display", id: "display" },
  { ico: XP_ICONS.printer, name: "Printers and Faxes", id: "printers" },
  { ico: XP_ICONS.networkConnection, name: "Network Connections", id: "network" },
  { ico: XP_ICONS.volume, name: "Sounds and Audio", id: "sounds" },
  { ico: XP_ICONS.systemProperties, name: "System", id: "system" },
  { ico: XP_ICONS.programs, name: "Add or Remove Programs", id: "addremove" },
  { ico: XP_ICONS.userAccounts, name: "User Accounts", id: "user" },
  { ico: XP_ICONS.dateTime, name: "Date and Time", id: "datetime" },
  { ico: XP_ICONS.accessibility, name: "Accessibility Options", id: "access" },
  { ico: XP_ICONS.performance, name: "Skills", id: "skills" },
];
