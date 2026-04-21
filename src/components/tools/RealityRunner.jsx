import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Gauge,
  Orbit,
  RotateCcw,
  Sparkles,
  Target,
  Waves,
  Zap,
} from "lucide-react";

const WORLD_W = 1600;
const WORLD_H = 900;
const WALL = 28;
const BALL_R = 20;
const SHAFT_HALF_W = 230;
const CLIMB_WATER_DEPTH = 170;
const PHYSICS_STEP_MAX = 0.02;
const PREVIEW_DT = 1 / 60;
const PREVIEW_STEPS = 120;
const GROUND_Y = WORLD_H - 90;
const SEGMENT_LENGTH = 3200;

const SCENES = [
  {
    id: "side",
    title: "Side Scroll",
    subtitle: "Run, jump, and tune gravity without scraping the roof.",
    scrollSpeed: 360,
  },
  {
    id: "fall",
    title: "Free Fall",
    subtitle: "Drop through the shaft, bounce off pads, and do not get caught above.",
    scrollSpeed: 300,
  },
  {
    id: "climb",
    title: "Upward Climb",
    subtitle: "Ride bounce pads and ledges upward while danger rises below.",
    scrollSpeed: 275,
  },
  {
    id: "pinball",
    title: "Pinball Door",
    subtitle: "A tilted 2.5D bonus room with bumpers and rebound paddles.",
    scrollSpeed: 0,
  },
];

