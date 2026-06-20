import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Crosshair,
  Gauge,
  Grid3X3,
  Keyboard,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Wand2,
  X,
  Zap,
} from "lucide-react";

/* ----------------------------------------------------------------------- *
 *  WORLD CONSTANTS
 * ----------------------------------------------------------------------- */
const WORLD_W = 960;
const WORLD_H = 620;
const WALL = 26;
const PADDLE_W = 132;
const PADDLE_H = 16;
const PADDLE_Y = WORLD_H - 54;
const BALL_R = 9;
const BRICK_COLS = 12;
const BRICK_ROWS = 8;
const BRICK_GAP = 8;
const BRICK_W = 58;
const BRICK_H = 22;
const BRICK_START_X = 72;
const BRICK_START_Y = 84;
const BASE_BALL_SPEED = 420;
const PREVIEW_STEPS = 600;
const PREVIEW_DT = 1 / 180;
const PADDLE_MAX_SPEED = 620; // px/s, keyboard-driven only
const CUSTOM_LEVEL_STORAGE_KEY = "arkanoid-learn-custom-grid-v2";

/* ----------------------------------------------------------------------- *
 *  BRICK TYPES  (each teaches something different about energy/behavior)
 * ----------------------------------------------------------------------- */
const BRICK_TYPES = {
  0: { id: 0, label: "Erase", hp: 0, color: "transparent", glow: "transparent" },
  1: { id: 1, label: "Standard", hp: 1, color: "#4fd1ff", glow: "rgba(79,209,255,0.4)", points: 25 },
  2: { id: 2, label: "Reinforced", hp: 2, color: "#f6c667", glow: "rgba(246,198,103,0.4)", points: 50 },
  3: { id: 3, label: "Core", hp: 3, color: "#ff758f", glow: "rgba(255,117,143,0.4)", points: 90 },
  4: { id: 4, label: "Accelerator", hp: 1, color: "#34d399", glow: "rgba(52,211,153,0.45)", points: 35, speedMult: 1.18 },
};

/* ----------------------------------------------------------------------- *
 *  LEVELS  — each one isolates a single physics/math idea
 * ----------------------------------------------------------------------- */
const LEVELS = [
  {
    id: "reflection",
    title: "1 · Law of Reflection",
    subtitle: "Angle in = angle out, measured from the surface normal.",
    grid: [
      "............",
      "...111111...",
      "...111111...",
      "............",
      "............",
      "............",
      "............",
      "............",
    ],
    concept: {
      heading: "Angle of incidence = angle of reflection",
      body:
        "When the ball hits a flat wall, the angle it arrives at and the angle it leaves at are mirror images of each other, measured from an imaginary line perpendicular to the surface (the normal). Watch the normal line and the two angle readouts: they should always match.",
      watch: "Normal line (white, dashed) and the IN/OUT angle readout.",
    },
  },
  {
    id: "angles",
    title: "2 · Steering with Offset",
    subtitle: "Paddle contact point changes the rebound direction.",
    grid: [
      "1.1.1.1.1.1.",
      ".1.1.1.1.1.1",
      "............",
      "..222222222.".slice(0, 12),
      "............",
      "............",
      "............",
      "............",
    ],
    concept: {
      heading: "The paddle is not a flat wall — it's a steering wheel",
      body:
        "Unlike a wall, the paddle's rebound angle depends on WHERE the ball lands. Center contact sends the ball nearly straight up. Edge contact sends it out at a steep angle. The offset readout (−1 = far left edge, 0 = center, +1 = far right edge) tells you exactly how much steering you applied.",
      watch: "Offset value and how the OUT angle stretches as offset moves from 0 toward ±1.",
    },
  },
  {
    id: "energy",
    title: "3 · Energy & Speed",
    subtitle: "Accelerator bricks add energy — speed is not constant.",
    grid: [
      "............",
      "...444444...",
      "............",
      "..222222222.".slice(0, 12),
      "............",
      "...111111...",
      "............",
      "............",
    ],
    concept: {
      heading: "Speed changes when energy is added or removed",
      body:
        "Green Accelerator bricks inject extra kinetic energy into the ball on contact, increasing its speed by about 18%. In real systems (a pinball bumper, a slingshot gravity assist), collisions aren't always elastic — sometimes a collision adds energy instead of just redirecting it. Track the live speed readout before and after hitting a green brick.",
      watch: "Live speed (px/s) — watch it jump after a green Accelerator hit.",
    },
  },
  {
    id: "projectile",
    title: "4 · Predict the Landing",
    subtitle: "Time-to-paddle is a projectile motion problem.",
    grid: [
      "..111111111.".slice(0, 12),
      "............",
      ".....22.....",
      "............",
      "............",
      "............",
      "............",
      "............",
    ],
    concept: {
      heading: "Constant horizontal velocity + the time it takes to fall",
      body:
        "The ball's horizontal speed (vx) doesn't change between bounces. So the question 'where will the ball cross the paddle line?' is the same kind of problem as 'where does a thrown ball land' — multiply the constant horizontal speed by the time remaining. The gold dotted line is exactly that prediction, drawn the instant the ball starts falling.",
      watch: "The gold predicted-landing line — try to read it before the ball arrives.",
    },
  },
  {
    id: "calculus",
    title: "5 · Sensitivity (a Derivative)",
    subtitle: "How much does a tiny paddle nudge change the outcome?",
    grid: [
      "...111111...",
      "..122222221.".slice(0, 12),
      ".12333333321".slice(0, 12),
      "..122222221.".slice(0, 12),
      "...111111...",
      "............",
      "....1111....",
      "............",
    ],
    concept: {
      heading: "A derivative is just 'how fast does output change with input'",
      body:
        "The Sensitivity readout answers: if I nudge the paddle 1 pixel, how many pixels does the ball's eventual path shift? Near the paddle's center this number is small — the system is forgiving. Near the edges it spikes — small paddle errors become large path errors. That ratio (Δoutput / Δinput) is literally a discrete approximation of a derivative.",
      watch: "Sensitivity readout — compare its value near center-hits vs. edge-hits.",
    },
  },
  {
    id: "boss",
    title: "6 · Full Test",
    subtitle: "All five ideas together, harder layout.",
    grid: [
      "111111111111".slice(0, 12),
      "1.2.3.3.2.1.".slice(0, 12),
      "............",
      "..4......4..",
      "............",
      ".233333333.".padEnd(12, "."),
      "............",
      "....22......",
    ],
    concept: {
      heading: "Combine everything",
      body:
        "This layout mixes reflection, steering offset, energy bricks, and timing pressure. Use the predicted line and angle readouts the same way you did in the earlier levels — nothing new is introduced, just less room for error.",
      watch: "All readouts at once — this is the integration test.",
    },
  },
];

