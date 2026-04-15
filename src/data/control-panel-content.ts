import { OWNER, PROJECTS } from "@/data/portfolio-content";

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
  ico: "📁",
  name: p.title,
  type: p.short,
  size: "~—",
  date: p.status,
}));

export const CP_WALLPAPERS = [
  {
    name: "Bliss",
    css: "linear-gradient(175deg,#4870B8 0%,#84B8EC 50%,#C4EAF8 100%)",
    /** Full desktop uses photo; Control Panel preview uses `css` */
    imageUrl: "/wallpapers/bliss.jpg",
  },
  { name: "Autumn", css: "linear-gradient(160deg,#8B4513 0%,#CD853F 50%,#F4A460 100%)" },
  { name: "Space", css: "linear-gradient(180deg,#000 0%,#0D0D2B 50%,#1A1A4B 100%)" },
  { name: "Forest", css: "linear-gradient(160deg,#1A4A1A 0%,#2D7A2D 50%,#5AB55A 100%)" },
  { name: "Ocean", css: "linear-gradient(180deg,#006994 0%,#0099CC 50%,#00BFFF 100%)" },
];

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

/** Category View rows — order matches classic XP “Pick a category” screen */
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
  emoji: string;
  applet: CpAppletId;
  subs: { label: string; applet: CpAppletId; tab?: number }[];
}[] = [
  {
    title: "Appearance and Themes",
    emoji: "🎨",
    applet: "display",
    subs: [
      { label: "Change the desktop background", applet: "display", tab: 0 },
      { label: "Choose a screen saver", applet: "display", tab: 1 },
      { label: "Change the color scheme", applet: "display", tab: 2 },
    ],
  },
  {
    title: "Printers and Other Hardware",
    emoji: "🖨️",
    applet: "printers",
    subs: [
      { label: "View installed printers", applet: "printers" },
      { label: "Add hardware", applet: "printers" },
    ],
  },
  {
    title: "Network and Internet Connections",
    emoji: "🌐",
    applet: "network",
    subs: [
      { label: "Set up or change your Internet connection", applet: "network" },
      { label: "View network status", applet: "network" },
    ],
  },
  {
    title: "User Accounts",
    emoji: "👤",
    applet: "user",
    subs: [
      { label: "Change an account", applet: "user", tab: 0 },
      { label: "Change the way users log on or off", applet: "user", tab: 1 },
    ],
  },
  {
    title: "Add or Remove Programs",
    emoji: "📦",
    applet: "addremove",
    subs: [
      { label: "Install or uninstall programs", applet: "addremove" },
      { label: "Add/Remove Windows Components", applet: "addremove", tab: 2 },
    ],
  },
  {
    title: "Date, Time, Language, and Regional Options",
    emoji: "🕐",
    applet: "datetime",
    subs: [{ label: "Change the date and time", applet: "datetime" }],
  },
  {
    title: "Sounds, Speech, and Audio Devices",
    emoji: "🔊",
    applet: "sounds",
    subs: [
      { label: "Adjust system volume", applet: "sounds" },
      { label: "Change the sound scheme", applet: "sounds", tab: 1 },
    ],
  },
  {
    title: "Accessibility Options",
    emoji: "♿",
    applet: "access",
    subs: [{ label: "Adjust for vision, hearing, and mobility", applet: "access" }],
  },
  {
    title: "Performance and Maintenance",
    emoji: "📊",
    applet: "system",
    subs: [
      { label: "View basic system information", applet: "system" },
      { label: "Adjust visual effects", applet: "system", tab: 1 },
    ],
  },
  {
    title: "Skills & Technologies",
    emoji: "⭐",
    applet: "skills",
    subs: [
      { label: "View installed skills and proficiency", applet: "skills", tab: 0 },
      { label: "Browse tools & technologies", applet: "skills", tab: 3 },
    ],
  },
];

export const CP_CLASSIC_APPLETS: { ico: string; name: string; id: CpAppletId }[] = [
  { ico: "🎨", name: "Display", id: "display" },
  { ico: "🖨️", name: "Printers and Faxes", id: "printers" },
  { ico: "🌐", name: "Network Connections", id: "network" },
  { ico: "🔊", name: "Sounds and Audio", id: "sounds" },
  { ico: "💻", name: "System", id: "system" },
  { ico: "📦", name: "Add or Remove Programs", id: "addremove" },
  { ico: "👤", name: "User Accounts", id: "user" },
  { ico: "🕐", name: "Date and Time", id: "datetime" },
  { ico: "♿", name: "Accessibility Options", id: "access" },
  { ico: "⭐", name: "Skills", id: "skills" },
];