const CONTROL_MODES = {
  velocity: {
    id: "velocity",
    label: "Velocity x'",
    description: "Input chases a target speed, so motion feels immediate.",
  },
  acceleration: {
    id: "acceleration",
    label: "Acceleration x''",
    description: "Input adds acceleration, so momentum must build over time.",
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function magnitude(vx, vy) {
  return Math.sqrt(vx * vx + vy * vy);
}

function normalize(vx, vy) {
  const mag = magnitude(vx, vy) || 1;
  return { x: vx / mag, y: vy / mag };
}

function rectCircleIntersect(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function hillSurfaceY(obstacle, x) {
  const ratio = clamp((x - obstacle.x) / Math.max(1, obstacle.w), 0, 1);
  return obstacle.dir === "up"
    ? obstacle.y + obstacle.h - ratio * obstacle.h
    : obstacle.y + ratio * obstacle.h;
}

function hillSlope(obstacle) {
  const rise = obstacle.dir === "up" ? -obstacle.h : obstacle.h;
  return rise / Math.max(1, obstacle.w);
}

function seededRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function buildLightningPath(x, y1, y2, seed) {
  const rng = seededRng(seed);
  const pts = [[x, y1]];
  let cx = x;
  const steps = 12;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    cx = x + (rng() - 0.5) * 140 * Math.sin(t * Math.PI);
    pts.push([cx, y1 + (y2 - y1) * t]);
  }
  pts.push([x + (rng() - 0.5) * 20, y2]);
  // one branch off a mid segment
  const bi = Math.floor(steps * 0.35 + rng() * steps * 0.2);
  const branch = [pts[bi].slice()];
  let bx = pts[bi][0];
  let by = pts[bi][1];
  for (let i = 0; i < 5; i++) {
    bx += (rng() - 0.35) * 70;
    by += (y2 - y1) / steps * (0.6 + rng() * 0.5);
    branch.push([bx, by]);
  }
  return { pts, branch };
}

function spawnLightningStrike(game, targetX) {
  // Find nearest rod within 500px — tall conductors attract lightning
  const rods = game.obstacles.filter((o) => o.kind === "lightningRod" && Math.abs(o.x + o.w / 2 - targetX) < 500);
  const rodHit = rods.length > 0
    ? rods.reduce((best, o) => Math.abs(o.x + o.w / 2 - targetX) < Math.abs(best.x + best.w / 2 - targetX) ? o : best)
    : null;
  const boltX = rodHit ? rodHit.x + rodHit.w / 2 : targetX;
  const boltY2 = rodHit ? rodHit.y : GROUND_Y;
  const seed = Math.floor(Math.random() * 999983);
  const { pts, branch } = buildLightningPath(boltX, 0, boltY2, seed);
  game.lightningBolts.push({
    id: `lb-${Math.random()}`,
    pts,
    branch,
    x: boltX,
    ttl: 0.55,
    maxTtl: 0.55,
    hitRodId: rodHit ? rodHit.id : null,
  });
  if (rodHit) {
    game.lightningRodCharges[rodHit.id] = Math.min(3, (game.lightningRodCharges[rodHit.id] || 0) + 1);
  }
  const playerDist = Math.abs(game.player.x - boltX);
  if (playerDist < 45 && game.invulnerable <= 0) {
    damagePlayer(game, "Lightning strike! ⚡ V ≈ 300 MV, I ≈ 30 000 A — grab a lightning rod to harness that charge.", {
      knockbackX: (Math.random() - 0.5) * 700,
      knockbackY: -520,
    });
  }
}

function formatNumber(value, digits = 2) {
  return Number(value || 0)
    .toFixed(digits)
    .replace(/\.?0+$/, "");
}

function sceneByIndex(index) {
  return SCENES[index % SCENES.length];
}

function sceneById(id) {
  return SCENES.find((scene) => scene.id === id) || SCENES[0];
}

function sceneByDistance(x) {
  return sceneByIndex(Math.max(0, Math.floor(x / SEGMENT_LENGTH)));
}

function activeScene(game) {
  return sceneById(game.activeSceneId || "side");
}

function makePlayer(sceneId) {
  if (sceneId === "fall") {
    // x will be overridden to shaft center in createRunStateForScene
    return {
      x: WORLD_W * 0.5,
      y: 120,
      vx: 0,
      vy: 240,
      r: BALL_R,
      grounded: false,
    };
  }

  if (sceneId === "climb") {
    // Start above the water pool with upward velocity so player immediately
    // reaches the first bounce pad instead of sinking and getting stuck.
    return {
      x: WORLD_W * 0.5,
      y: WORLD_H - 230,
      vx: 0,
      vy: -380,
      r: BALL_R,
      grounded: false,
    };
  }

  return {
    x: 220,
    y: GROUND_Y - BALL_R,
    vx: 0,
    vy: 0,
    r: BALL_R,
    grounded: true,
  };
}

function createRunState() {
  const player = makePlayer("side");
  return {
    difficulty: 1,
    score: 0,
    survivedSeconds: 0,
    currentRegionIndex: 0,
    activeSceneId: "side",
    runMode: "main",
    sceneAnchorX: 220,
    portalReturnX: 220,
    transition: null,
    regionGrace: 0,
    player,
    obstacles: [],
    enemies: [],
    projectiles: [],
    effects: [],
    alive: true,
    reason: "Edit the rules, then move.",
    goalX: 18000,
    lives: 3,
    invulnerable: 0,
    tutorial: null,
    unlocks: {
      elasticity: false,
      blaster: false,
      crush: false,
    },
    pendingTutorial: null,
    checkpoint: {
      x: 220,
      label: "Start",
    },
    collectibles: [],
    energy: 100,
    shotCooldown: 0,
    shotRecover: 0,
    crushCooldown: 0,
    lightningBolts: [],
    lightningTimer: 4 + Math.random() * 3,
    lightningRodCharges: {},
    flipL: false,
    flipR: false,
    nextSpawnX: 320,
    nextSceneSpawnMetric: 420,
    platformCursor: { x: 280, y: GROUND_Y },
    furthestX: player.x,
    lastDt: PREVIEW_DT,
  };
}

function createRunStateFromCheckpoint(checkpoint, unlocks = {}) {
  const game = createRunState();
  const spawnX = checkpoint?.x ?? 220;
  const scene = sceneById("side");
  game.player = makePlayer(scene.id);
  game.player.x = spawnX;
  game.player.y = scene.id === "side" ? GROUND_Y - game.player.r : game.player.y;
  game.player.grounded = scene.id === "side";
  game.currentRegionIndex = Math.max(0, Math.floor(spawnX / SEGMENT_LENGTH));
  game.furthestX = spawnX;
  game.nextSpawnX = Math.max(SEGMENT_LENGTH * 0.35, spawnX + 240);
  game.platformCursor = { x: spawnX, y: GROUND_Y };
  game.checkpoint = checkpoint || game.checkpoint;
  game.unlocks = {
    ...game.unlocks,
    ...unlocks,
  };
  game.reason = `Checkpoint restored: ${game.checkpoint.label}`;
  return game;
}

function createRunStateForScene(sceneId) {
  const scene = sceneById(sceneId);
  const game = createRunState();
  game.activeSceneId = scene.id;
  game.runMode = "scene_test";
  game.player = makePlayer(scene.id);
  game.sceneAnchorX = WORLD_W * 0.5;
  game.portalReturnX = 220;
  game.currentRegionIndex = 0;
  game.nextSpawnX = 800;
  game.nextSceneSpawnMetric = scene.id === "fall" ? 520 : scene.id === "climb" ? WORLD_H - 420 : 420;
  game.reason = `${scene.title} test run loaded.`;
  game.unlocks = {
    elasticity: true,
    blaster: scene.id === "pinball",
    crush: scene.id === "pinball",
  };
  // Center player inside the shaft for vertical scenes
  if (scene.id === "fall" || scene.id === "climb" || scene.id === "pinball") {
    game.player.x = game.sceneAnchorX;
  }
  if (scene.id === "pinball") {
    game.player.y = 180;
    game.player.vy = 300;
    game.player.grounded = false;
  }
  clearSceneScoped(game);
  seedRegionEntry(game, scene, 0);
  return game;
}

function clearSceneScoped(game) {
  game.obstacles = game.obstacles.filter((item) => !item.sceneScoped);
  game.enemies = game.enemies.filter((item) => !item.sceneScoped);
  game.collectibles = game.collectibles.filter((item) => !item.sceneScoped);
  game.projectiles = game.projectiles.filter((item) => !item.sceneScoped);
}

function maybeUpdateCheckpoint(game) {
  const scene = sceneByDistance(game.player.x);
  if (scene.id !== "side") return;

  const target = Math.floor(game.furthestX / 1600) * 1600 + 220;
  if (target > game.checkpoint.x + 900) {
    game.checkpoint = {
      x: target,
      label: `x = ${Math.round(target)} checkpoint`,
    };
    game.reason = "Checkpoint reached.";
  }
}

function seedRegionEntry(game, scene, regionIndex) {
  const entryX = game.sceneAnchorX;

  if (scene.id === "fall") {
    game.obstacles = game.obstacles.filter(
      (obstacle) => !(obstacle.entrySeed && obstacle.regionIndex === regionIndex),
    );
    game.enemies = game.enemies.filter(
      (enemy) => !(enemy.entrySeed && enemy.regionIndex === regionIndex),
    );

    game.obstacles.push({
      id: `entry-fall-pad-${regionIndex}`,
      kind: "bouncePad",
      x: entryX - 110,
      y: 760,
      w: 170,
      h: 18,
      theme: "pad",
      entrySeed: true,
      regionIndex,
      sceneScoped: true,
    });
    game.collectibles.push({
      id: `entry-fall-energy-${regionIndex}`,
      type: "energy",
      x: entryX + 100,
      y: 540,
      r: 16,
      entrySeed: true,
      regionIndex,
      sceneScoped: true,
    });
    return;
  }

  if (scene.id === "climb") {
    game.obstacles = game.obstacles.filter(
      (obstacle) => !(obstacle.entrySeed && obstacle.regionIndex === regionIndex),
    );
    game.enemies = game.enemies.filter(
      (enemy) => !(enemy.entrySeed && enemy.regionIndex === regionIndex),
    );

    const lw = entryX - SHAFT_HALF_W + 26;  // left-wall pad x
    const rw = entryX + SHAFT_HALF_W - 156; // right-wall pad x
    // Wide center pad at the very bottom — player at x=entryX will hit this on the way up
    game.obstacles.push(
      {
        id: `entry-climb-pad-c-${regionIndex}`,
        kind: "bouncePad",
        x: entryX - 80,
        y: WORLD_H - 240,
        w: 160,
        h: 18,
        theme: "wall-pad",
        entrySeed: true,
        regionIndex,
        sceneScoped: true,
      },
      {
        id: `entry-climb-pad-l-${regionIndex}`,
        kind: "bouncePad",
        x: lw,
        y: WORLD_H - 430,
        w: 130,
        h: 18,
        theme: "wall-pad",
        entrySeed: true,
        regionIndex,
        sceneScoped: true,
      },
      {
        id: `entry-climb-pad-r-${regionIndex}`,
        kind: "bouncePad",
        x: rw,
        y: WORLD_H - 600,
        w: 130,
        h: 18,
        theme: "wall-pad",
        entrySeed: true,
        regionIndex,
        sceneScoped: true,
      },
      {
        id: `entry-climb-pad-l2-${regionIndex}`,
        kind: "bouncePad",
        x: lw,
        y: WORLD_H - 760,
        w: 130,
        h: 18,
        theme: "wall-pad",
        entrySeed: true,
        regionIndex,
        sceneScoped: true,
      },
      // Bounce pad just below the exit portal — player must chain bounces up to reach it
      {
        id: `entry-climb-top-pad-${regionIndex}`,
        kind: "bouncePad",
        x: entryX - 70,
        y: 280,
        w: 140,
        h: 18,
        theme: "wall-pad",
        entrySeed: true,
        regionIndex,
        sceneScoped: true,
      },
      // Exit portal — float above the top bounce pad, reachable from a solid chain
      {
        id: `entry-climb-exit-${regionIndex}`,
        kind: "portal",
        target: "side",
        x: entryX - 60,
        y: 200,
        w: 120,
        h: 24,
        theme: "portal",
        entrySeed: true,
        regionIndex,
        sceneScoped: true,
      },
    );
    game.collectibles.push({
      id: `entry-climb-energy-${regionIndex}`,
      type: "energy",
      x: entryX,
      y: WORLD_H - 520,
      r: 16,
      entrySeed: true,
      regionIndex,
      sceneScoped: true,
    });
    return;
  }

  if (scene.id === "pinball") {
    const cx = entryX;
    // Room walls (solid barriers forming a funnel)
    game.obstacles.push(
      // Left wall angled
      { id: `pb-lwall-${regionIndex}`, kind: "solid", x: cx - 320, y: 120, w: 22, h: WORLD_H - 300, theme: "block", sceneScoped: true },
      // Right wall angled
      { id: `pb-rwall-${regionIndex}`, kind: "solid", x: cx + 298, y: 120, w: 22, h: WORLD_H - 300, theme: "block", sceneScoped: true },
      // Flippers — static for now, Z/X key handling will tilt them via physics
      { id: `pb-flip-l-${regionIndex}`, kind: "flipper", side: "left",  x: cx - 200, y: WORLD_H - 160, w: 160, h: 18, theme: "flipper", sceneScoped: true },
      { id: `pb-flip-r-${regionIndex}`, kind: "flipper", side: "right", x: cx + 40,  y: WORLD_H - 160, w: 160, h: 18, theme: "flipper", sceneScoped: true },
      // Circular bumpers (high elasticity bounce pads)
      { id: `pb-bump-a-${regionIndex}`, kind: "bumper", x: cx - 60,  y: 260, r: 36, theme: "bumper", sceneScoped: true },
      { id: `pb-bump-b-${regionIndex}`, kind: "bumper", x: cx + 110, y: 400, r: 28, theme: "bumper", sceneScoped: true },
      { id: `pb-bump-c-${regionIndex}`, kind: "bumper", x: cx - 130, y: 480, r: 30, theme: "bumper", sceneScoped: true },
      { id: `pb-bump-d-${regionIndex}`, kind: "bumper", x: cx + 30,  y: 600, r: 32, theme: "bumper", sceneScoped: true },
      // Exit portal near the top centre
      { id: `pb-exit-${regionIndex}`, kind: "portal", target: "side", x: cx - 50, y: 80, w: 100, h: 22, theme: "portal", sceneScoped: true },
    );
    game.collectibles.push(
      { id: `pb-energy-a-${regionIndex}`, type: "energy", x: cx - 40, y: 350, r: 16, sceneScoped: true },
      { id: `pb-energy-b-${regionIndex}`, type: "energy", x: cx + 80, y: 530, r: 16, sceneScoped: true },
      { id: `pb-life-${regionIndex}`,     type: "life",   x: cx,      y: 700, r: 16, sceneScoped: true },
    );
  }
}

function beginRegionTransition(game, sceneId, anchorX) {
  const scene = sceneById(sceneId);
  game.activeSceneId = scene.id;
  // Vertical scenes always center the shaft in the viewport
  const shaftAnchor = (scene.id === "fall" || scene.id === "climb" || scene.id === "pinball")
    ? WORLD_W * 0.5
    : anchorX;
  game.sceneAnchorX = shaftAnchor;
  game.portalReturnX = anchorX; // save original world-x to return to
  game.transition = {
    title: `${scene.title} region`,
    subtitle: scene.subtitle,
    ttl: 0.95,
  };
  game.regionGrace = 2.2;
  game.player.x = shaftAnchor;

  if (scene.id === "fall") {
    game.player.y = 160;
    game.player.vx = Math.max(40, game.player.vx * 0.35);
    game.player.vy = 320;
    game.player.grounded = false;
    game.reason = "Free-fall region entered. Tune gravity to control the drop.";
  } else if (scene.id === "climb") {
    game.player.y = WORLD_H - 210;
    game.player.vx = Math.max(30, game.player.vx * 0.25);
    game.player.vy = -320;
    game.player.grounded = false;
    game.reason = "Climb region entered. Bounce upward and stay ahead of the hazard.";
  } else if (scene.id === "pinball") {
    game.player.y = 180;
    game.player.vx = 0;
    game.player.vy = 300;
    game.player.grounded = false;
    game.reason = "Pinball room! Z/X = flippers. mgh converts to kinetic speed as you drop.";
  } else {
    game.player.y = GROUND_Y - game.player.r;
    game.player.vx = Math.max(140, game.player.vx);
    game.player.vy = 0;
    game.player.grounded = true;
    game.reason = "Side-scroll region entered. Forward momentum matters again.";
  }

  clearSceneScoped(game);
  seedRegionEntry(game, scene, game.currentRegionIndex);
}

function returnToSideScene(game, reason) {
  clearSceneScoped(game);
  game.activeSceneId = "side";
  game.transition = {
    title: "Side Scroll region",
    subtitle: "Back on the main run. Keep pushing toward Pi.",
    ttl: 0.75,
  };
  game.regionGrace = 1.2;
  game.player.x = game.portalReturnX + 280;
  game.player.y = GROUND_Y - game.player.r;
  game.player.vx = Math.max(160, Math.abs(game.player.vx));
  game.player.vy = 0;
  game.player.grounded = true;
  game.reason = reason;
  // Reset platform cursor so the chain continues from where the player re-enters
  game.platformCursor = { x: game.player.x, y: GROUND_Y };
}

function makeTutorial(id, title, body) {
  return { id, title, body };
}

function maybeUnlockProgress(game) {
  if (!game.unlocks.elasticity && game.furthestX >= 1200) {
    game.unlocks.elasticity = true;
    game.pendingTutorial = makeTutorial(
      "elasticity",
      "Euler: Coefficient of Restitution",
      "I am Euler — your tutor in disguise as a power-up. The coefficient of restitution e = v_after / v_before measures how elastic a collision is. e = 1 is a perfect bounce (no energy lost). e = 0 means the ball sticks and stops dead. Real rubber balls are around e = 0.85. Try cranking elasticity up — every bounce pad now returns more speed and you can use walls as slingshots instead of dead ends.",
    );
    game.reason = "Elasticity unlocked — collect a pickup to hear from Euler.";
    return;
  }

  if (!game.unlocks.blaster && game.furthestX >= 2800) {
    game.unlocks.blaster = true;
    game.pendingTutorial = makeTutorial(
      "blaster",
      "Euler: Kinetic Energy and the Math Bolt",
      "Your math bolt is online. The bolt's speed obeys KE = ½mv². Double the speed and you get four times the energy. That is why the overpowered bolt (high shot power) carries so much danger — if it ricochets, that quadrupled energy comes back at you. Projectile motion follows x = v₀t and y = ½gt². You are literally firing a parabola.",
    );
    game.reason = "Math bolt unlocked — collect a pickup to hear from Euler.";
    return;
  }

  if (!game.unlocks.crush && game.furthestX >= 4600) {
    game.unlocks.crush = true;
    game.pendingTutorial = makeTutorial(
      "crush",
      "Euler: Newton's Second Law — F = ma",
      "Super gravity is now available. Newton's second law: F = ma. Your weight is mg — mass times gravitational acceleration. Doubling g doubles the force on every falling object, including you. That extra downward impulse (J = FΔt = mΔv) is what crushes enemies when you land on them fast enough. But a heavier trajectory is harder to steer. Every gain has a cost — that is physics and engineering both.",
    );
    game.reason = "Super gravity unlocked — collect a pickup to hear from Euler.";
  }
}

function damagePlayer(game, reason, { knockbackX = -260, knockbackY = -220 } = {}) {
  if (game.invulnerable > 0 || !game.alive) return;

  const severeDrain = 34;
  const hadEnergy = game.energy > severeDrain;
  game.energy = Math.max(0, game.energy - severeDrain);
  if (!hadEnergy) {
    game.lives -= 1;
  }
  game.invulnerable = 1.8;
  game.player.vx = knockbackX;
  game.player.vy = knockbackY;
  game.reason = hadEnergy ? `${reason} Energy blasted away.` : `${reason} You were out of energy and lost a life.`;
  const trailDir = normalize(knockbackX, knockbackY);
  for (let index = 0; index < 6; index += 1) {
    game.effects.push({
      id: `hurt-${Math.random()}`,
      x: game.player.x - trailDir.x * index * 26,
      y: game.player.y - trailDir.y * index * 26,
      text: index === 0 ? (hadEnergy ? "-energy" : "-life") : "",
      ttl: 1 + index * 0.05,
      color: hadEnergy ? "#fbbf24" : "#fb7185",
      r: 10 + index * 1.5,
    });
  }

  if (game.lives <= 0) {
    game.alive = false;
    game.reason = `${reason} Pi still needs you.`;
  }
}

function projectHorizontalInput(mode, input, controlGain, vx, grounded) {
  if (mode === "velocity") {
    const desiredVx = input * (240 + controlGain * 210);
    return (desiredVx - vx) * (grounded ? 10.5 : 4.5);
  }

  const passiveDrag = grounded ? -vx * 7.8 : -vx * 0.6;
  return input * (controlGain * 760) + passiveDrag;
}

// Tier heights — player can jump ~148px up with default settings
const CHAIN_TIERS = [GROUND_Y, GROUND_Y - 120, GROUND_Y - 240, GROUND_Y - 360];
const MAX_JUMP_H = 148; // max upward reach from a standing jump
const MAX_GAP_X = 260;  // max safe horizontal gap while airborne
const MIN_GAP_X = 55;   // minimum gap so platforms don't merge visually

function pickNextTier(prevY) {
  // Which tiers can the player physically reach from prevY?
  const reachable = CHAIN_TIERS.filter(ty => ty >= prevY || (prevY - ty) <= MAX_JUMP_H);
  // Weight: prefer one tier up from current, allow staying or falling, rarely return to ground
  const weights = reachable.map(ty => {
    if (ty === GROUND_Y) return prevY === GROUND_Y ? 0.15 : 0.08;
    if (ty === prevY) return 0.35;
    if (ty < prevY) return 0.40; // going up is rewarding
    return 0.17; // falling down
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < reachable.length; i++) {
    r -= weights[i];
    if (r <= 0) return reachable[i];
  }
  return reachable[reachable.length - 1];
}

function spawnSideChunk(game, baseX) {
  // Ensure cursor exists — fallback to ground at baseX
  if (!game.platformCursor) game.platformCursor = { x: baseX, y: GROUND_Y };
  const prev = game.platformCursor;

  // ── Next platform position ────────────────────────────────────────────────
  const nextY = pickNextTier(prev.y);
  // Tighter gap when going up (less horizontal momentum during ascent)
  const maxGap = nextY < prev.y ? MAX_GAP_X - 40 : MAX_GAP_X;
  const nextX = prev.x + MIN_GAP_X + Math.random() * (maxGap - MIN_GAP_X);
  const pw = 85 + Math.random() * 75;
  const isBouncePad = nextY < GROUND_Y && Math.random() < 0.26;

  if (nextY < GROUND_Y) {
    game.obstacles.push({
      id: `plat-${Math.random()}`, kind: isBouncePad ? "bouncePad" : "solid",
      x: nextX, y: nextY, w: pw, h: 16, theme: isBouncePad ? "pad" : "block",
    });

    // Collectible above platform
    if (Math.random() < 0.50) {
      game.collectibles.push({ id: `c-${Math.random()}`, type: Math.random() < 0.65 ? "energy" : "life", x: nextX + pw * 0.45, y: nextY - 30, r: 15 });
    }

    // Enemy patrolling the platform
    if (Math.random() < clamp(0.50 + game.difficulty * 0.04, 0.50, 0.84)) {
      const archs = [
        { shape: "circle", behavior: "hover" },
        { shape: "diamond", behavior: "patrol" },
        { shape: "square", behavior: "vertical" },
      ];
      const a = archs[Math.floor(Math.random() * archs.length)];
      game.enemies.push({ id: `en-${Math.random()}`, shape: a.shape, behavior: a.behavior, x: nextX + pw * 0.5 + (Math.random() - 0.5) * 50, y: nextY - 36, vx: -(40 + Math.random() * 80), vy: 0, r: 18 + Math.random() * 8, phase: Math.random() * Math.PI * 2, amplitude: 20 + Math.random() * 30, amplitudeY: 14 + Math.random() * 24 });
    }

    // Portal ON the platform — always reachable because player is already here
    if (Math.random() < 0.09 && baseX > (game.checkpoint?.x ?? 0) + 500) {
      const target = Math.random() < 0.5 ? "fall" : "climb";
      game.obstacles.push({ id: `portal-${Math.random()}`, kind: "portal", target, x: nextX + pw * 0.1, y: nextY - 28, w: 100, h: 22, theme: "portal" });
    }
  }

  // ── Ground hazard in the corridor between prev and next platform ──────────
  const hzX = prev.x + 10;
  const hzW = nextX - prev.x - 20;
  if (hzW > 70) {
    const roll = Math.random();
    if (roll < 0.22) {
      game.obstacles.push({ id: `spike-${Math.random()}`, kind: "spike", x: hzX, y: GROUND_Y - 28, w: clamp(hzW * 0.6, 40, 100), h: 28, theme: "spike" });
    } else if (roll < 0.42) {
      const hw = clamp(hzW * 0.75, 80, 220), hh = 50 + Math.random() * 70;
      game.obstacles.push({ id: `hill-${Math.random()}`, kind: "hill", x: hzX, y: GROUND_Y - hh, w: hw, h: hh, dir: Math.random() < 0.5 ? "up" : "down", theme: "hill" });
    } else if (roll < 0.57) {
      game.obstacles.push({ id: `gpad-${Math.random()}`, kind: "bouncePad", x: hzX + Math.random() * Math.max(0, hzW - 90), y: GROUND_Y - 18, w: 90, h: 18, theme: "pad" });
    } else if (roll < 0.73) {
      // Water — hop platforms spaced evenly above it
      const ww = clamp(hzW * 0.85, 140, 320);
      game.obstacles.push({ id: `water-${Math.random()}`, kind: "water", x: hzX, y: GROUND_Y - 36, w: ww, h: 52, theme: "water" });
      const nHops = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < nHops; i++) {
        const hpw = 65 + Math.random() * 35;
        const hpx = hzX + (ww / nHops) * i + 8;
        game.obstacles.push({ id: `wplat-${Math.random()}`, kind: "solid", x: hpx, y: GROUND_Y - 128, w: hpw, h: 16, theme: "block" });
      }
      game.collectibles.push({ id: `wpick-${Math.random()}`, type: "energy", x: hzX + ww / 2, y: GROUND_Y - 158, r: 15 });
    } else {
      // Pitfall — hop platforms bridge the gap, or fall to free-fall shaft
      const pitW = clamp(hzW * 0.75, 140, 300);
      game.obstacles.push({ id: `pitfall-${Math.random()}`, kind: "pitfall", x: hzX, y: GROUND_Y, w: pitW, h: 140 });
      const np = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < np; i++) {
        const px = hzX + (pitW / np) * i + 10;
        const py = GROUND_Y - 108 - Math.random() * 28;
        game.obstacles.push({ id: `pitplat-${Math.random()}`, kind: "solid", x: px, y: py, w: 70 + Math.random() * 40, h: 16, theme: "block" });
        if (i === 1) game.collectibles.push({ id: `pitpick-${Math.random()}`, type: Math.random() < 0.6 ? "energy" : "life", x: px + 35, y: py - 28, r: 15 });
      }
    }
  }

  // ── Lightning rod ─────────────────────────────────────────────────────────
  if (Math.random() < 0.16 && hzW > 40) {
    game.obstacles.push({ id: `rod-${Math.random()}`, kind: "lightningRod", x: hzX + Math.random() * Math.max(1, hzW - 20), y: GROUND_Y - 100, w: 14, h: 100, theme: "rod" });
  }

  // ── Advance cursor to right edge of the new platform ─────────────────────
  game.platformCursor = { x: nextX + pw, y: nextY };
}

function spawnFallChunk(game, baseX) {
  const baseY = 160 + Math.random() * 520;
  const difficulty = game.difficulty;
  const xBand = baseX + 180 + Math.random() * 720;

  const leftPad = Math.random() < 0.5;
  game.obstacles.push({
    id: `pad-${Math.random()}`,
    kind: "bouncePad",
    x: leftPad ? xBand : xBand + 280,
    y: baseY,
    w: 240,
    h: 18,
    theme: "pad",
    sceneScoped: true,
  });

  if (Math.random() < 0.55 + difficulty * 0.04) {
    game.obstacles.push({
      id: `bar-${Math.random()}`,
      kind: "solid",
      x: xBand + 120 + Math.random() * 440,
      y: baseY + 100 + Math.random() * 120,
      w: 120 + Math.random() * 180,
      h: 26,
      theme: "bar",
      sceneScoped: true,
    });
  }

  if (Math.random() < 0.45 + difficulty * 0.04) {
    const archetypes = [
      { shape: "triangle", behavior: "zigzag" },
      { shape: "rect", behavior: "vertical" },
      { shape: "circle", behavior: "chaser" },
    ];
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    game.enemies.push({
      id: `enemy-${Math.random()}`,
      shape: archetype.shape,
      x: xBand + 40 + Math.random() * 560,
      y: baseY + 30,
      vx: (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 90),
      vy: 0,
      r: 16 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      amplitude: 0,
      amplitudeY: 26 + Math.random() * 32,
      behavior: archetype.behavior,
      sceneScoped: true,
    });
  }

  game.collectibles.push({
    id: `fall-energy-${Math.random()}`,
    type: "energy",
    x: xBand + 80 + Math.random() * 420,
    y: 120 + Math.random() * 120,
    r: 16,
    sceneScoped: true,
    lightningRod: true,
  });
}

function spawnClimbChunk(game, baseX) {
  const anchorX = game.sceneAnchorX;
  const lw = anchorX - SHAFT_HALF_W + 26;
  const rw = anchorX + SHAFT_HALF_W - 156;
  const difficulty = game.difficulty;
  // Alternate left/right pads so player zigzags upward through the shaft
  const useLeft = Math.random() < 0.5;
  const padX = useLeft ? lw : rw;
  const baseY = 120 + Math.random() * 560;

  game.obstacles.push({
    id: `pad-${Math.random()}`,
    kind: "bouncePad",
    x: padX,
    y: baseY,
    w: 130 + Math.random() * 30,
    h: 18,
    theme: "wall-pad",
    sceneScoped: true,
  });

  // Occasional solid ledge mid-shaft to rest on
  if (Math.random() < 0.3) {
    game.obstacles.push({
      id: `ledge-${Math.random()}`,
      kind: "solid",
      x: anchorX - 55,
      y: baseY - 180,
      w: 110,
      h: 18,
      theme: "ledge",
      sceneScoped: true,
    });
  }

  if (Math.random() < 0.45 + difficulty * 0.05) {
    const archetypes = [
      { shape: "diamond", behavior: "hover" },
      { shape: "pentagon", behavior: "swoop" },
      { shape: "circle", behavior: "vertical" },
    ];
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    game.enemies.push({
      id: `enemy-${Math.random()}`,
      shape: archetype.shape,
      x: anchorX + (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 140),
      y: baseY - 60,
      vx: (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 80),
      vy: 0,
      r: 18 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      amplitude: 18 + Math.random() * 32,
      amplitudeY: 20 + Math.random() * 40,
      behavior: archetype.behavior,
      sceneScoped: true,
    });
  }

  game.collectibles.push({
    id: `climb-energy-${Math.random()}`,
    type: "energy",
    x: anchorX + (Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 80),
    y: baseY - 120,
    r: 16,
    sceneScoped: true,
  });
}

function spawnSceneContent(game, baseX) {
  const scene = sceneByDistance(baseX);
  if (scene.id === "side") {
    spawnSideChunk(game, baseX);
  } else if (scene.id === "fall") {
    spawnFallChunk(game, baseX);
  } else {
    spawnClimbChunk(game, baseX);
  }
}

function spawnSceneTestContent(game) {
  const scene = activeScene(game);
  const anchorX = game.sceneAnchorX;

  if (scene.id === "fall") {
    const baseY = game.nextSceneSpawnMetric;
    game.obstacles.push({
      id: `fall-test-pad-${Math.random()}`,
      kind: "bouncePad",
      x: anchorX - 180 + Math.random() * 250,
      y: baseY,
      w: 130 + Math.random() * 40,
      h: 18,
      theme: "pad",
      sceneScoped: true,
    });
    if (Math.random() < 0.45) {
      game.obstacles.push({
        id: `fall-test-pad-2-${Math.random()}`,
        kind: "bouncePad",
        x: anchorX - 180 + Math.random() * 250,
        y: baseY + 220,
        w: 120 + Math.random() * 50,
        h: 18,
        theme: "pad",
        sceneScoped: true,
      });
    }
    if (Math.random() < 0.35) {
      game.obstacles.push({
        id: `fall-test-bar-${Math.random()}`,
        kind: "solid",
        x: anchorX - 205 + Math.random() * 270,
        y: baseY + 360,
        w: 110 + Math.random() * 90,
        h: 22,
        theme: "bar",
        sceneScoped: true,
      });
    }
    if (Math.random() < 0.7) {
      game.enemies.push({
        id: `fall-test-enemy-${Math.random()}`,
        shape: Math.random() < 0.5 ? "triangle" : "diamond",
        x: anchorX - 140 + Math.random() * 280,
        y: baseY + 90,
        vx: (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 70),
        vy: 0,
        r: 16 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0,
        amplitudeY: 20 + Math.random() * 30,
        behavior: Math.random() < 0.5 ? "vertical" : "zigzag",
        sceneScoped: true,
      });
    }
    game.collectibles.push({
      id: `fall-test-energy-${Math.random()}`,
      type: "energy",
      x: anchorX - 120 + Math.random() * 240,
      y: baseY - 110,
      r: 16,
      sceneScoped: true,
    });
    game.nextSceneSpawnMetric += 520 + Math.random() * 220;
    return;
  }

  if (scene.id === "climb") {
    const baseY = game.nextSceneSpawnMetric;
    const leftWall = anchorX - SHAFT_HALF_W + 26;
    const rightWall = anchorX + SHAFT_HALF_W - 146;
    game.obstacles.push(
      {
        id: `climb-wall-pad-${Math.random()}`,
        kind: "bouncePad",
        x: Math.random() < 0.5 ? leftWall : rightWall,
        y: baseY,
        w: 120 + Math.random() * 20,
        h: 18,
        theme: "wall-pad",
        sceneScoped: true,
      },
      {
        id: `climb-wall-pad-${Math.random()}`,
        kind: "bouncePad",
        x: Math.random() < 0.5 ? rightWall : leftWall,
        y: baseY - 190,
        w: 120 + Math.random() * 20,
        h: 18,
        theme: "wall-pad",
        sceneScoped: true,
      },
    );
    game.collectibles.push({
      id: `climb-test-energy-${Math.random()}`,
      type: "energy",
      x: anchorX - 80 + Math.random() * 160,
      y: baseY - 260,
      r: 16,
      sceneScoped: true,
    });
    game.nextSceneSpawnMetric -= 300 + Math.random() * 140;
  }
}

function fireProjectile(game, params) {
  if (game.shotCooldown > 0 || !game.alive || !game.unlocks.blaster || game.energy < 20) return;

  const scene = activeScene(game);
  let direction = { x: 1, y: 0 };
  if (scene.id === "fall") direction = { x: 0, y: 1 };
  if (scene.id === "climb") direction = { x: 0, y: -1 };

  const speed = 360 + params.shotPower * 760;
  const tooHot = params.shotPower > 0.82;
  const tooWeak = params.shotPower < 0.32;

  game.projectiles.push({
    id: `bolt-${Math.random()}`,
    x: game.player.x + direction.x * (game.player.r + 8),
    y: game.player.y + direction.y * (game.player.r + 8),
    vx: direction.x * speed,
    vy: direction.y * speed,
    r: 8,
    ttl: tooWeak ? 0.45 : 1.6,
    bouncesLeft: tooHot ? 1 : 0,
    hostile: false,
    color: tooHot ? "#f97316" : "#38bdf8",
  });

  game.shotCooldown = 0.55;
  game.reason = tooHot
    ? "Shot power is high enough to ricochet."
    : tooWeak
      ? "Shot power is low. The bolt will fade early."
      : "Bolt fired.";
}

function reflectProjectile(projectile, axis) {
  if (axis === "x") {
    projectile.vx *= -1;
  } else {
    projectile.vy *= -1;
  }
  projectile.bouncesLeft -= 1;
  projectile.hostile = true;
  projectile.color = "#fb7185";
}

function updateProjectiles(game, dt) {
  for (const projectile of game.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.ttl -= dt;

    if (projectile.x <= WALL + projectile.r || projectile.x >= WORLD_W - WALL - projectile.r) {
      if (projectile.bouncesLeft > 0) {
        reflectProjectile(projectile, "x");
      } else {
        projectile.ttl = -1;
      }
    }

    if (projectile.y <= WALL + projectile.r || projectile.y >= WORLD_H - WALL - projectile.r) {
      if (projectile.bouncesLeft > 0) {
        reflectProjectile(projectile, "y");
      } else {
        projectile.ttl = -1;
      }
    }
  }
  game.projectiles = game.projectiles.filter((projectile) => projectile.ttl > 0);
}

function moveWorldForScene(game, dt) {
  const scene = sceneByDistance(game.player.x);
  const speed = scene.scrollSpeed + game.difficulty * 22;

  if (scene.id === "side") {
    for (const obstacle of game.obstacles) obstacle.x -= speed * dt;
    for (const enemy of game.enemies) enemy.x -= speed * dt;
  } else if (scene.id === "fall") {
    for (const obstacle of game.obstacles) obstacle.y -= speed * dt;
    for (const enemy of game.enemies) enemy.y -= speed * dt;
  } else {
    for (const obstacle of game.obstacles) obstacle.y += speed * dt;
    for (const enemy of game.enemies) enemy.y += speed * dt;
  }

  game.obstacles = game.obstacles.filter((obstacle) => {
    return (
      obstacle.x + obstacle.w > -180 &&
      obstacle.x < WORLD_W + 180 &&
      obstacle.y + obstacle.h > -220 &&
      obstacle.y < WORLD_H + 220
    );
  });

  game.enemies = game.enemies.filter((enemy) => {
    return enemy.x + enemy.r > -240 && enemy.x - enemy.r < WORLD_W + 240 && enemy.y + enemy.r > -240 && enemy.y - enemy.r < WORLD_H + 240;
  });
}

function resolveObstacleCollision(game, obstacle, params, superGravity) {
  const player = game.player;
  // These are purely visual/logical — no physical collision
  if (obstacle.kind === "pitfall" || obstacle.kind === "lightningRod") return false;
  if (obstacle.kind === "portal") {
    if (!rectCircleIntersect({ x: player.x, y: player.y, r: player.r }, obstacle)) return false;
    if (obstacle.target === "side") {
      // Return portal from fall/climb back to side scroll
      returnToSideScene(game, "Portal reached — you escaped the shaft!");
      game.score += 280;
      game.energy = Math.min(100, game.energy + 20);
    } else if (game.activeSceneId === "side") {
      game.portalReturnX = obstacle.x;
      beginRegionTransition(game, obstacle.target, obstacle.x + obstacle.w * 0.5);
    }
    return true;
  }

  if (obstacle.kind === "water") {
    if (!rectCircleIntersect({ x: player.x, y: player.y, r: player.r }, obstacle)) return false;
    player.vx *= 0.82;
    player.vy *= 0.72;
    // Wave boost: riding the animated surface crest gives upward impulse
    const waveOffset = Math.sin(Date.now() / 420 + player.x * 0.012) * 18;
    const surfaceY = obstacle.y + waveOffset;
    if (player.y - player.r < surfaceY + 28) {
      player.vy -= 55;  // wave pushes up near surface
    }
    // Let player jump out of water
    player.grounded = true;
    if (Math.abs(player.vx) < 22) player.vx *= 0.7;
    game.reason = "Water drag. F_drag = bv — wave momentum can launch you to a platform. Jump!";
    return false;
  }

  if (obstacle.kind === "hill") {
    const withinX = player.x + player.r > obstacle.x && player.x - player.r < obstacle.x + obstacle.w;
    if (!withinX) return false;

    const surfaceY = hillSurfaceY(obstacle, player.x);
    const bottom = player.y + player.r;
    const top = player.y - player.r;
    const hillBottom = obstacle.y + obstacle.h;
    if (bottom < surfaceY - 14 || top > hillBottom + 24) return false;

    player.y = surfaceY - player.r;
    player.grounded = true;
    if (player.vy > 0) {
      player.vy = 0;
    }

    const slope = hillSlope(obstacle);
    player.vx += params.gravity * slope * 0.9 * game.lastDt;
    player.vx *= Math.max(0.06, 1 - params.friction * 3.4 * game.lastDt);
    game.reason = `Hill contact: slope ${formatNumber(slope, 2)}, friction ${formatNumber(params.friction, 2)}`;
    return true;
  }

  // Circular bumper — radial bounce with high restitution
  if (obstacle.kind === "bumper") {
    const dx = player.x - obstacle.x;
    const dy = player.y - obstacle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > player.r + obstacle.r) return false;
    const nx = dx / (dist || 1);
    const ny = dy / (dist || 1);
    const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    const bounceSpeed = Math.max(520, speed * 1.35);
    player.vx = nx * bounceSpeed;
    player.vy = ny * bounceSpeed;
    player.x = obstacle.x + nx * (player.r + obstacle.r + 2);
    player.y = obstacle.y + ny * (player.r + obstacle.r + 2);
    game.score += 30;
    game.reason = `Bumper! Impulse J = Δp — elastic collision with a fixed mass.`;
    return true;
  }

  if (obstacle.kind === "flipper") {
    if (!rectCircleIntersect({ x: player.x, y: player.y, r: player.r }, obstacle)) return false;
    const flipActive = obstacle.side === "left" ? game.flipL : game.flipR;
    const upKick = flipActive ? -820 : -280;
    player.vy = upKick;
    player.vx += obstacle.side === "left" ? 280 : -280;
    player.y = obstacle.y - player.r;
    game.score += 15;
    game.reason = `Flipper! τ = Iα — angular acceleration becomes linear launch.`;
    return true;
  }

  if (!rectCircleIntersect({ x: player.x, y: player.y, r: player.r }, obstacle)) return false;

  const fromTop = player.y < obstacle.y + obstacle.h / 2 && player.vy >= 0;
  const fromBottom = player.y > obstacle.y + obstacle.h / 2 && player.vy <= 0;

  if (obstacle.kind === "spike") {
    damagePlayer(game, "Spike contact. Lower gravity or choose a cleaner path.", {
      knockbackX: player.vx >= 0 ? -320 : 320,
      knockbackY: -220,
    });
    return true;
  }

  if (obstacle.kind === "bouncePad") {
    if (fromTop || fromBottom) {
      const bounceStrength = Math.max(280, Math.abs(player.vy) * Math.max(0.35, params.elasticity) + params.jumpSpeed * 0.55);
      // In climb the player hits pads from below going UP — they should be boosted further upward.
      // In all other scenes hitting from below means the pad deflects you back down.
      const climbBoost = game.activeSceneId === "climb" && fromBottom;
      player.vy = (fromTop || climbBoost) ? -bounceStrength : bounceStrength * 0.5;
      player.y = fromTop ? obstacle.y - player.r : obstacle.y + obstacle.h + player.r;
      player.grounded = false;
      game.reason = `Bounce pad! e = ${formatNumber(params.elasticity, 2)} — v_after/v_before`;
      return true;
    }
  }

  if (fromTop) {
    player.y = obstacle.y - player.r;
    if (Math.abs(player.vy) > 110 && params.elasticity > 0.08 && obstacle.kind !== "roof") {
      player.vy = -Math.abs(player.vy) * params.elasticity;
      player.grounded = false;
      game.reason = `Impact bounced. Elasticity = ${formatNumber(params.elasticity, 2)}`;
    } else {
      player.vy = 0;
      player.grounded = obstacle.kind !== "roof";
    }
  } else if (fromBottom) {
    player.y = obstacle.y + obstacle.h + player.r;
    player.vy = Math.abs(player.vy) * 0.22;
    game.reason = "You hit the underside. Too much gravity can do that.";
  } else {
    const pushLeft = player.x < obstacle.x + obstacle.w / 2;
    player.x = pushLeft ? obstacle.x - player.r : obstacle.x + obstacle.w + player.r;
    player.vx = (pushLeft ? -1 : 1) * Math.abs(player.vx) * Math.max(0.2, params.elasticity);
    if (superGravity) {
      player.vx *= 0.8;
    }
  }
  return true;
}