const EMPTY_GRID = Array.from({ length: BRICK_ROWS }, () => Array(BRICK_COLS).fill(0));

/* ----------------------------------------------------------------------- *
 *  HELPERS
 * ----------------------------------------------------------------------- */
function parseLevelGrid(rows) {
  return rows.map((row) =>
    row
      .padEnd(BRICK_COLS, ".")
      .slice(0, BRICK_COLS)
      .split("")
      .map((cell) => {
        const value = Number(cell);
        return Number.isFinite(value) ? value : 0;
      }),
  );
}

function serializeGrid(grid) {
  return JSON.stringify(grid);
}

function loadCustomGrid() {
  try {
    const saved = localStorage.getItem(CUSTOM_LEVEL_STORAGE_KEY);
    if (!saved) return EMPTY_GRID;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length !== BRICK_ROWS) return EMPTY_GRID;
    return parsed.map((row) =>
      Array.from({ length: BRICK_COLS }, (_, index) => Number(row?.[index]) || 0),
    );
  } catch {
    return EMPTY_GRID;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function magnitude(vx, vy) {
  return Math.sqrt(vx * vx + vy * vy);
}

function normalize(vx, vy) {
  const m = magnitude(vx, vy) || 1;
  return { x: vx / m, y: vy / m };
}

function createBricksFromGrid(grid) {
  const bricks = [];
  for (let row = 0; row < BRICK_ROWS; row += 1) {
    for (let col = 0; col < BRICK_COLS; col += 1) {
      const typeId = Number(grid[row]?.[col] || 0);
      const type = BRICK_TYPES[typeId];
      if (!typeId || !type) continue;
      bricks.push({
        id: `brick-${row}-${col}-${typeId}`,
        row,
        col,
        x: BRICK_START_X + col * (BRICK_W + BRICK_GAP),
        y: BRICK_START_Y + row * (BRICK_H + BRICK_GAP),
        w: BRICK_W,
        h: BRICK_H,
        hp: type.hp,
        maxHp: type.hp,
        typeId,
      });
    }
  }
  return bricks;
}

function makeLevelState(levelId, grid) {
  return {
    levelId,
    grid,
    bricks: createBricksFromGrid(grid),
    paddleX: WORLD_W / 2,
    paddleVelocity: 0,
    ball: {
      x: WORLD_W / 2,
      y: PADDLE_Y - BALL_R - 4,
      vx: 0,
      vy: 0,
      stuck: true,
    },
    score: 0,
    combo: 0,
    bestCombo: 0,
    lives: 3,
    won: false,
    lost: false,
    lastCollision: null,
    lastAccel: false,
  };
}

/** Reflect off the paddle. Returns offset in [-1,1] plus new velocity. */
function bounceFromPaddle(ballX, paddleX, incomingSpeed, paddleVelocity = 0) {
  const offset = clamp((ballX - paddleX) / (PADDLE_W / 2), -1, 1);
  const maxAngle = Math.PI * 0.42; // ~75.6°, never fully horizontal
  const angle = offset * maxAngle;
  const speed = Math.max(260, incomingSpeed + Math.abs(paddleVelocity) * 0.12);
  return {
    offset,
    vx: Math.sin(angle) * speed + paddleVelocity * 0.1,
    vy: -Math.cos(angle) * speed,
  };
}

/** Axis-aligned ball-vs-brick collision using swept previous position to pick the right normal. */
function collideBallWithBrick(ball, brick, prevX, prevY) {
  const nearestX = clamp(ball.x, brick.x, brick.x + brick.w);
  const nearestY = clamp(ball.y, brick.y, brick.y + brick.h);
  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;
  if (dx * dx + dy * dy > BALL_R * BALL_R) return false;

  const wasAbove = prevY + BALL_R <= brick.y;
  const wasBelow = prevY - BALL_R >= brick.y + brick.h;
  const wasLeft = prevX + BALL_R <= brick.x;
  const wasRight = prevX - BALL_R >= brick.x + brick.w;

  if ((wasAbove || wasBelow) && !(wasLeft || wasRight)) {
    ball.vy *= -1;
  } else if (wasLeft || wasRight) {
    ball.vx *= -1;
  } else {
    // Corner case — reflect both for a believable bounce
    ball.vx *= -1;
    ball.vy *= -1;
  }
  return true;
}

function cloneBall(ball) {
  return { ...ball };
}
function cloneBricks(bricks) {
  return bricks.map((brick) => ({ ...brick }));
}

/** Forward-simulate the ball (read-only) to draw the ghost/prediction path. */
function simulatePath(ballInput, bricksInput, steps = PREVIEW_STEPS, dt = PREVIEW_DT) {
  const ball = cloneBall(ballInput);
  const bricks = cloneBricks(bricksInput);
  const points = [{ x: ball.x, y: ball.y }];
  let collisions = 0;

  for (let index = 0; index < steps; index += 1) {
    const prevX = ball.x;
    const prevY = ball.y;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.x <= WALL + BALL_R) {
      ball.x = WALL + BALL_R;
      ball.vx = Math.abs(ball.vx);
      collisions += 1;
    } else if (ball.x >= WORLD_W - WALL - BALL_R) {
      ball.x = WORLD_W - WALL - BALL_R;
      ball.vx = -Math.abs(ball.vx);
      collisions += 1;
    }
    if (ball.y <= WALL + BALL_R) {
      ball.y = WALL + BALL_R;
      ball.vy = Math.abs(ball.vy);
      collisions += 1;
    }

    for (const brick of bricks) {
      if (brick.hp <= 0) continue;
      if (collideBallWithBrick(ball, brick, prevX, prevY)) {
        brick.hp -= 1;
        collisions += 1;
        break;
      }
    }

    points.push({ x: ball.x, y: ball.y });
    if (ball.y > WORLD_H + 30 || collisions > 5) break;
  }
  return points;
}

