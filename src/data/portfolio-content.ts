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
  resumePdf: "/Laxmeesh_Ankola_Resume.docx.pdf",
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

export const FILE_CERTS = `certifications.txt (template)
────────────────────────────────────────
• Add: drone pilot / workshop certificates, IIT event participations, online specializations
• Replace lines below with your real entries.

2025 — Your competition / program name (organizer)
2024 — Course or bootcamp title (platform)
`;

export const FILE_PUBLICATIONS = `publications.txt (template)
────────────────────────────────────────
• Add papers, posters, or tech reports when public.

[Title] — [Venue / year] — [link or DOI]
`;

export type ProjectStatus = "Completed" | "In Progress";

export type PortfolioProject = {
  id: string;
  title: string;
  short: string;
  status: ProjectStatus;
  stack: string[];
  description: string;
  githubUrl?: string;
  imageSrc?: string;
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
    imageSrc: "/wallpapers/bliss.jpg",
  },
  {
    id: "crowdsense",
    title: "CrowdSense — AI Crowd Monitoring",
    short: "Edge CV + Telemetry Hooks",
    status: "Completed",
    stack: ["Python", "OpenCV", "YOLO-Class Detectors", "Jetson"],
    description:
      "A prototype analytics pipeline for crowd dynamics: detection tracks, simple counting, and export hooks for downstream autonomy or logging dashboards (demo and research oriented).",
    githubUrl: OWNER.github,
    imageSrc: "/wallpapers/bliss.jpg",
  },
  {
    id: "s500",
    title: "S500 Quad — Build & Tune",
    short: "Frame, ESCs, Tuning Flights",
    status: "Completed",
    stack: ["PX4", "QGroundControl", "Bench + Field Tuning"],
    description:
      "Hands-on build of an S500-class quad: assembly, ESC calibration, vibration checks, PID tuning, and incremental flight envelopes until stable hover and light waypoint tests.",
    imageSrc: "/wallpapers/bliss.jpg",
  },
  {
    id: "ops2",
    title: "OPS 2 — IIT Jodhpur Entry",
    short: "Competition Integration Sprint",
    status: "In Progress",
    stack: ["ROS 2", "Python", "Integration", "Demo Flight"],
    description:
      "Time-boxed competition entry at IIT Jodhpur: integrate perception and autonomy demos, document failure modes, and present a credible live or recorded flight segment for judges.",
    githubUrl: OWNER.github,
    imageSrc: "/wallpapers/bliss.jpg",
  },
];

export const RECYCLE_ITEMS: { name: string; blurb: string }[] = [
  { name: "portfolio_v0.zip", blurb: "First mono-repo layout before this XP shell." },
  { name: "old_slides.ppt", blurb: "Hackathon deck — funny fonts, good story." },
  { name: "sim_world_v1.world", blurb: "Early Gazebo world — too many boxes." },
];

export const PICTURE_CAPTIONS: { src: string; caption: string }[] = [
  { src: "/wallpapers/bliss.jpg", caption: "Field day — bring-up & sunshine (placeholder)" },
  { src: "/wallpapers/bliss.jpg", caption: "CAD / frame iteration (reuse your drone photos)" },
  { src: "/wallpapers/bliss.jpg", caption: "Competition / team photo — swap for real shots" },
];

export const BSOD_MESSAGE = `
A problem has been detected and Windows has been shut down to prevent damage
to your drone stack.

TECHNICAL INFORMATION:

*** STOP: 0x0000D081 (PEBKAC_NOT_FOUND)

You opened dont_open.exe. The universe had opinions.

(Press any key to return to the desktop — or click.)
`.trim();
