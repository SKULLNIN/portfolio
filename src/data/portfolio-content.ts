/**
 * Portfolio copy — edit links and paths here (add `public/resume.pdf` for the résumé button).
 */
export const OWNER = {
  displayName: "Laxmesh Ankola",
  title: "Robotics & Autonomous Systems",
  college: "Dr. D.Y. Patil Institute of Technology (affiliated with NMAMIT / VTU ecosystem)",
  email: "laxmeshankola@gmail.com",
  github: "https://github.com/SKULLNIN",
  linkedin: "https://www.linkedin.com/in/laxmesh-ankola-12bb03252/",
  /** Served from `public/` — rename the file here if you replace it */
  resumePdf: "/Laxmeesh-Ankola-Resume.pdf",
} as const;

export const BIO_HTML = `
<p class="lead">
  Hi — I'm <strong>${OWNER.displayName}</strong>. I build and integrate autonomous systems:
  flight stacks, perception, and field-ready software on embedded Linux.
</p>
<p>
  My work spans <strong>PX4</strong>, <strong>ROS 2</strong>, <strong>ArduPilot</strong>,
  <strong>Jetson</strong> edge compute, <strong>SLAM</strong>, and classic
  <strong>Python</strong> / <strong>C++</strong> for real-time robotics.
  I've shipped competition demos, multirotor bring-up, and hackathon integrations
  where reliability matters more than slide decks.
</p>
<p class="muted">
  This desktop is a playful portfolio shell — open <strong>My Computer</strong> for files,
  or use the <strong>Links</strong> bar below for GitHub and LinkedIn.
</p>
`.trim();

export const FILE_RESUME = `${OWNER.displayName} — Résumé (summary)
────────────────────────────────────────
${OWNER.college}

Focus: UAV / UAS software, embedded Linux, perception, field testing.

Skills
────────────────────────────────────────
• Flight: PX4, ArduPilot, CubePilot-style bring-up, tuning
• Software: ROS 2, Python, C++, QGroundControl workflows
• Edge: NVIDIA Jetson (Orin / Nano class targets)
• Perception: SLAM, OpenCV pipelines, practical YOLO deployments
• Tools: Git, CI basics, simulation (Gazebo-class), logging & replay

Competitions & highlights
────────────────────────────────────────
• Rapid integration sprints and hackathon demos (autonomy + CV stacks)
• Multirotor build & test (custom frames, payloads, safety checks)
• IIT Jodhpur OPS 2 and other competition / outreach programs (add certificate titles as you earn them)
`;

export const FILE_CONTACT = `Contact
────────────────────────────────────────
Email:    ${OWNER.email}
GitHub:   ${OWNER.github}
LinkedIn: ${OWNER.linkedin}

Best reach: email or LinkedIn — mention this portfolio if you like the XP theme.
`;

export const FILE_SKILLS = `skills.txt — Stack at a Glance
════════════════════════════════════════
Languages    Python · C/C++ · JavaScript / TypeScript
Middleware   ROS 2 · DDS Concepts · Message Bridges
Autonomy     PX4 · ArduPilot · QGroundControl · MAVLink
Hardware     Jetson Orin / Nano · CubePilot-Class FCUs · Pixhawk Family
Perception   OpenCV · SLAM (Practical Deployments) · Detector Pipelines (e.g. YOLO)
Build        CMake · colcon · Docker (Light) · Field Logging
`;

export const FILE_CERTS = `Coming soon.`;

export const FILE_PUBLICATIONS = `Coming soon.`;

export type ProjectStatus = "Completed" | "In Progress" | "Upcoming";

export type PortfolioProject = {
  id: string;
  title: string;
  short: string;
  status: ProjectStatus;
  stack: string[];
  description: string;
  githubUrl?: string;
  /** Primary image in the detail pane */
  imageSrc?: string;
  /** Lightbox title under thumbnail (defaults to project title) */
  imageCaption?: string;
  /** Extra thumbnails below the hero (e.g. CAD renders) */
  galleryImages?: { src: string; caption?: string }[];
  /** Shown as a dashed “+N” tile for additional media not listed yet */
  moreImageCount?: number;
  /** Optional clip in My Computer project detail (served from `public/`) */
  videoSrc?: string;
  videoTitle?: string;
  /** Multiple clips (preferred when a project has more than one); overrides `videoSrc` / `videoTitle` when set */
  videos?: { src: string; title: string }[];
  /** Optional schedule / milestones (e.g. competition dates) */
  timeline?: { when: string; label: string }[];
};