/** Predict where + how the ball will meet the paddle (or miss it). Single source of truth for all overlays. */
function predictPaddleContact(game) {
  const ball = game.ball;

  if (ball.stuck) {
    const launch = bounceFromPaddle(game.paddleX, game.paddleX, BASE_BALL_SPEED, game.paddleVelocity);
    const start = { x: game.paddleX, y: PADDLE_Y - BALL_R - 4, vx: launch.vx, vy: launch.vy };
    return {
      kind: "launch",
      contact: { x: game.paddleX, y: PADDLE_Y - 4 },
      normal: { x: 0, y: -1 },
      incoming: { x: 0, y: -1 },
      outgoing: normalize(launch.vx, launch.vy),
      offset: 0,
      previewPoints: simulatePath(start, game.bricks),
    };
  }

  if (ball.vy <= 0) return null;
  const distanceToPaddle = PADDLE_Y - BALL_R - ball.y;
  if (distanceToPaddle <= 0) return null;
  const timeToPaddle = distanceToPaddle / ball.vy;
  if (timeToPaddle < 0 || timeToPaddle > 2.5) return null;

  const predictedX = ball.x + ball.vx * timeToPaddle;
  const willMiss =
    predictedX < game.paddleX - PADDLE_W / 2 - BALL_R ||
    predictedX > game.paddleX + PADDLE_W / 2 + BALL_R;

  if (willMiss) {
    return {
      kind: "miss",
      contact: { x: predictedX, y: PADDLE_Y },
      normal: { x: 0, y: -1 },
      incoming: normalize(ball.vx, ball.vy),
      outgoing: null,
      offset: null,
      missDelta: predictedX - game.paddleX,
      previewPoints: null,
    };
  }

  const speed = magnitude(ball.vx, ball.vy);
  const bounce = bounceFromPaddle(predictedX, game.paddleX, speed, game.paddleVelocity);
  const previewBall = { x: predictedX, y: PADDLE_Y - BALL_R - 1, vx: bounce.vx, vy: bounce.vy };

  return {
    kind: "bounce",
    contact: { x: predictedX, y: PADDLE_Y },
    normal: { x: 0, y: -1 },
    incoming: normalize(ball.vx, ball.vy),
    outgoing: normalize(bounce.vx, bounce.vy),
    offset: bounce.offset,
    missDelta: 0,
    previewPoints: simulatePath(previewBall, game.bricks),
  };
}

