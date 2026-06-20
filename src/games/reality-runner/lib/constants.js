// Shared constants + tiny helpers used by both the Phaser scene (GameScene.js)
// and the React UI (Sidebar.jsx, DeadOverlay.jsx, RealityRunner.jsx).
//
// Single continuous world, no scene-swapping: pits and pinball chambers are
// zones embedded directly in the ground, entered/exited purely by the
// player's X position (see GameScene's pitZones / pinballZones).

export const W = 1600;
export const H = 900;
export const GROUND_Y = H - 90; // 810 — the floor's Y position in world space
export const BALL_R = 18; // player radius, in pixels

export const PIT_DEPTH = 560; // how far below GROUND_Y a pit floor sits
export const PIT_FLOOR_Y = GROUND_Y + PIT_DEPTH;

export const PIN_W = 520; // pinball chamber interior width
export const PIN_TOP = 120; // pinball chamber ceiling (world Y)

// Distance (in world-X pixels traveled) at which each ability unlocks.
// Bump these to make the run shorter/longer before a given toy shows up.
export const ABILITY_MILESTONES = {
  bounce: 0, // bounce pads are always active — the starter toy
  superJump: 1400,
  crush: 3200,
  pinballGate: 5200,
};

// Shown in the sidebar message box when each ability/hazard is first
// encountered. Keyed by the same names used in ABILITY_MILESTONES plus a
// few hazard-specific ones (pit, pinball, rod) referenced directly from
// GameScene.
export const TUTORIALS = {
  bounce: "Bounce pad: e (elasticity) sets how much speed you keep — e=1 is a perfect bounce, e=0 is a dead stop.",
  superJump: "Ability unlocked: Power Jump (key J). Costs energy, multiplies your jump speed — v0 = jumpSpeed × boost.",
  crush: "Ability unlocked: Ground Pound (key K). Falling fast enough to break armored squares: impulse breaks armor.",
  pit: "Free fall! Horizontal walls reflect you (vx flips ×e). Ride the chain of pads back up — or just enjoy the drop.",
  pinball: "Pinball chamber. Z = left flipper, X = right flipper. Bumpers fling you out fast: J = m·Δv.",
  rod: "Lightning rod charged. Walk into it to discharge: Q = C·V — stored charge becomes energy + a short jump boost.",
};

// Format a number for the sliders/HUD: fixed decimals, trailing zeros trimmed.
export function fmt(v, d = 1) {
  return Number(v || 0).toFixed(d).replace(/\.?0+$/, "") || "0";
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Color palette shared by the sidebar and the death-screen overlay.
export const C = {
  bg: "#0b1422", panel: "#16202f", border: "#2a3a50",
  teal: "#38bdf8", text: "#e6eef7", sub: "#8fa3bb",
  green: "#4ade80", yellow: "#fbbf24", red: "#f87171",
};

// `'ontouchstart' in window` is unreliable (many desktop Chromium builds
// define it regardless of hardware) — maxTouchPoints + a coarse-pointer
// media query are the signals that actually reflect the primary input device.
export function isTouchCapable() {
  if (typeof window === "undefined") return false;
  return navigator.maxTouchPoints > 0 && window.matchMedia("(pointer: coarse)").matches;
}