export const PROJECTS: PortfolioProject[] = [
  {
    id: "p1sun",
    title: "P1-Sun / SkyFall — Autonomous UAV Stack",
    short: "PX4 + ROS 2 Field Integration",
    status: "In Progress",
    stack: ["PX4", "ROS 2", "Jetson", "MAVLink", "Python"],
    description:
      "End-to-end autonomy experiments on a custom multirotor stack: flight modes, companion computer bridges, logging, and repeatable field tests. Emphasis on safe iteration and clean bring-up checklists.",
    githubUrl: OWNER.github,
    imageSrc: "/media/p1sun/cad-top-view.png",
    galleryImages: [
      { src: "/media/p1sun/cad-shell-detail.png", caption: "Shell, sensor module & battery bay" },
    ],
    moreImageCount: 1,
  },
  {
    id: "crowdsense",
    title: "CrowdSense — AI Crowd Monitoring",
    short: "Edge CV + telemetry — upcoming build",
    status: "Upcoming",
    stack: ["Python", "OpenCV", "YOLO-Class Detectors", "Jetson"],
    description:
      "Upcoming build — a prototype analytics pipeline for crowd dynamics: detection tracks, simple counting, and export hooks for downstream autonomy or logging dashboards (demo and research oriented).",
    githubUrl: "https://github.com/SKULLNIN/GNNS_drone-updated2",
    imageSrc: "/media/placeholders/crowdsense-coming-soon.svg",
    imageCaption: "CrowdSense — preview coming soon",
  },
  {
    id: "s500",
    title: "S500 Quad — Build & Tune",
    short: "Frame, ESCs, Tuning Flights",
    status: "Completed",
    stack: ["PX4", "QGroundControl", "Bench + Field Tuning"],
    description:
      "Hands-on build of an S500-class quad: assembly, ESC calibration, vibration checks, PID tuning, and incremental flight envelopes until stable hover and light waypoint tests.",
    imageSrc: "/media/s500/s500-bench-top-down.png",
    imageCaption: "S500 — bench build (Cube Orange+, frame & wiring)",
    galleryImages: [
      {
        src: "/media/s500/s500-rig-realsense.png",
        caption: "S500 — depth camera rig & landing gear",
      },
      {
        src: "/media/s500/s500-jetson-enclosure.png",
        caption: "Companion computer — Jetson (custom enclosure)",
      },
    ],
    videos: [
      {
        src: "/media/s500/VID20260323164644.mp4",
        title: "S500 — build & bench clip (Mar 2026)",
      },
    ],
  },
  {
    id: "ops2",
    title: "OPS 2 — IIT Jodhpur Entry",
    short: "IIT Jodhpur OPS-2 · Autonomy & demo flight",
    status: "In Progress",
    stack: ["ROS 2", "Python", "Integration", "Demo Flight"],
    description:
      "For our OPS-2 entry at IIT Jodhpur, we are building a time-boxed autonomous UAV demo that combines perception, decision-making, and a credible live or recorded flight showcase for the judges. The focus is on demonstrating reliable autonomy while clearly documenting failure modes and system limitations as part of a competition built around real UAV mission performance.",
    timeline: [
      {
        when: "16 May 2026",
        label: "OPS-2 competition — IIT Jodhpur (live / recorded flight showcase)",
      },
    ],
    githubUrl: "https://github.com/SKULLNIN/GNNS_drone-updated2",
    imageSrc: "/media/competition/ops2-lab-bench-cube-quad.png",
    videos: [
      {
        src: "/media/competition/ops2-iit-jodhpur-2026-04-15.mp4",
        title: "IIT Jodhpur — bench & integration clip",
      },
      {
        src: "/media/competition/ops2-jetson-mapping-orin.mp4",
        title: "Live 3D mapping / odometry — Jetson Orin Nano",
      },
    ],
  },
];

export const RECYCLE_ITEMS: { name: string; blurb: string }[] = [
  { name: "portfolio_v0.zip", blurb: "First mono-repo layout before this XP shell." },
  { name: "old_slides.ppt", blurb: "Hackathon deck — funny fonts, good story." },
  { name: "sim_world_v1.world", blurb: "Early Gazebo world — too many boxes." },
];

export const PICTURE_CAPTIONS: { src: string; caption: string }[] = [
  { src: "/media/drone/me-and-drone.png", caption: "Lab — quad build & workshop" },
  {
    src: "/media/s500/s500-bench-top-down.png",
    caption: "S500 — bench build (Cube Orange+, frame & wiring)",
  },
  {
    src: "/media/s500/s500-rig-realsense.png",
    caption: "S500 — depth camera rig & landing gear",
  },
  {
    src: "/media/s500/s500-jetson-enclosure.png",
    caption: "S500 — Jetson companion (custom enclosure)",
  },
  {
    src: "/media/competition/ops2-lab-bench-cube-quad.png",
    caption: "IIT Jodhpur — competition quad on the bench (Cube stack)",
  },
];

/** Short clips in My Pictures — served from `public/media/videos/` (native HTML5 player). */
export const PICTURE_VIDEOS: { src: string; title: string; caption?: string }[] = [
  {
    src: "/media/videos/workshop-showcase-2026-04-15.mp4",
    title: "Workshop — bench & quad",
    caption: "April 2026 · lab clip",
  },
];

export const BSOD_MESSAGE = `
A problem has been detected and Windows has been shut down to prevent damage
to your drone stack.

TECHNICAL INFORMATION:

*** STOP: 0x0000D081 (PEBKAC_NOT_FOUND)

You opened dont_open.exe. The universe had opinions.

(Press any key to return to the desktop — or click.)
`.trim();