/** Discrete derivative: how much the eventual path shifts per pixel of paddle nudge. */
function estimateSensitivity(game, prediction) {
  if (!prediction || prediction.kind !== "bounce") return null;
  const delta = 10;
  const plusX = clamp(game.paddleX + delta, WALL + PADDLE_W / 2, WORLD_W - WALL - PADDLE_W / 2);
  const minusX = clamp(game.paddleX - delta, WALL + PADDLE_W / 2, WORLD_W - WALL - PADDLE_W / 2);
  const plus = predictPaddleContact({ ...game, paddleX: plusX });
  const minus = predictPaddleContact({ ...game, paddleX: minusX });
  if (!plus?.previewPoints?.length || !minus?.previewPoints?.length) return null;

  const sampleIndex = Math.min(plus.previewPoints.length - 1, minus.previewPoints.length - 1, 90);
  const plusEnd = plus.previewPoints[sampleIndex];
  const minusEnd = minus.previewPoints[sampleIndex];
  if (!plusEnd || !minusEnd) return null;
  return (plusEnd.x - minusEnd.x) / (2 * delta);
}

function lineFromPoints(points) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits).replace(/\.?0+$/, "") || "0";
}

function vectorAngleFromVertical(vx, vy) {
  // 0deg = straight up, positive = tilted right, negative = tilted left
  return (Math.atan2(vx, -vy) * 180) / Math.PI;
}

/* ----------------------------------------------------------------------- *
 *  COMPONENT
 * ----------------------------------------------------------------------- */