function updateEnemies(game, dt) {
  for (const enemy of game.enemies) {
    enemy.phase += dt * 2.4;
    if (enemy.behavior === "hover") {
      enemy.y += Math.sin(enemy.phase) * enemy.amplitude * dt;
    } else if (enemy.behavior === "zigzag" || enemy.behavior === "patrol") {
      enemy.x += Math.sin(enemy.phase * 1.35) * enemy.vx * dt;
    } else if (enemy.behavior === "vertical") {
      enemy.y += Math.sin(enemy.phase * 1.6) * enemy.amplitudeY * dt;
    } else if (enemy.behavior === "swoop") {
      enemy.x += Math.cos(enemy.phase * 0.8) * enemy.vx * 0.35 * dt;
      enemy.y += Math.sin(enemy.phase * 2.1) * enemy.amplitudeY * dt;
    } else if (enemy.behavior === "chaser") {
      const dx = game.player.x - enemy.x;
      const dy = game.player.y - enemy.y;
      const dir = normalize(dx, dy);
      enemy.x += dir.x * Math.abs(enemy.vx) * 0.45 * dt;
      enemy.y += dir.y * Math.abs(enemy.vx) * 0.45 * dt;
    }
  }
}

function updateRun(game, params, input, dt) {
  const scene = activeScene(game);
  const regionIndex = Math.max(0, Math.floor(game.player.x / SEGMENT_LENGTH));
  const shaftCenterX = game.sceneAnchorX;
  const shaftLeft = shaftCenterX - SHAFT_HALF_W;
  const shaftRight = shaftCenterX + SHAFT_HALF_W;
  game.currentRegionIndex = regionIndex;
  const superGravity = game.unlocks.crush && input.superGravity && game.energy >= 30;
  const gravity = params.gravity * (superGravity ? 2.35 : 1);
  const player = game.player;

  game.lastDt = dt;
  game.survivedSeconds += dt;
  game.invulnerable = Math.max(0, game.invulnerable - dt);
  game.regionGrace = Math.max(0, game.regionGrace - dt);
  game.score += dt * (100 + game.difficulty * 16);
  game.difficulty = 1 + game.survivedSeconds / 18;
  game.shotCooldown = Math.max(0, game.shotCooldown - dt);

  const horizontalInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const ax = projectHorizontalInput(params.mode, horizontalInput, params.controlGain, player.vx, player.grounded);
  player.vx += ax * dt;
  player.vy += gravity * dt;

  if (player.grounded && input.jumpQueued) {
    player.vy = -params.jumpSpeed;
    player.grounded = false;
    game.reason = `Jump launched at ${formatNumber(params.jumpSpeed, 0)} px/s`;
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;
  game.furthestX = Math.max(game.furthestX, player.x);

  if (scene.id === "side") {
    player.x = Math.max(WALL + player.r, player.x);
  } else {
    player.x = clamp(player.x, shaftLeft + player.r, shaftRight - player.r);
  }
  if (player.x <= WALL + player.r + 1 && scene.id === "side") {
    player.vx = Math.abs(player.vx) * Math.max(0.2, params.elasticity);
  }

  player.grounded = false;

  if (scene.id === "side") {
    if (player.y >= GROUND_Y - player.r) {
      // Check if player is over a pitfall — if so let them fall into free-fall
      const overPit = game.obstacles.some(
        (o) => o.kind === "pitfall" && player.x > o.x && player.x < o.x + o.w,
      );
      if (overPit) {
        if (player.y > GROUND_Y + 160) {
          beginRegionTransition(game, "fall", player.x);
          game.reason = "Fell into the gap — free fall begins! KE = ½mv² — all that falling speed becomes momentum.";
          return;
        }
        // just keep falling
      } else if (Math.abs(player.vy) > 120 && params.elasticity > 0.08) {
        player.y = GROUND_Y - player.r;
        player.vy = -Math.abs(player.vy) * params.elasticity;
        game.reason = "Floor bounce. More elasticity keeps you lively.";
      } else {
        player.y = GROUND_Y - player.r;
        player.vy = 0;
        player.grounded = true;
        player.vx *= Math.max(0.1, 1 - params.friction * 5.5 * dt);
      }
    }
    if (player.y <= 74 + player.r) {
      player.y = 74 + player.r;
      player.vy = Math.abs(player.vy) * 0.22;
      game.reason = "You scraped the roof. Gravity and jump speed are fighting each other.";
    }
  } else if (scene.id === "pinball") {
    // Bounce off side walls of the pinball room
    if (player.x <= shaftLeft + player.r + 1) {
      player.vx = Math.abs(player.vx) * Math.max(0.6, params.elasticity);
    }
    if (player.x >= shaftRight - player.r - 1) {
      player.vx = -Math.abs(player.vx) * Math.max(0.6, params.elasticity);
    }
    // Ceiling bounce
    if (player.y <= 80 + player.r) {
      player.y = 80 + player.r;
      player.vy = Math.abs(player.vy) * 0.7;
    }
    // Fall through bottom → return to side scroll (drain!)
    if (player.y > WORLD_H - 30) {
      returnToSideScene(game, "Ball drained — back to the run. In pinball, potential energy (mgh) becomes kinetic speed when the ball drops.");
      game.energy = Math.max(0, game.energy - 20);
      return;
    }
    // Space = both flippers simultaneously
    if (input.jumpQueued) {
      game.flipL = true;
      game.flipR = true;
      setTimeout(() => { game.flipL = false; game.flipR = false; }, 120);
    }
  } else if (scene.id === "fall") {
    if (player.x <= shaftLeft + player.r + 1 || player.x >= shaftRight - player.r - 1) {
      player.vx *= -Math.max(0.2, params.elasticity);
      game.reason = "Shaft wall rebound.";
    }
    if (player.y > WORLD_H - 70) {
      returnToSideScene(game, "Free-fall complete — you threaded the shaft. KE = ½mv²: all that speed converts back to horizontal momentum.");
      game.score += 220;
      game.energy = Math.min(100, game.energy + 18);
      return;
    }
  } else {
    if (player.x <= shaftLeft + player.r + 1 || player.x >= shaftRight - player.r - 1) {
      player.vx *= -Math.max(0.2, params.elasticity);
      game.reason = "Wall rebound. Keep the climb controlled.";
    }
    // Danger floor at the bottom of the shaft — big bounce back up, costs energy
    if (player.y >= WORLD_H - 80) {
      player.y = WORLD_H - 80 - player.r;
      player.vy = -Math.max(300, Math.abs(player.vy) * Math.max(0.5, params.elasticity));
      player.grounded = false;
      if (game.invulnerable <= 0) {
        game.energy = Math.max(0, game.energy - 12);
        game.reason = "Hit the danger floor! Bounce pads build potential energy — use them to climb.";
      }
    }
    if (player.y < 70) {
      returnToSideScene(game, "Climb complete — gravitational PE = mgh. You converted bounce-pad energy into height and escaped.");
      game.score += 260;
      game.energy = Math.min(100, game.energy + 24);
      return;
    }
  }

  for (const obstacle of game.obstacles) {
    if (!game.alive) break;
    resolveObstacleCollision(game, obstacle, params, superGravity);
  }

  updateEnemies(game, dt);

  for (const projectile of game.projectiles) {
    for (const enemy of game.enemies) {
      const dx = projectile.x - enemy.x;
      const dy = projectile.y - enemy.y;
      if (dx * dx + dy * dy <= (projectile.r + enemy.r) * (projectile.r + enemy.r)) {
        projectile.ttl = -1;
        enemy.dead = true;
        game.reason = projectile.hostile ? "A ricochet bolt still found a threat." : "Threat removed with a math bolt.";
        game.score += 60;
      }
    }
  }

  updateProjectiles(game, dt);

  for (const enemy of game.enemies) {
    if (enemy.dead || !game.alive) continue;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const hit = dx * dx + dy * dy <= (player.r + enemy.r) * (player.r + enemy.r);
    if (!hit) continue;

    const crushable = superGravity && player.vy > 240;
    if (crushable) {
      enemy.dead = true;
      player.vy = -Math.abs(player.vy) * 0.22;
      game.reason = "Super gravity crush. Power helps, but it makes motion harsher.";
      game.score += 85;
    } else {
      // Enormous elastic-collision knockback — visually dramatic, teaches impulse
      const impactDir = Math.sign(dx || -1);
      damagePlayer(game, "Enemy impact! Impulse = FΔt — the heavier they are, the harder you fly.", {
        knockbackX: impactDir * 920,
        knockbackY: -680,
      });
    }
  }

  for (const projectile of game.projectiles) {
    if (!projectile.hostile || !game.alive) continue;
    const dx = player.x - projectile.x;
    const dy = player.y - projectile.y;
    if (dx * dx + dy * dy <= (player.r + projectile.r) * (player.r + projectile.r)) {
      projectile.ttl = -1;
      damagePlayer(game, "Your own overpowered bolt came back.", { knockbackX: -260, knockbackY: -180 });
    }
  }

  for (const collectible of game.collectibles) {
    const dx = player.x - collectible.x;
    const dy = player.y - collectible.y;
    if (dx * dx + dy * dy <= (player.r + collectible.r) * (player.r + collectible.r)) {
      collectible.collected = true;
      if (collectible.type === "life") {
        game.lives = Math.min(5, game.lives + 1);
        game.reason = "Life pickup collected.";
      } else {
        game.energy = Math.min(100, game.energy + 24);
        game.reason = "Energy pickup collected.";
      }
      game.score += 50;
      if (game.pendingTutorial && !game.tutorial) {
        game.tutorial = game.pendingTutorial;
        game.pendingTutorial = null;
      }
    }
  }

  game.enemies = game.enemies.filter((enemy) => !enemy.dead);
  game.collectibles = game.collectibles.filter((collectible) => !collectible.collected);
  game.effects = game.effects
    .map((effect) => ({ ...effect, ttl: effect.ttl - dt }))
    .filter((effect) => effect.ttl > 0);

  if (scene.id === "side") {
    const spawnLead = WORLD_W * 1.4;
    while (game.nextSpawnX < game.player.x + spawnLead) {
      spawnSceneContent(game, game.nextSpawnX);
      game.nextSpawnX += 260 + Math.random() * 100;
    }
  } else if (game.runMode === "scene_test" && scene.id === "fall") {
    while (game.nextSceneSpawnMetric < game.player.y + WORLD_H * 1.25) {
      spawnSceneTestContent(game);
    }
  } else if (game.runMode === "scene_test" && scene.id === "climb") {
    while (game.nextSceneSpawnMetric > game.player.y - WORLD_H * 0.95) {
      spawnSceneTestContent(game);
    }
  }

  game.obstacles = game.obstacles.filter((obstacle) => obstacle.sceneScoped || obstacle.x + obstacle.w > game.player.x - WORLD_W * 0.6);
  game.enemies = game.enemies.filter((enemy) => enemy.sceneScoped || enemy.x + enemy.r > game.player.x - WORLD_W * 0.6);
  game.projectiles = game.projectiles.filter((projectile) => projectile.sceneScoped || projectile.x + projectile.r > game.player.x - WORLD_W * 0.8);
  game.collectibles = game.collectibles.filter((collectible) => collectible.sceneScoped || collectible.x + collectible.r > game.player.x - WORLD_W * 0.8);

  if (game.runMode === "scene_test" && scene.id === "fall") {
    game.obstacles = game.obstacles.filter((obstacle) => !obstacle.sceneScoped || (obstacle.y + obstacle.h > game.player.y - WORLD_H * 0.4 && obstacle.y < game.player.y + WORLD_H * 1.6));
    game.enemies = game.enemies.filter((enemy) => !enemy.sceneScoped || (enemy.y + enemy.r > game.player.y - WORLD_H * 0.5 && enemy.y - enemy.r < game.player.y + WORLD_H * 1.4));
    game.collectibles = game.collectibles.filter((collectible) => !collectible.sceneScoped || (collectible.y + collectible.r > game.player.y - WORLD_H * 0.5 && collectible.y - collectible.r < game.player.y + WORLD_H * 1.4));
  }
  if (game.runMode === "scene_test" && scene.id === "climb") {
    game.obstacles = game.obstacles.filter((obstacle) => !obstacle.sceneScoped || (obstacle.y + obstacle.h > game.player.y - WORLD_H * 1.4 && obstacle.y < game.player.y + WORLD_H * 0.6));
    game.enemies = game.enemies.filter((enemy) => !enemy.sceneScoped || (enemy.y + enemy.r > game.player.y - WORLD_H * 1.4 && enemy.y - enemy.r < game.player.y + WORLD_H * 0.6));
    game.collectibles = game.collectibles.filter((collectible) => !collectible.sceneScoped || (collectible.y + collectible.r > game.player.y - WORLD_H * 1.4 && collectible.y - collectible.r < game.player.y + WORLD_H * 0.6));
  }

  maybeUnlockProgress(game);
  maybeUpdateCheckpoint(game);

  // Real-time lightning strikes — 40% target the nearest visible rod (tall conductors attract)
  game.lightningTimer -= dt;
  if (game.lightningTimer <= 0) {
    let tx;
    if (Math.random() < 0.4) {
      const visibleRods = game.obstacles.filter(
        (o) => o.kind === "lightningRod" && o.x > player.x - 200 && o.x < player.x + WORLD_W,
      );
      if (visibleRods.length > 0) {
        const rod = visibleRods[Math.floor(Math.random() * visibleRods.length)];
        tx = rod.x + rod.w / 2;
      }
    }
    if (!tx) {
      tx = Math.random() < 0.55
        ? player.x + 80 + Math.random() * 400
        : player.x - 80 - Math.random() * 300;
    }
    spawnLightningStrike(game, tx);
    game.lightningTimer = 3 + Math.random() * 5;
  }
  game.lightningBolts = game.lightningBolts.filter((b) => {
    b.ttl -= dt;
    return b.ttl > 0;
  });

  // Collect charge from charged lightning rods
  for (const obs of game.obstacles) {
    if (obs.kind !== "lightningRod") continue;
    const charge = game.lightningRodCharges[obs.id] || 0;
    if (charge <= 0) continue;
    const dx = player.x - (obs.x + obs.w / 2);
    const dy = player.y - obs.y;
    if (dx * dx + dy * dy < (player.r + 22) * (player.r + 22)) {
      game.energy = Math.min(100, game.energy + 28 * charge);
      game.lightningRodCharges[obs.id] = 0;
      game.score += 40 * charge;
      game.reason = `Rod discharged: Q = CV — capacitor released ${charge} charge unit${charge > 1 ? "s" : ""}. Energy gained!`;
      if (!game.tutorial && !game.pendingTutorial) {
        game.pendingTutorial = makeTutorial(
          "lightning",
          "Euler: Electric Charge",
          `You just discharged a lightning rod like a capacitor. The formula is Q = CV — charge (Q) equals capacitance (C) times voltage (V). Lightning rods are conductors that attract charge from clouds. The taller the rod, the stronger the electric field at its tip (E = V/d). That is how Franklin's rod protected buildings — give the charge a safe path to ground.`,
        );
      }
    }
  }

  if (game.furthestX >= game.goalX && !game.tutorial && game.alive) {
    game.tutorial = makeTutorial(
      "pi",
      "Euler: Pi signal located",
      "You reached Pi's signal. π ≈ 3.14159… is the ratio of any circle's circumference to its diameter — and it shows up everywhere: your ball's arc, wave frequencies, electrical impedance, even probability distributions. Every new stretch from here will be harder. The math gets more interesting too.",
    );
    game.goalX += 12000;
    game.score += 500;
  }
}

function previewTrajectory(game, params, input) {
  const scene = activeScene(game);
  const sample = {
    activeSceneId: game.activeSceneId,
    sceneAnchorX: game.sceneAnchorX,
    player: {
      ...game.player,
      grounded: game.player.grounded,
    },
    obstacles: game.obstacles.map((obstacle) => ({ ...obstacle })),
    lastDt: PREVIEW_DT,
  };
  const points = [{ x: sample.player.x, y: sample.player.y }];

  for (let step = 0; step < PREVIEW_STEPS; step += 1) {
    const ax = projectHorizontalInput(
      params.mode,
      input,
      params.controlGain,
      sample.player.vx,
      sample.player.grounded,
    );
    sample.player.vx += ax * PREVIEW_DT;
    sample.player.vy += params.gravity * PREVIEW_DT;

    if (sample.player.grounded) {
      sample.player.vy = -params.jumpSpeed;
      sample.player.grounded = false;
    }

    sample.player.x += sample.player.vx * PREVIEW_DT;
    sample.player.y += sample.player.vy * PREVIEW_DT;
    sample.player.x = clamp(sample.player.x, WALL + sample.player.r, WORLD_W - WALL - sample.player.r);
    sample.player.grounded = false;

    const sampleScene = sceneById(sample.activeSceneId || "side");

    if (sampleScene.id === "side") {
      if (sample.player.y >= GROUND_Y - sample.player.r) {
        sample.player.y = GROUND_Y - sample.player.r;
        sample.player.vy = 0;
        sample.player.grounded = true;
        sample.player.vx *= Math.max(0.1, 1 - params.friction * 5.5 * PREVIEW_DT);
      }
    } else {
      const shaftLeft = sample.sceneAnchorX - 230;
      const shaftRight = sample.sceneAnchorX + 230;
      sample.player.x = clamp(sample.player.x, shaftLeft + sample.player.r, shaftRight - sample.player.r);
    }

    for (const obstacle of sample.obstacles) {
      if (obstacle.kind === "hill") {
        const withinX = sample.player.x + sample.player.r > obstacle.x && sample.player.x - sample.player.r < obstacle.x + obstacle.w;
        if (!withinX) continue;
        const surfaceY = hillSurfaceY(obstacle, sample.player.x);
        const bottom = sample.player.y + sample.player.r;
        const top = sample.player.y - sample.player.r;
        const hillBottom = obstacle.y + obstacle.h;
        if (bottom < surfaceY - 14 || top > hillBottom + 24) continue;

        sample.player.y = surfaceY - sample.player.r;
        sample.player.vy = 0;
        sample.player.grounded = true;
        sample.player.vx += params.gravity * hillSlope(obstacle) * 0.9 * PREVIEW_DT;
        sample.player.vx *= Math.max(0.06, 1 - params.friction * 3.4 * PREVIEW_DT);
        continue;
      }
      if (!rectCircleIntersect({ x: sample.player.x, y: sample.player.y, r: sample.player.r }, obstacle)) continue;
      if (obstacle.kind === "bouncePad") {
        sample.player.y = obstacle.y - sample.player.r;
        sample.player.vy = -Math.max(220, Math.abs(sample.player.vy) * Math.max(0.35, params.elasticity) + params.jumpSpeed * 0.45);
      } else {
        const fromTop = sample.player.y < obstacle.y + obstacle.h / 2 && sample.player.vy >= 0;
        if (fromTop) {
          sample.player.y = obstacle.y - sample.player.r;
          sample.player.vy = 0;
          sample.player.grounded = true;
        }
      }
    }

    points.push({ x: sample.player.x, y: sample.player.y });
  }

  return points;
}

export default function RealityRunner() {
  const navigate = useNavigate();
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [params, setParams] = useState({
    gravity: 980,
    jumpSpeed: 560,
    elasticity: 0.42,
    friction: 0.18,
    controlGain: 1,
    shotPower: 0.58,
    mode: "velocity",
  });

  const gameRef = useRef(createRunState());
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const inputRef = useRef({
    left: false,
    right: false,
    jumpQueued: false,
    shootQueued: false,
    superGravity: false,
  });

  const resetRun = useCallback(() => {
    gameRef.current = createRunState();
    lastTimeRef.current = 0;
    setFrame((value) => value + 1);
  }, []);

  const startSceneRun = useCallback((sceneId) => {
    gameRef.current = sceneId === "side" ? createRunState() : createRunStateForScene(sceneId);
    lastTimeRef.current = 0;
    setPaused(false);
    setFrame((value) => value + 1);
  }, []);

  const restartFromCheckpoint = useCallback(() => {
    const current = gameRef.current;
    gameRef.current = createRunStateFromCheckpoint(current.checkpoint, current.unlocks);
    lastTimeRef.current = 0;
    setPaused(false);
    setFrame((value) => value + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      // Space / Enter always dismiss the Euler tutorial modal first
      if (event.code === "Space" || event.key === "Enter") {
        const game = gameRef.current;
        if (game && game.tutorial) {
          event.preventDefault();
          game.tutorial = null;
          setFrame((v) => v + 1);
          return;
        }
      }
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        event.preventDefault();
        inputRef.current.left = true;
      }
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        event.preventDefault();
        inputRef.current.right = true;
      }
      if (event.code === "Space" || event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
        event.preventDefault();
        inputRef.current.jumpQueued = true;
      }
      if (event.key === "Shift") {
        inputRef.current.superGravity = true;
      }
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        inputRef.current.shootQueued = true;
      }
      if (event.key === "z" || event.key === "Z") { if (gameRef.current) gameRef.current.flipL = true; }
      if (event.key === "x" || event.key === "X") { if (gameRef.current) gameRef.current.flipR = true; }
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        resetRun();
      }
    };

    const onKeyUp = (event) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        inputRef.current.left = false;
      }
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        inputRef.current.right = false;
      }
      if (event.key === "z" || event.key === "Z") { if (gameRef.current) gameRef.current.flipL = false; }
      if (event.key === "x" || event.key === "X") { if (gameRef.current) gameRef.current.flipR = false; }
      if (event.key === "Shift") {
        inputRef.current.superGravity = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [resetRun]);

  useEffect(() => {
    const step = (time) => {
      const game = gameRef.current;
      if (!game) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const previous = lastTimeRef.current || time;
      const dt = Math.min((time - previous) / 1000, PHYSICS_STEP_MAX);
      lastTimeRef.current = time;

      if (!paused && game.alive && !game.tutorial) {
        if (game.transition) {
          game.transition.ttl -= dt;
          if (game.transition.ttl <= 0) {
            game.transition = null;
          }
        } else {
          if (inputRef.current.shootQueued) {
            fireProjectile(game, params);
          }
          updateRun(game, params, inputRef.current, dt);
        }
      }

      inputRef.current.jumpQueued = false;
      inputRef.current.shootQueued = false;

      setFrame((value) => value + 1);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [params, paused]);

  const game = gameRef.current;
  const scene = activeScene(game);
  const sceneIndex = game.currentRegionIndex;
  const sceneCenterX = scene.id === "side" ? game.player.x : game.sceneAnchorX;
  const inputDirection = (inputRef.current.right ? 1 : 0) - (inputRef.current.left ? 1 : 0);

  const cameraX = scene.id === "side"
    ? Math.max(0, game.player.x - WORLD_W * 0.34)
    : Math.max(0, sceneCenterX - WORLD_W * 0.5);
  const cameraY = scene.id === "side"
    ? 0
    : game.runMode === "scene_test" && scene.id === "fall"
      ? Math.max(0, game.player.y - WORLD_H * 0.22)
      : game.runMode === "scene_test" && scene.id === "climb"
        ? Math.max(0, game.player.y - WORLD_H * 0.72)
        : clamp(game.player.y - WORLD_H * 0.5, -40, WORLD_H * 0.75);

  const previewPoints = useMemo(
    () => (showPreview ? previewTrajectory(game, params, inputDirection) : []),
    [frame, game, inputDirection, params, showPreview],
  );

  const velocityVector = useMemo(() => {
    const direction = normalize(game.player.vx, game.player.vy);
    const scale = Math.min(120, magnitude(game.player.vx, game.player.vy) * 0.18);
    return {
      x2: game.player.x + direction.x * scale,
      y2: game.player.y + direction.y * scale,
    };
  }, [frame, game.player.x, game.player.y, game.player.vx, game.player.vy]);

  const currentAx = projectHorizontalInput(params.mode, inputDirection, params.controlGain, game.player.vx, game.player.grounded);
  const accelVector = {
    x2: game.player.x + clamp(currentAx * 0.04, -120, 120),
    y2: game.player.y + clamp(params.gravity * 0.04, -120, 120),
  };

  const liveMetrics = {
    vx: game.player.vx,
    vy: game.player.vy,
    speed: magnitude(game.player.vx, game.player.vy),
    ax: currentAx,
    gravity: params.gravity,
  };

  const learningCopy = scene.id === "side"
    ? {
        title: "Run through changing rules",
        body: "Too much gravity makes short heavy hops and can slam you into roof blocks. Hills add slope and friction, and floor or ceiling portals now let you choose when to enter free-fall or climb bonus routes.",
      }
    : scene.id === "fall"
      ? {
          title: "Controlled descent",
          body: "In free fall, lower gravity and elasticity can help you thread through hazards, but if you slow too much the upper catch zone wins.",
        }
      : {
          title: "Climb by managed rebound",
          body: "The upward section wants bounce discipline. Enough energy to climb, not so much chaos that you hit threats or lose the rhythm.",
        };

  const superGravityActive = game.unlocks.crush && inputRef.current.superGravity && game.energy > 0;
  const activeTutorial = game.tutorial;
  const activeTransition = game.transition;
  const piDistance = Math.max(0, game.goalX - game.furthestX);

  return (
    <div className="h-screen overflow-hidden bg-[#071120] text-slate-100">
      <div className="flex h-full w-full flex-col px-3 py-3 lg:px-5">
        <div className="mb-3 rounded-[24px] border border-cyan-900/30 bg-[radial-gradient(circle_at_top,_rgba(12,116,255,0.2),_transparent_34%),linear-gradient(180deg,_rgba(7,17,32,0.98),_rgba(7,17,32,0.92))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Reality Runner</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">An endless motion game where the math is the control surface</h1>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-300">
                The run stretches forward through side scroll, free fall, and upward climb regions. You can stop and tune gravity, jump speed,
                elasticity, shot power, and whether movement feels like velocity or acceleration.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Close
              </button>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  paused
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
                    : "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-slate-500"
                }`}
              >
                <Gauge className="h-4 w-4" />
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={resetRun}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Run
              </button>
              <button
                type="button"
                onClick={restartFromCheckpoint}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Checkpoint
              </button>
              <button
                type="button"
                onClick={() => setShowPreview((value) => !value)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  showPreview
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                    : "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-slate-500"
                }`}
              >
                <Orbit className="h-4 w-4" />
                Ghost Path
              </button>
              <button
                type="button"
                onClick={() => setShowOverlay((value) => !value)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  showOverlay
                    ? "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-100"
                    : "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-slate-500"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Physics Overlay
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!gameRef.current.unlocks.blaster) return;
                  inputRef.current.shootQueued = true;
                }}
                disabled={!game.unlocks.blaster}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  game.unlocks.blaster
                    ? "border-rose-400/50 bg-rose-400/10 text-rose-100 hover:border-rose-300"
                    : "cursor-not-allowed border-slate-800 bg-slate-900/40 text-slate-500"
                }`}
              >
                <Zap className="h-4 w-4" />
                Fire Bolt
              </button>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[320px_minmax(0,1fr)_330px]">
          <aside className="min-h-0 overflow-y-auto rounded-[28px] border border-slate-800 bg-[rgba(8,17,31,0.94)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="mb-6 rounded-3xl border border-cyan-500/20 bg-cyan-400/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Run Regions</div>
              <div className="mt-3 space-y-2">
                {SCENES.map((entry, index) => {
                  const active = entry.id === scene.id;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => startSceneRun(entry.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-cyan-400/60 bg-cyan-400/10"
                          : "border-slate-800 bg-slate-950/60 hover:border-cyan-400/40 hover:text-white"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{entry.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{entry.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Reality Controls</div>
              <div className="mt-3 space-y-4">
                <label className="block">
                  <div className="flex items-center justify-between text-sm font-semibold text-white">
                    <span>Gravity g</span>
                    <span>{formatNumber(params.gravity, 0)} px/s^2</span>
                  </div>
                  <input
                    type="range"
                    min="280"
                    max="1700"
                    step="20"
                    value={params.gravity}
                    onChange={(event) => setParams((current) => ({ ...current, gravity: Number(event.target.value) }))}
                    className="mt-2 h-2 w-full accent-cyan-400"
                  />
                </label>
                <label className="block">
                  <div className="flex items-center justify-between text-sm font-semibold text-white">
                    <span>Jump / rebound seed</span>
                    <span>{formatNumber(params.jumpSpeed, 0)} px/s</span>
                  </div>
                  <input
                    type="range"
                    min="260"
                    max="920"
                    step="10"
                    value={params.jumpSpeed}
                    onChange={(event) => setParams((current) => ({ ...current, jumpSpeed: Number(event.target.value) }))}
                    className="mt-2 h-2 w-full accent-emerald-400"
                  />
                </label>
                {game.unlocks.elasticity && (
                  <label className="block">
                    <div className="flex items-center justify-between text-sm font-semibold text-white">
                      <span>Elasticity e</span>
                      <span>{formatNumber(params.elasticity, 2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.01"
                      value={params.elasticity}
                      onChange={(event) => setParams((current) => ({ ...current, elasticity: Number(event.target.value) }))}
                      className="mt-2 h-2 w-full accent-fuchsia-400"
                    />
                  </label>
                )}
                <label className="block">
                  <div className="flex items-center justify-between text-sm font-semibold text-white">
                    <span>Friction mu</span>
                    <span>{formatNumber(params.friction, 2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.01"
                    value={params.friction}
                    onChange={(event) => setParams((current) => ({ ...current, friction: Number(event.target.value) }))}
                    className="mt-2 h-2 w-full accent-lime-400"
                  />
                </label>
                <label className="block">
                  <div className="flex items-center justify-between text-sm font-semibold text-white">
                    <span>Horizontal gain</span>
                    <span>{formatNumber(params.controlGain, 2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.2"
                    step="0.05"
                    value={params.controlGain}
                    onChange={(event) => setParams((current) => ({ ...current, controlGain: Number(event.target.value) }))}
                    className="mt-2 h-2 w-full accent-amber-400"
                  />
                </label>
                {game.unlocks.blaster && (
                  <label className="block">
                    <div className="flex items-center justify-between text-sm font-semibold text-white">
                      <span>Bolt power</span>
                      <span>{formatNumber(params.shotPower, 2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.01"
                      value={params.shotPower}
                      onChange={(event) => setParams((current) => ({ ...current, shotPower: Number(event.target.value) }))}
                      className="mt-2 h-2 w-full accent-rose-400"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Motion Law</div>
              <div className="mt-3 space-y-2">
                {Object.values(CONTROL_MODES).map((mode) => {
                  const active = params.mode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setParams((current) => ({ ...current, mode: mode.id }))}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        active ? "border-amber-400/60 bg-amber-400/10" : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{mode.label}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{mode.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="min-h-0 rounded-[30px] border border-slate-800 bg-[rgba(8,17,31,0.95)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Endless Run</div>
                <h2 className="mt-1 text-2xl font-semibold text-white">{scene.title}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">{scene.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
                <div className="rounded-full border border-slate-700 px-3 py-2">Score {formatNumber(game.score, 0)}</div>
                <div className="rounded-full border border-slate-700 px-3 py-2">Time {formatNumber(game.survivedSeconds, 1)}s</div>
                <div className="rounded-full border border-slate-700 px-3 py-2">Difficulty {formatNumber(game.difficulty, 2)}x</div>
                <div className="rounded-full border border-slate-700 px-3 py-2">{paused ? "Paused" : "Live"}</div>
              </div>
            </div>

            <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)]">
              <div className="relative min-h-[560px] overflow-hidden rounded-[28px] border border-slate-800 bg-[#08101b]">
                <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} className="block h-full w-full">
                  <defs>
                    <linearGradient id="rr-field" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor={scene.id === "fall" ? "#1a3048" : "#17344a"} />
                      <stop offset="100%" stopColor="#08101b" />
                    </linearGradient>
                    <filter id="rr-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <marker id="rr-arrow-cyan" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 z" fill="#4fd1ff" />
                    </marker>
                    <marker id="rr-arrow-pink" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 z" fill="#ff75cf" />
                    </marker>
                  </defs>

                  <rect width={WORLD_W} height={WORLD_H} fill="url(#rr-field)" />
                  <rect x={WALL / 2} y={WALL / 2} width={WORLD_W - WALL} height={WORLD_H - WALL} rx="28" fill="none" stroke="rgba(96,165,250,0.18)" strokeWidth="2" />

                  <g transform={`translate(${-cameraX}, ${-cameraY})`}>
                    {scene.id === "side" && Array.from({ length: 3 }).map((_, offset) => {
                      const boundaryX = (sceneIndex + offset) * SEGMENT_LENGTH;
                      if (boundaryX <= cameraX + 80 || boundaryX >= cameraX + WORLD_W - 40) return null;
                      return (
                        <g key={`boundary-${boundaryX}`}>
                          <rect x={boundaryX - 6} y={cameraY + 30} width="12" height={WORLD_H - 60} rx="6" fill="rgba(56,189,248,0.08)" />
                          <line x1={boundaryX} y1={cameraY + 40} x2={boundaryX} y2={cameraY + WORLD_H - 40} stroke="#67e8f9" strokeWidth="3" strokeDasharray="10 10" />
                          <line x1={boundaryX - 12} y1={cameraY + 90} x2={boundaryX + 12} y2={cameraY + 130} stroke="#a78bfa" strokeWidth="3" />
                          <line x1={boundaryX + 10} y1={cameraY + 180} x2={boundaryX - 14} y2={cameraY + 220} stroke="#38bdf8" strokeWidth="3" />
                          <line x1={boundaryX - 10} y1={cameraY + 290} x2={boundaryX + 14} y2={cameraY + 332} stroke="#67e8f9" strokeWidth="3" />
                        </g>
                      );
                    })}
                    {scene.id === "side" && (() => {
                      // Render ground with dark pit gaps where pitfall obstacles are
                      const pits = game.obstacles.filter((o) => o.kind === "pitfall");
                      const groundLeft = cameraX - 80;
                      const groundRight = cameraX + WORLD_W + 80;
                      // Build segments between pits
                      const segments = [];
                      let cursor = groundLeft;
                      const sortedPits = [...pits].sort((a, b) => a.x - b.x);
                      for (const pit of sortedPits) {
                        if (pit.x > cursor && pit.x < groundRight) {
                          segments.push({ x: cursor, w: pit.x - cursor });
                        }
                        cursor = Math.max(cursor, pit.x + pit.w);
                      }
                      if (cursor < groundRight) segments.push({ x: cursor, w: groundRight - cursor });
                      return (
                        <>
                          {segments.map((seg, si) => (
                            <rect key={si} x={seg.x} y={GROUND_Y} width={seg.w} height={WORLD_H - GROUND_Y + 60} fill="rgba(51,65,85,0.82)" />
                          ))}
                          {/* Pit openings — void below */}
                          {sortedPits.map((pit) => (
                            <rect key={pit.id} x={pit.x} y={GROUND_Y} width={pit.w} height={WORLD_H - GROUND_Y + 60} fill="rgba(2,4,12,0.97)" />
                          ))}
                          <rect x={groundLeft} y={74} width={WORLD_W + 160} height="18" fill="rgba(24,34,52,0.85)" />
                        </>
                      );
                    })()}
                    {scene.id === "fall" && (
                      <>
                        <rect x={sceneCenterX - SHAFT_HALF_W - 24} y={cameraY - 120} width={SHAFT_HALF_W * 2 + 48} height={WORLD_H + 240} rx="36" fill="rgba(2,6,23,0.44)" stroke="rgba(96,165,250,0.22)" strokeWidth="2" />
                        {Array.from({ length: 14 }).map((_, index) => {
                          const streakX = sceneCenterX - 170 + (index % 7) * 56;
                          const streakOffset = ((cameraY * 0.55) + index * 70) % (WORLD_H + 260);
                          const streakY = cameraY - 120 + streakOffset;
                          return (
                            <line
                              key={`fall-streak-${index}`}
                              x1={streakX}
                              y1={streakY}
                              x2={streakX + (index % 2 === 0 ? -10 : 10)}
                              y2={streakY + 42}
                              stroke="rgba(103,232,249,0.22)"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          );
                        })}
                        {game.runMode === "main" && (
                          <>
                            <rect x={cameraX - 80} y="0" width={WORLD_W + 160} height="110" fill="rgba(127,29,29,0.32)" />
                            <text x={cameraX + WORLD_W / 2} y="68" textAnchor="middle" fill="#fecaca" fontSize="16" fontWeight="700">
                              Catch zone
                            </text>
                          </>
                        )}
                        <ellipse cx={sceneCenterX} cy={cameraY + 96} rx="86" ry="28" fill="rgba(56,189,248,0.14)" stroke="#67e8f9" strokeWidth="3" />
                        <ellipse cx={sceneCenterX} cy={cameraY + 96} rx="60" ry="18" fill="rgba(2,6,23,0.9)" />
                      </>
                    )}
                    {scene.id === "climb" && (
                      <>
                        <rect x={sceneCenterX - SHAFT_HALF_W - 24} y={cameraY - 120} width={SHAFT_HALF_W * 2 + 48} height={WORLD_H + 240} rx="36" fill="rgba(2,6,23,0.44)" stroke="rgba(167,139,250,0.22)" strokeWidth="2" />
                        {game.runMode === "main" && (
                          <>
                            <rect x={cameraX - 80} y={WORLD_H - 88} width={WORLD_W + 160} height="88" fill="rgba(127,29,29,0.32)" />
                            <text x={cameraX + WORLD_W / 2} y={WORLD_H - 40} textAnchor="middle" fill="#fecaca" fontSize="16" fontWeight="700">
                              Rising hazard
                            </text>
                          </>
                        )}
                        {/* Soft floor glow at the bottom of the shaft */}
                        <rect x={sceneCenterX - SHAFT_HALF_W + 24} y={cameraY + WORLD_H - 80} width={SHAFT_HALF_W * 2 - 48} height={60} rx="12" fill="rgba(239,68,68,0.18)" stroke="rgba(252,165,165,0.35)" strokeWidth="2" />
                        <text x={sceneCenterX} y={cameraY + WORLD_H - 30} textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">danger zone</text>
                        <ellipse cx={sceneCenterX} cy={cameraY + 120} rx="86" ry="28" fill="rgba(167,139,250,0.16)" stroke="#c4b5fd" strokeWidth="3" />
                        <ellipse cx={sceneCenterX} cy={cameraY + 120} rx="60" ry="18" fill="rgba(2,6,23,0.9)" />
                      </>
                    )}
                    {scene.id === "pinball" && (
                      // 2.5D perspective overlay — skew gives the slanted table feel
                      <g transform={`skewY(-8) translate(0, 40)`}>
                        {/* Table outline */}
                        <rect x={sceneCenterX - SHAFT_HALF_W - 20} y={80} width={SHAFT_HALF_W * 2 + 40} height={WORLD_H - 100} rx="18" fill="none" stroke="rgba(251,191,36,0.35)" strokeWidth="3" strokeDasharray="8 6" />
                        {/* Cannon at top right — decorative, teaches projectile launch */}
                        <rect x={sceneCenterX + SHAFT_HALF_W - 60} y={88} width={50} height={28} rx="8" fill="rgba(100,116,139,0.9)" stroke="#94a3b8" strokeWidth="2" />
                        <text x={sceneCenterX + SHAFT_HALF_W - 35} y={107} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">CANNON</text>
                        {/* Score target hint */}
                        <text x={sceneCenterX} y={WORLD_H - 20} textAnchor="middle" fill="rgba(251,191,36,0.7)" fontSize="13" fontWeight="700">
                          Z = left flipper · X = right flipper · Space = both · Fall = drain
                        </text>
                      </g>
                    )}

                    {showPreview && previewPoints.length > 1 && (
                      <polyline
                        points={previewPoints.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ")}
                        fill="none"
                        stroke="rgba(244, 114, 182, 0.9)"
                        strokeDasharray="10 8"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {game.obstacles.map((obstacle) => {
                    if (obstacle.kind === "hill") {
                      const startX = obstacle.x;
                      const endX = obstacle.x + obstacle.w;
                      const topY = obstacle.y;
                      const bottomY = obstacle.y + obstacle.h;
                      const path = obstacle.dir === "up"
                        ? `M${startX},${bottomY} L${endX},${bottomY} L${endX},${topY} Z`
                        : `M${startX},${topY} L${endX},${bottomY} L${startX},${bottomY} Z`;
                      const guide = obstacle.dir === "up"
                        ? `M${startX},${bottomY} L${endX},${topY}`
                        : `M${startX},${topY} L${endX},${bottomY}`;
                      return (
                        <g key={obstacle.id}>
                          <path d={path} fill="rgba(56,189,248,0.16)" stroke="rgba(125,211,252,0.45)" strokeWidth="2" />
                          <path d={guide} fill="none" stroke="rgba(103,232,249,0.95)" strokeWidth="5" strokeLinecap="round" />
                        </g>
                      );
                    }
                    if (obstacle.kind === "spike") {
                      return (
                        <g key={obstacle.id}>
                          {Array.from({ length: Math.max(2, Math.floor(obstacle.w / 18)) }).map((_, index) => {
                            const step = obstacle.w / Math.max(2, Math.floor(obstacle.w / 18));
                            const x = obstacle.x + index * step;
                            return (
                              <path
                                key={`${obstacle.id}-${index}`}
                                d={`M${x},${obstacle.y + obstacle.h} L${x + step / 2},${obstacle.y} L${x + step},${obstacle.y + obstacle.h}`}
                                fill="rgba(251,113,133,0.9)"
                              />
                            );
                          })}
                        </g>
                      );
                    }
                    if (obstacle.kind === "portal") {
                      const portalColor = obstacle.target === "fall" ? "#67e8f9" : obstacle.target === "climb" ? "#c4b5fd" : "#4ade80";
                      const innerColor = obstacle.target === "fall" ? "rgba(34,211,238,0.14)" : obstacle.target === "climb" ? "rgba(167,139,250,0.18)" : "rgba(74,222,128,0.14)";
                      const label = obstacle.target === "fall" ? "FREE FALL" : obstacle.target === "climb" ? "CLIMB" : "EXIT ↑";
                      return (
                        <g key={obstacle.id} filter="url(#rr-glow)">
                          <rect x={obstacle.x} y={obstacle.y} width={obstacle.w} height={obstacle.h} rx="12" fill={innerColor} stroke={portalColor} strokeWidth="3" />
                          <ellipse cx={obstacle.x + obstacle.w / 2} cy={obstacle.y + obstacle.h / 2} rx={obstacle.w * 0.32} ry={obstacle.h * 0.28} fill="rgba(2,6,23,0.92)" stroke={portalColor} strokeWidth="2" />
                          <text x={obstacle.x + obstacle.w / 2} y={obstacle.y - 8} textAnchor="middle" fill={portalColor} fontSize="12" fontWeight="700">
                            {label}
                          </text>
                        </g>
                      );
                    }
                    if (obstacle.kind === "bumper") {
                      return (
                        <g key={obstacle.id} filter="url(#rr-glow)">
                          <circle cx={obstacle.x} cy={obstacle.y} r={obstacle.r + 6} fill="rgba(251,191,36,0.12)" />
                          <circle cx={obstacle.x} cy={obstacle.y} r={obstacle.r} fill="rgba(251,191,36,0.82)" stroke="#fde68a" strokeWidth="3" />
                          <text x={obstacle.x} y={obstacle.y + 5} textAnchor="middle" fill="#08101b" fontSize="14" fontWeight="900">●</text>
                        </g>
                      );
                    }
                    if (obstacle.kind === "flipper") {
                      const active = obstacle.side === "left" ? game.flipL : game.flipR;
                      const tilt = obstacle.side === "left" ? (active ? -28 : 12) : (active ? 28 : -12);
                      const cx2 = obstacle.x + obstacle.w / 2;
                      const cy2 = obstacle.y + obstacle.h / 2;
                      return (
                        <g key={obstacle.id} transform={`rotate(${tilt}, ${cx2}, ${cy2})`}>
                          <rect x={obstacle.x} y={obstacle.y} width={obstacle.w} height={obstacle.h} rx="9" fill={active ? "rgba(251,191,36,0.9)" : "rgba(148,163,184,0.72)"} stroke={active ? "#fde68a" : "#94a3b8"} strokeWidth="2" />
                        </g>
                      );
                    }
                    if (obstacle.kind === "water") {
                      return (
                        <g key={obstacle.id}>
                          <rect x={obstacle.x} y={obstacle.y} width={obstacle.w} height={obstacle.h} rx="24" fill="rgba(56,189,248,0.14)" stroke="rgba(103,232,249,0.3)" strokeWidth="2" />
                          {(() => {
                            const t = Date.now() / 420;
                            const pts = Array.from({ length: 10 }, (_, i) => {
                              const rx = obstacle.x + 8 + ((obstacle.w - 16) * i) / 9;
                              const ry = obstacle.y + 12 + Math.sin(t + (i / 9) * Math.PI * 2.5) * 8;
                              return `${rx.toFixed(1)},${ry.toFixed(1)}`;
                            }).join(" ");
                            return <polyline points={pts} fill="none" stroke="rgba(125,211,252,0.95)" strokeWidth="3" strokeLinecap="round" />;
                          })()}
                        </g>
                      );
                    }

                    const fill =
                      obstacle.kind === "bouncePad"
                        ? "rgba(34,197,94,0.72)"
                        : obstacle.kind === "roof"
                          ? "rgba(71,85,105,0.88)"
                          : "rgba(51,65,85,0.92)";
                    const inner =
                      obstacle.kind === "bouncePad"
                        ? "rgba(134,239,172,0.55)"
                        : "rgba(100,116,139,0.28)";
                    return (
                      <g key={obstacle.id}>
                        <rect x={obstacle.x} y={obstacle.y} width={obstacle.w} height={obstacle.h} rx="10" fill={fill} stroke="rgba(148,163,184,0.22)" strokeWidth="2" />
                        <rect x={obstacle.x + 5} y={obstacle.y + 4} width={Math.max(0, obstacle.w - 10)} height={Math.max(0, obstacle.h - 8)} rx="8" fill={inner} />
                      </g>
                    );
                    })}

                    {game.enemies.map((enemy) => {
                    if (enemy.shape === "diamond") {
                      return (
                        <g key={enemy.id} filter="url(#rr-glow)">
                          <path
                            d={`M${enemy.x},${enemy.y - enemy.r} L${enemy.x + enemy.r},${enemy.y} L${enemy.x},${enemy.y + enemy.r} L${enemy.x - enemy.r},${enemy.y} Z`}
                            fill="rgba(251,113,133,0.82)"
                            stroke="#fda4af"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    }
                    if (enemy.shape === "triangle") {
                      return (
                        <g key={enemy.id} filter="url(#rr-glow)">
                          <path
                            d={`M${enemy.x},${enemy.y - enemy.r} L${enemy.x + enemy.r},${enemy.y + enemy.r} L${enemy.x - enemy.r},${enemy.y + enemy.r} Z`}
                            fill="rgba(251,191,36,0.85)"
                            stroke="#fde68a"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    }
                    if (enemy.shape === "square") {
                      return (
                        <g key={enemy.id} filter="url(#rr-glow)">
                          <rect x={enemy.x - enemy.r} y={enemy.y - enemy.r} width={enemy.r * 2} height={enemy.r * 2} rx="5" fill="rgba(248,113,113,0.82)" stroke="#fecaca" strokeWidth="2" />
                        </g>
                      );
                    }
                    if (enemy.shape === "rect") {
                      return (
                        <g key={enemy.id} filter="url(#rr-glow)">
                          <rect x={enemy.x - enemy.r * 1.4} y={enemy.y - enemy.r * 0.7} width={enemy.r * 2.8} height={enemy.r * 1.4} rx="5" fill="rgba(251,146,60,0.82)" stroke="#fdba74" strokeWidth="2" />
                        </g>
                      );
                    }
                    if (enemy.shape === "pentagon") {
                      return (
                        <g key={enemy.id} filter="url(#rr-glow)">
                          <path
                            d={`M${enemy.x},${enemy.y - enemy.r} L${enemy.x + enemy.r * 0.95},${enemy.y - enemy.r * 0.2} L${enemy.x + enemy.r * 0.58},${enemy.y + enemy.r} L${enemy.x - enemy.r * 0.58},${enemy.y + enemy.r} L${enemy.x - enemy.r * 0.95},${enemy.y - enemy.r * 0.2} Z`}
                            fill="rgba(192,132,252,0.82)"
                            stroke="#e9d5ff"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    }
                    return (
                      <circle key={enemy.id} cx={enemy.x} cy={enemy.y} r={enemy.r} fill="rgba(248,113,113,0.82)" stroke="#fecaca" strokeWidth="2" filter="url(#rr-glow)" />
                    );
                    })}

                    {/* Lightning rods — charged ones glow yellow */}
                    {game.obstacles
                      .filter((o) => o.kind === "lightningRod")
                      .map((rod) => {
                        const charge = game.lightningRodCharges[rod.id] || 0;
                        return (
                          <g key={rod.id}>
                            <rect x={rod.x + rod.w / 2 - 3} y={rod.y} width={6} height={rod.h} rx="3" fill="#94a3b8" />
                            <circle
                              cx={rod.x + rod.w / 2}
                              cy={rod.y}
                              r={10}
                              fill={charge > 0 ? "#fbbf24" : "#475569"}
                              stroke={charge > 0 ? "#fde047" : "#64748b"}
                              strokeWidth={2}
                              filter={charge > 0 ? "url(#rr-glow)" : undefined}
                            />
                            {charge > 0 && (
                              <text x={rod.x + rod.w / 2} y={rod.y - 16} textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="700">
                                ⚡×{charge}
                              </text>
                            )}
                          </g>
                        );
                      })}

                    {/* Real-time lightning bolts */}
                    {game.lightningBolts.map((bolt) => {
                      const fade = clamp(bolt.ttl / bolt.maxTtl, 0, 1);
                      const flicker = Math.floor(bolt.ttl * 24) % 2 === 0 ? 1 : 0.65;
                      const mainPts = bolt.pts.map(([x, y]) => `${x},${y}`).join(" ");
                      const branchPts = bolt.branch.map(([x, y]) => `${x},${y}`).join(" ");
                      return (
                        <g key={bolt.id} opacity={fade * flicker}>
                          {/* Glow halo */}
                          <polyline points={mainPts} fill="none" stroke="rgba(147,197,253,0.35)" strokeWidth="18" strokeLinecap="round" />
                          {/* Core bolt */}
                          <polyline points={mainPts} fill="none" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                          {/* Bright center */}
                          <polyline points={mainPts} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                          {/* Branch */}
                          <polyline points={branchPts} fill="none" stroke="rgba(224,242,254,0.75)" strokeWidth="2" strokeLinecap="round" />
                          {/* Strike point flash */}
                          <circle
                            cx={bolt.pts[bolt.pts.length - 1][0]}
                            cy={bolt.pts[bolt.pts.length - 1][1]}
                            r={12}
                            fill="rgba(253,224,71,0.7)"
                            filter="url(#rr-glow)"
                          />
                        </g>
                      );
                    })}

                    {game.collectibles.map((collectible) => (
                      <g key={collectible.id} filter="url(#rr-glow)">
                        <circle cx={collectible.x} cy={collectible.y} r={collectible.r + 5} fill={collectible.type === "life" ? "rgba(248,113,113,0.18)" : "rgba(34,197,94,0.18)"} />
                        <circle cx={collectible.x} cy={collectible.y} r={collectible.r} fill={collectible.type === "life" ? "#fb7185" : "#4ade80"} stroke="#ffffff" strokeWidth="1.5" />
                        <text x={collectible.x} y={collectible.y + 5} textAnchor="middle" fill="#08101b" fontSize="16" fontWeight="700">
                          {collectible.type === "life" ? "+" : "E"}
                        </text>
                      </g>
                    ))}

                    {game.projectiles.map((projectile) => (
                      <g key={projectile.id}>
                        <circle cx={projectile.x} cy={projectile.y} r={projectile.r + 6} fill={`${projectile.color}22`} />
                        <circle cx={projectile.x} cy={projectile.y} r={projectile.r} fill={projectile.color} stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    ))}

                    {showOverlay && (
                      <>
                        <line x1={game.player.x} y1={game.player.y} x2={velocityVector.x2} y2={velocityVector.y2} stroke="#4fd1ff" strokeWidth="4" markerEnd="url(#rr-arrow-cyan)" />
                        <line x1={game.player.x} y1={game.player.y} x2={accelVector.x2} y2={accelVector.y2} stroke="#ff75cf" strokeWidth="4" markerEnd="url(#rr-arrow-pink)" />
                        <text x={game.player.x + 20} y={game.player.y - 34} fill="#a5f3fc" fontSize="14" fontWeight="700">
                          v = ({formatNumber(liveMetrics.vx, 0)}, {formatNumber(-liveMetrics.vy, 0)})
                        </text>
                        <text x={game.player.x + 20} y={game.player.y - 14} fill="#f5d0fe" fontSize="14" fontWeight="700">
                          a = ({formatNumber(liveMetrics.ax, 0)}, {formatNumber(liveMetrics.gravity, 0)})
                        </text>
                      </>
                    )}

                    {game.effects.map((effect) => (
                      <g key={effect.id} opacity={clamp(effect.ttl, 0, 1)}>
                        <circle cx={effect.x} cy={effect.y} r={effect.r} fill={`${effect.color}22`} />
                        <circle cx={effect.x} cy={effect.y} r={effect.r * 0.55} fill={effect.color} />
                        {effect.text ? (
                          <text x={effect.x + 16} y={effect.y - 10} fill={effect.color} fontSize="14" fontWeight="700">
                            {effect.text}
                          </text>
                        ) : null}
                      </g>
                    ))}

                    <circle cx={game.player.x} cy={game.player.y} r={game.player.r + (superGravityActive ? 14 : 8)} fill={superGravityActive ? "rgba(250,204,21,0.18)" : "rgba(59,130,246,0.15)"} />
                    <circle cx={game.player.x} cy={game.player.y} r={game.player.r + (superGravityActive ? 5 : 0)} fill={superGravityActive ? "#facc15" : "#f8fafc"} stroke={superGravityActive ? "#fde047" : "#38bdf8"} strokeWidth="3" filter="url(#rr-glow)" />
                  </g>

                  {!game.alive && (
                    <g>
                      <rect x="410" y="120" width="780" height="110" rx="24" fill="rgba(239,68,68,0.18)" stroke="rgba(248,113,113,0.58)" />
                      <text x="800" y="165" textAnchor="middle" fill="#fee2e2" fontSize="28" fontWeight="700">
                        Run ended
                      </text>
                      <text x="800" y="198" textAnchor="middle" fill="#fecaca" fontSize="16">
                        Restart from checkpoint to keep progress, or reset if you want a full fresh run.
                      </text>
                    </g>
                  )}
                </svg>
                {activeTutorial && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65 p-6">
                    <div className="max-w-2xl rounded-[28px] border border-cyan-400/30 bg-[#08131f] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-3xl font-bold text-cyan-200">
                          e
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Tutor Euler</div>
                          <h3 className="mt-2 text-2xl font-semibold text-white">{activeTutorial.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-slate-200">{activeTutorial.body}</p>
                          <button
                            type="button"
                            onClick={() => {
                              gameRef.current.tutorial = null;
                              setFrame((value) => value + 1);
                            }}
                            className="mt-5 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300"
                          >
                            Continue run
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTransition && !activeTutorial && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 p-6">
                    <div className="max-w-xl rounded-[28px] border border-cyan-400/30 bg-[#08131f]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Region Shift</div>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{activeTransition.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-200">{activeTransition.subtitle}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/75">
                        {scene.id === "fall"
                          ? "Drop in, hit the starter pad, then tune gravity."
                          : scene.id === "climb"
                            ? "Starter pad is below you. Bounce up before the hazard catches you."
                            : "Forward momentum is back. Watch hills, spikes, and roof pressure."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    <Target className="h-4 w-4 text-cyan-300" />
                    Controls
                  </div>
                  <div className="space-y-2 text-sm leading-6 text-slate-200">
                    <div>Left / Right steer motion</div>
                    <div>Space jumps or launches a rebound</div>
                    <div>Shift activates super gravity {game.unlocks.crush ? "" : "(locked)"}</div>
                    <div>F — fire bolt {game.unlocks.blaster ? "" : "(locked)"}</div>
                    <div>Z / X — left / right pinball flipper</div>
                    <div>Space / Enter — dismiss Euler modal</div>
                    <div>Floor portals enter free fall. Ceiling portals enter climb.</div>
                    {game.regionGrace > 0 && (
                      <div className="font-semibold text-cyan-200">Region grace: {formatNumber(game.regionGrace, 1)}s</div>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    <Waves className="h-4 w-4 text-fuchsia-300" />
                    Current Read
                  </div>
                  <div className="text-sm leading-6 text-slate-200">{game.reason}</div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    <Zap className="h-4 w-4 text-amber-300" />
                    Risk Balance
                  </div>
                  <div className="text-sm leading-6 text-slate-200">
                    Super gravity can crush threats but makes trajectory harsher. High bolt power can ricochet back. Every gain has a cost.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="min-h-0 overflow-y-auto rounded-[28px] border border-slate-800 bg-[rgba(8,17,31,0.94)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">What You Are Learning</div>
              <div className="mt-3 text-2xl font-semibold text-white">{learningCopy.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{learningCopy.body}</p>
            </div>

            <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Abilities</div>
              <div className="mt-3 space-y-4 text-sm leading-6 text-slate-200">
                <div>
                  <span className="font-semibold text-amber-300">Super gravity:</span> hold Shift to get heavier, hit harder, and crush enemies when descending fast enough. {game.unlocks.crush ? "Unlocked. Needs at least 30 energy." : "Locked until Euler teaches downward force."}
                </div>
                <div>
                  <span className="font-semibold text-rose-300">Math bolt:</span> tap F to fire. Weak bolts die early. Overpowered bolts can ricochet and become hostile. {game.unlocks.blaster ? "Unlocked. Needs at least 20 energy." : "Locked until Euler teaches launch energy."}
                </div>
                <div>
                  <span className="font-semibold text-cyan-300">Elasticity:</span> lets you preserve rebound speed through impacts. {game.unlocks.elasticity ? "Unlocked." : "Locked until Euler introduces collision response."}
                </div>
                <div>
                  <span className="font-semibold text-yellow-300">Energy:</span> enemy hits blast energy out of you. Lightning rods and bonus routes refill it.
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Live Numbers</div>
              <div className="mt-3 space-y-3">
                {[
                  ["Ball x", `${formatNumber(game.player.x, 1)} px`],
                  ["Ball y", `${formatNumber(game.player.y, 1)} px`],
                  ["Speed", `${formatNumber(liveMetrics.speed, 1)} px/s`],
                  ["x'' input", `${formatNumber(liveMetrics.ax, 1)} px/s^2`],
                  ["g", `${formatNumber(liveMetrics.gravity, 0)} px/s^2`],
                  ["Lives", `${game.lives}`],
                  ["Checkpoint", game.checkpoint.label],
                  ["Pi signal", `${formatNumber(piDistance, 0)} px away`],
                  ["Energy", `${formatNumber(game.energy, 0)}%`],
                  ["Shot cooldown", `${formatNumber(game.shotCooldown, 2)} s`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</div>
                    <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Overlay Legend</div>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
                <div><span className="font-semibold text-cyan-300">Cyan arrow:</span> velocity vector.</div>
                <div><span className="font-semibold text-fuchsia-300">Pink arrow:</span> acceleration vector.</div>
                <div><span className="font-semibold text-pink-200">Dashed line:</span> predicted path under the current rule set.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