export default function ArkanoidLearn() {
  const [activeLevelId, setActiveLevelId] = useState(LEVELS[0].id);
  const [customGrid, setCustomGrid] = useState(() => loadCustomGrid());
  const [brush, setBrush] = useState(1);
  const [useCustomLevel, setUseCustomLevel] = useState(false);
  const [showPrediction, setShowPrediction] = useState(true);
  const [slowMotion, setSlowMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [frame, setFrame] = useState(0);
  const [closed, setClosed] = useState(false);

  const svgRef = useRef(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const gameRef = useRef(null);
  const inputRef = useRef({ left: false, right: false });
  const spaceLockRef = useRef(false);

  const activeLevel = useMemo(
    () => LEVELS.find((level) => level.id === activeLevelId) || LEVELS[0],
    [activeLevelId],
  );

  const loadLevel = useCallback((grid, levelId) => {
    gameRef.current = makeLevelState(levelId, grid);
    setFrame((v) => v + 1);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_LEVEL_STORAGE_KEY, serializeGrid(customGrid));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [customGrid]);

  useEffect(() => {
    const grid = useCustomLevel ? customGrid : parseLevelGrid(activeLevel.grid);
    loadLevel(grid, useCustomLevel ? "custom" : activeLevel.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLevel.id, useCustomLevel]);

  const launchBall = useCallback(() => {
    const game = gameRef.current;
    if (!game || !game.ball.stuck || game.won || game.lost) return;
    const bounce = bounceFromPaddle(game.ball.x, game.paddleX, BASE_BALL_SPEED, game.paddleVelocity);
    game.ball.vx = bounce.vx;
    game.ball.vy = bounce.vy;
    game.ball.stuck = false;
    setFrame((v) => v + 1);
  }, []);

  /* Keyboard input only — no pointer/mouse paddle control. */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (!spaceLockRef.current) {
          spaceLockRef.current = true;
          launchBall();
        }
      }
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        inputRef.current.left = true;
      }
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        inputRef.current.right = true;
      }
    };
    const onKeyUp = (event) => {
      if (event.code === "Space") spaceLockRef.current = false;
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        inputRef.current.left = false;
      }
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        inputRef.current.right = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [launchBall]);

  /* Main loop */
  useEffect(() => {
    const step = (time) => {
      const game = gameRef.current;
      if (!game) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const prevTime = lastTimeRef.current || time;
      const rawDt = Math.min((time - prevTime) / 1000, 0.032);
      lastTimeRef.current = time;
      const dt = paused ? 0 : rawDt * (slowMotion ? 0.4 : 1);

      if (!paused && !game.won && !game.lost) {
        const moveDirection = (inputRef.current.right ? 1 : 0) - (inputRef.current.left ? 1 : 0);
        const previousPaddleX = game.paddleX;
        if (moveDirection !== 0) {
          game.paddleX = clamp(
            game.paddleX + moveDirection * PADDLE_MAX_SPEED * dt,
            WALL + PADDLE_W / 2,
            WORLD_W - WALL - PADDLE_W / 2,
          );
        }
        game.paddleVelocity = dt > 0 ? (game.paddleX - previousPaddleX) / dt : 0;

        if (game.ball.stuck) {
          game.ball.x = game.paddleX;
          game.ball.y = PADDLE_Y - BALL_R - 4;
        } else {
          const subSteps = 4;
          const subDt = dt / subSteps;
          for (let s = 0; s < subSteps; s += 1) {
            const ball = game.ball;
            const prevX = ball.x;
            const prevY = ball.y;

            ball.x += ball.vx * subDt;
            ball.y += ball.vy * subDt;

            if (ball.x <= WALL + BALL_R) {
              ball.x = WALL + BALL_R;
              ball.vx = Math.abs(ball.vx);
              game.lastCollision = { type: "wall", label: "Left wall — reflected" };
            } else if (ball.x >= WORLD_W - WALL - BALL_R) {
              ball.x = WORLD_W - WALL - BALL_R;
              ball.vx = -Math.abs(ball.vx);
              game.lastCollision = { type: "wall", label: "Right wall — reflected" };
            }
            if (ball.y <= WALL + BALL_R) {
              ball.y = WALL + BALL_R;
              ball.vy = Math.abs(ball.vy);
              game.lastCollision = { type: "wall", label: "Ceiling — reflected" };
            }

            const touchingPaddle =
              ball.vy > 0 &&
              prevY + BALL_R <= PADDLE_Y &&
              ball.y + BALL_R >= PADDLE_Y &&
              Math.abs(ball.x - game.paddleX) <= PADDLE_W / 2 + BALL_R;

            if (touchingPaddle) {
              const incomingSpeed = magnitude(ball.vx, ball.vy);
              const bounce = bounceFromPaddle(ball.x, game.paddleX, incomingSpeed, game.paddleVelocity);
              ball.y = PADDLE_Y - BALL_R - 1;
              ball.vx = bounce.vx;
              ball.vy = bounce.vy;
              game.combo = 0;
              game.lastCollision = { type: "paddle", label: `Paddle contact — offset ${formatNumber(bounce.offset, 2)}` };
            }

            for (const brick of game.bricks) {
              if (brick.hp <= 0) continue;
              if (collideBallWithBrick(ball, brick, prevX, prevY)) {
                brick.hp -= 1;
                const type = BRICK_TYPES[brick.typeId];
                game.score += type?.points || 25;
                game.combo += 1;
                game.bestCombo = Math.max(game.bestCombo, game.combo);
                game.lastAccel = false;
                if (type?.speedMult) {
                  const sp = magnitude(ball.vx, ball.vy) * type.speedMult;
                  const dir = normalize(ball.vx, ball.vy);
                  ball.vx = dir.x * sp;
                  ball.vy = dir.y * sp;
                  game.lastAccel = true;
                  game.lastCollision = { type: "brick", label: "Accelerator — speed increased" };
                } else {
                  game.lastCollision = { type: "brick", label: `${type?.label || "Brick"} destroyed` };
                }
                break;
              }
            }

            if (ball.y >= WORLD_H + BALL_R + 12) {
              game.lives -= 1;
              if (game.lives <= 0) {
                game.lost = true;
              } else {
                game.ball = { x: game.paddleX, y: PADDLE_Y - BALL_R - 4, vx: 0, vy: 0, stuck: true };
                game.combo = 0;
                game.lastCollision = { type: "reset", label: "Ball lost — reset on paddle" };
              }
              break;
            }
          }

          if (!game.won && game.bricks.length > 0 && game.bricks.every((b) => b.hp <= 0)) {
            game.won = true;
          }
        }
      }

      setFrame((v) => v + 1);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, slowMotion]);

  const game = gameRef.current || makeLevelState(activeLevel.id, parseLevelGrid(activeLevel.grid));
  const prediction = useMemo(
    () => (showPrediction ? predictPaddleContact(game) : null),
    // frame intentionally included to recompute every tick
    [frame, game, showPrediction],
  );
  const sensitivity = useMemo(() => estimateSensitivity(game, prediction), [frame, game, prediction]);

  const handleEditorCellClick = useCallback(
    (row, col) => {
      setCustomGrid((current) =>
        current.map((gridRow, rowIndex) =>
          gridRow.map((value, colIndex) => (rowIndex === row && colIndex === col ? brush : value)),
        ),
      );
    },
    [brush],
  );

  const applyCustomLevel = useCallback(() => setUseCustomLevel(true), []);
  const loadTemplateLevel = useCallback((levelId) => {
    setUseCustomLevel(false);
    setActiveLevelId(levelId);
  }, []);
  const resetCurrentLevel = useCallback(() => {
    const grid = useCustomLevel ? customGrid : parseLevelGrid(activeLevel.grid);
    loadLevel(grid, useCustomLevel ? "custom" : activeLevel.id);
  }, [activeLevel, customGrid, loadLevel, useCustomLevel]);

  const currentSpeed = magnitude(game.ball.vx, game.ball.vy);
  const inAngle = prediction ? vectorAngleFromVertical(game.ball.vx, game.ball.vy) : null;
  const outAngle =
    prediction && prediction.kind === "bounce"
      ? vectorAngleFromVertical(prediction.outgoing.x, prediction.outgoing.y)
      : null;

  if (closed) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#08111f] text-slate-300">
        <div className="text-center">
          <div className="text-sm uppercase tracking-[0.3em] text-slate-500">Arkanoid Learn</div>
          <div className="mt-2 text-lg font-semibold text-white">Session closed</div>
          <button
            type="button"
            onClick={() => setClosed(false)}
            className="mt-4 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            Reopen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#08111f] text-slate-100">
      <div className="flex h-full w-full flex-col px-3 py-3 lg:px-5">
        {/* ---------- HEADER ---------- */}
        <div className="mb-3 rounded-[24px] border border-sky-900/40 bg-[radial-gradient(circle_at_top,_rgba(35,123,255,0.22),_transparent_36%),linear-gradient(180deg,_rgba(8,17,31,0.98),_rgba(8,17,31,0.94))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Arkanoid Learn</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Physics you can predict, then test</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                Keyboard-controlled paddle — no mouse. Read the angle and the predicted line, then move on purpose.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:self-start">
              <button
                type="button"
                onClick={() => setClosed(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                <X className="h-4 w-4" />
                Close
              </button>
              <button
                type="button"
                onClick={() => setPaused((v) => !v)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:border-sky-400 hover:bg-slate-900"
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={launchBall}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20"
              >
                <ArrowRight className="h-4 w-4" />
                Launch (Space)
              </button>
              <button
                type="button"
                onClick={resetCurrentLevel}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Level
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Keyboard className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-300">Controls:</span>
            <span className="rounded-md border border-slate-700 bg-slate-900/70 px-2 py-0.5">← / A</span>
            <span className="rounded-md border border-slate-700 bg-slate-900/70 px-2 py-0.5">→ / D</span>
            <span className="rounded-md border border-slate-700 bg-slate-900/70 px-2 py-0.5">Space = Launch</span>
            <span className="ml-2 text-slate-500">Mouse does not move the paddle — every hit is your own steering call.</span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_330px]">
          {/* ---------- LEFT SIDEBAR ---------- */}
          <aside className="min-w-0 space-y-4 overflow-y-auto pr-1">
            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Lessons</div>
              <div className="mt-3 grid gap-2">
                {LEVELS.map((level) => {
                  const active = !useCustomLevel && activeLevelId === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => loadTemplateLevel(level.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active ? "border-cyan-400/70 bg-cyan-400/10" : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{level.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-400">{level.subtitle}</div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={applyCustomLevel}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    useCustomLevel ? "border-fuchsia-400/70 bg-fuchsia-400/10" : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
                  }`}
                >
                  <div className="text-sm font-semibold text-white">Custom Build</div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">Paint your own layout and test the same physics.</div>
                </button>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Display</div>
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrediction((v) => !v)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                    showPrediction ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-100" : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <span>Predicted path overlay</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">{showPrediction ? "On" : "Off"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSlowMotion((v) => !v)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                    slowMotion ? "border-amber-400/60 bg-amber-400/10 text-amber-100" : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <span className="inline-flex items-center gap-2"><Gauge className="h-3.5 w-3.5" /> Slow motion (0.4×)</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">{slowMotion ? "On" : "Off"}</span>
                </button>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Level Creator</div>
                <Grid3X3 className="h-4 w-4 text-fuchsia-300" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.values(BRICK_TYPES).map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setBrush(type.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      brush === type.id ? "border-fuchsia-400 bg-fuchsia-400/15 text-fuchsia-100" : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-12 gap-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-2">
                {customGrid.flatMap((row, rowIndex) =>
                  row.map((value, colIndex) => {
                    const type = BRICK_TYPES[value] || BRICK_TYPES[0];
                    return (
                      <button
                        key={`cell-${rowIndex}-${colIndex}`}
                        type="button"
                        onClick={() => handleEditorCellClick(rowIndex, colIndex)}
                        className="aspect-[1.9] rounded-md border transition hover:scale-[1.03]"
                        style={{
                          borderColor: value ? type.color : "rgba(71,85,105,0.45)",
                          background: value ? `${type.color}22` : "rgba(15,23,42,0.7)",
                          boxShadow: value ? `0 0 16px ${type.glow}` : "none",
                        }}
                        title={`Row ${rowIndex + 1}, Col ${colIndex + 1}`}
                      />
                    );
                  }),
                )}
              </div>
              <button
                type="button"
                onClick={applyCustomLevel}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-fuchsia-500/50 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-400 hover:bg-fuchsia-500/20"
              >
                <Wand2 className="h-4 w-4" />
                Play Custom Level
              </button>
            </section>
          </aside>

          {/* ---------- CENTER PLAYFIELD ---------- */}
          <main className="flex min-w-0 min-h-0 flex-col rounded-[28px] border border-slate-800 bg-slate-950/75 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {useCustomLevel ? "Custom Build" : activeLevel.title}
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-300">
                  {useCustomLevel ? "Your own brick field is active." : activeLevel.subtitle}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">Score {game.score}</span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">Lives {game.lives}</span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">Speed {formatNumber(currentSpeed, 0)} px/s</span>
              </div>
            </div>

            <div className="min-h-[420px] flex-1 overflow-hidden rounded-[30px] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(180deg,_rgba(7,15,27,0.98),_rgba(10,18,33,0.98))]">
              <svg ref={svgRef} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} className="block h-full w-full select-none">
                <defs>
                  <linearGradient id="fieldGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(56,189,248,0.2)" />
                    <stop offset="100%" stopColor="rgba(15,23,42,0)" />
                  </linearGradient>
                  <filter id="softGlow">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect x="0" y="0" width={WORLD_W} height={WORLD_H} fill="url(#fieldGlow)" />
                <rect x={WALL / 2} y={WALL / 2} width={WORLD_W - WALL} height={WORLD_H - WALL / 2} rx="26" fill="none" stroke="rgba(96,165,250,0.22)" strokeWidth="2" />

                {/* Bricks */}
                {game.bricks.map((brick) => {
                  if (brick.hp <= 0) return null;
                  const type = BRICK_TYPES[brick.typeId] || BRICK_TYPES[1];
                  return (
                    <g key={brick.id}>
                      <rect x={brick.x} y={brick.y} width={brick.w} height={brick.h} rx="7" fill={type.color} opacity={0.16 + brick.hp * 0.18} stroke={type.color} strokeWidth="1.5" filter="url(#softGlow)" />
                      <rect x={brick.x + 2} y={brick.y + 2} width={brick.w - 4} height={brick.h - 4} rx="5" fill={type.color} opacity={0.55 + brick.hp * 0.1} />
                      {type.speedMult && (
                        <text x={brick.x + brick.w / 2} y={brick.y + brick.h / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#062a1f">+</text>
                      )}
                    </g>
                  );
                })}

                {/* ---- SINGLE clean predicted path (one line, not five arrows) ---- */}
                {prediction?.previewPoints?.length > 1 && (prediction.kind === "bounce" || prediction.kind === "launch") && (
                  <polyline
                    points={lineFromPoints(prediction.previewPoints)}
                    fill="none"
                    stroke="rgba(110,231,255,0.85)"
                    strokeWidth="2.5"
                    strokeDasharray="11 8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#softGlow)"
                  />
                )}

                {/* Miss warning line: straight down to the contact x on the paddle line */}
                {prediction?.kind === "miss" && (
                  <line
                    x1={game.ball.x}
                    y1={game.ball.y}
                    x2={prediction.contact.x}
                    y2={PADDLE_Y - BALL_R}
                    stroke="#fb7185"
                    strokeWidth="2.5"
                    strokeDasharray="9 7"
                    strokeLinecap="round"
                  />
                )}

                {/* Surface normal at the contact point — only thing besides the path */}
                {prediction && (prediction.kind === "bounce" || prediction.kind === "miss") && (
                  <line
                    x1={prediction.contact.x}
                    y1={PADDLE_Y - 1}
                    x2={prediction.contact.x}
                    y2={PADDLE_Y - 60}
                    stroke="rgba(226,232,240,0.55)"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                  />
                )}

                {prediction && (
                  <circle
                    cx={prediction.contact.x}
                    cy={PADDLE_Y}
                    r="5"
                    fill={prediction.kind === "miss" ? "#fb7185" : "#ffffff"}
                    opacity="0.9"
                  />
                )}

                {/* Paddle */}
                <rect x={game.paddleX - PADDLE_W / 2} y={PADDLE_Y} width={PADDLE_W} height={PADDLE_H} rx="8" fill="#38bdf8" stroke="#dff9ff" strokeWidth="1.5" filter="url(#softGlow)" />
                <rect x={game.paddleX - PADDLE_W / 2 + 10} y={PADDLE_Y + 3} width={PADDLE_W - 20} height={PADDLE_H - 6} rx="6" fill="rgba(224,242,254,0.4)" />
                {/* Center tick so offset is visually legible */}
                <line x1={game.paddleX} y1={PADDLE_Y - 2} x2={game.paddleX} y2={PADDLE_Y + PADDLE_H + 2} stroke="rgba(8,17,31,0.5)" strokeWidth="2" />

                {/* Ball */}
                <circle
                  cx={game.ball.x}
                  cy={game.ball.y}
                  r={BALL_R}
                  fill={game.lastAccel ? "#bbf7d0" : "#ffffff"}
                  stroke={game.lastAccel ? "#34d399" : "#4fd1ff"}
                  strokeWidth="2"
                  filter="url(#softGlow)"
                />

                {game.ball.stuck && !game.won && !game.lost && (
                  <text x={WORLD_W / 2} y={PADDLE_Y - 30} textAnchor="middle" fill="rgba(226,232,240,0.7)" fontSize="14" fontWeight="600">
                    Press Space to launch
                  </text>
                )}

                {game.won && (
                  <g>
                    <rect x="220" y="230" width="520" height="120" rx="28" fill="rgba(16,185,129,0.18)" stroke="rgba(52,211,153,0.58)" />
                    <text x="480" y="276" textAnchor="middle" fill="#dcfce7" fontSize="28" fontWeight="700">Level cleared</text>
                    <text x="480" y="310" textAnchor="middle" fill="#bbf7d0" fontSize="16">Reset, or pick the next lesson on the left.</text>
                  </g>
                )}
                {game.lost && (
                  <g>
                    <rect x="220" y="230" width="520" height="120" rx="28" fill="rgba(239,68,68,0.18)" stroke="rgba(248,113,113,0.58)" />
                    <text x="480" y="276" textAnchor="middle" fill="#fee2e2" fontSize="28" fontWeight="700">Out of lives</text>
                    <text x="480" y="310" textAnchor="middle" fill="#fecaca" fontSize="16">Reset and use the predicted line earlier next time.</text>
                  </g>
                )}
              </svg>
            </div>

            {/* ---- Compact readouts: angle / offset / sensitivity, no clutter ---- */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Target className="h-3.5 w-3.5 text-amber-200" /> Incoming angle
                </div>
                <div className="mt-2 text-xl font-semibold text-white">{inAngle == null ? "—" : `${formatNumber(inAngle, 0)}°`}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">0° = straight down toward paddle</div>
              </div>
              <div className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Crosshair className="h-3.5 w-3.5 text-cyan-200" /> Outgoing angle
                </div>
                <div className="mt-2 text-xl font-semibold text-white">{outAngle == null ? "—" : `${formatNumber(outAngle, 0)}°`}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">From vertical, + is right, − is left</div>
              </div>
              <div className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Gauge className="h-3.5 w-3.5 text-fuchsia-200" /> Paddle offset
                </div>
                <div className="mt-2 text-xl font-semibold text-white">{prediction?.offset == null ? "—" : formatNumber(prediction.offset, 2)}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">−1 edge · 0 center · +1 edge</div>
              </div>
              <div className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Zap className="h-3.5 w-3.5 text-emerald-200" /> Sensitivity
                </div>
                <div className="mt-2 text-xl font-semibold text-white">{sensitivity == null ? "—" : `${formatNumber(sensitivity, 2)} px/px`}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">Path shift per 1px paddle nudge</div>
              </div>
            </div>

            <div className="mt-3 rounded-[18px] border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Last event:</span> {game.lastCollision?.label || "No collision yet"}
              <span className="ml-3 font-semibold text-slate-300">Combo:</span> {game.combo} <span className="text-slate-600">(best {game.bestCombo})</span>
            </div>
          </main>

          {/* ---------- RIGHT SIDEBAR: per-level concept ---------- */}
          <aside className="min-w-0 space-y-4 overflow-y-auto pr-1">
            <section className="rounded-[24px] border border-cyan-900/40 bg-gradient-to-b from-cyan-950/30 to-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">The concept</div>
              <div className="mt-2 text-lg font-semibold text-white">{activeLevel.concept.heading}</div>
              <p className="mt-2 text-sm leading-7 text-slate-300">{activeLevel.concept.body}</p>
              <div className="mt-3 rounded-xl border border-cyan-900/40 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-200">
                Watch: {activeLevel.concept.watch}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Reading the field</div>
              <div className="mt-3 space-y-2.5 text-sm leading-6 text-slate-300">
                <p><span className="font-semibold text-cyan-200">Dashed cyan line:</span> the one predicted path — where the ball is calculated to go.</p>
                <p><span className="font-semibold text-rose-200">Red dashed line:</span> appears only when the current trajectory misses the paddle.</p>
                <p><span className="font-semibold text-slate-100">Faint vertical line:</span> the surface normal at the predicted contact point.</p>
                <p><span className="font-semibold text-emerald-200">Green ball flash:</span> just hit an Accelerator brick.</p>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Live numbers</div>
              <div className="mt-3 grid gap-2.5">
                {[
                  { label: "Ball x", value: `${formatNumber(game.ball.x, 1)} px` },
                  { label: "Ball y", value: `${formatNumber(game.ball.y, 1)} px` },
                  { label: "vx", value: `${formatNumber(game.ball.vx, 1)} px/s` },
                  { label: "vy", value: `${formatNumber(game.ball.vy, 1)} px/s` },
                  { label: "Paddle center", value: `${formatNumber(game.paddleX, 1)} px` },
                  { label: "Active bricks", value: String(game.bricks.filter((b) => b.hp > 0).length) },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2.5">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</span>
                    <span className="text-sm font-semibold text-white">{metric.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}