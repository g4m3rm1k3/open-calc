import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Crosshair,
  Gauge,
  Grid3X3,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Wand2,
  Waves,
  X,
} from "lucide-react";

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
const BALL_SPEED = 430;
const PREVIEW_STEPS = 720;
const PREVIEW_DT = 1 / 180;
const CUSTOM_LEVEL_STORAGE_KEY = "arkanoid-learn-custom-grid";
const PADDLE_MAX_SPEED = 760;

const BRICK_TYPES = {
  0: { id: 0, label: "Erase", hp: 0, color: "transparent", glow: "transparent" },
  1: { id: 1, label: "Lesson", hp: 1, color: "#4fd1ff", glow: "rgba(79, 209, 255, 0.35)" },
  2: { id: 2, label: "Tough", hp: 2, color: "#f6c667", glow: "rgba(246, 198, 103, 0.35)" },
  3: { id: 3, label: "Dense", hp: 3, color: "#ff758f", glow: "rgba(255, 117, 143, 0.35)" },
};

const LEVELS = [
  {
    id: "reflection",
    title: "Reflection Warmup",
    subtitle: "Use paddle contact to steer the outgoing path.",
    grid: [
      "............",
      "...111111...",
      "...111111...",
      "............",
      ".....22.....",
      ".....22.....",
      "............",
      "............",
    ],
    challenge:
      "Hit the center band, then move the paddle slightly and watch how a tiny input shift changes the outgoing line.",
  },
  {
    id: "angles",
    title: "Angle Control",
    subtitle: "A wider spread of bricks makes reflection angle feel tangible.",
    grid: [
      "1.1.1.1.1.1.",
      ".1.1.1.1.1.1",
      "............",
      "..22222222..",
      "............",
      "...333333...",
      "............",
      "............",
    ],
    challenge:
      "Try to clip the outside bricks first. The paddle edge gives a steeper reflected vector than the center.",
  },
  {
    id: "calculus",
    title: "Sensitivity Lab",
    subtitle: "Prediction makes rate of change visible before formal derivatives.",
    grid: [
      "...111111...",
      "..122222221..".slice(0, 12),
      ".1233333321.".slice(0, 12),
      "..122222221..".slice(0, 12),
      "...111111...",
      "............",
      "....1111....",
      "............",
    ],
    challenge:
      "Use the sensitivity readout to see how many pixels the predicted endpoint moves when the paddle shifts by 10 px.",
  },
];

const EMPTY_GRID = Array.from({ length: BRICK_ROWS }, () => Array(BRICK_COLS).fill(0));

function parseLevelGrid(rows) {
  return rows.map((row) =>
    row
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
      if (!typeId) continue;
      const type = BRICK_TYPES[typeId] || BRICK_TYPES[1];
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
    paddleTargetX: WORLD_W / 2,
    paddleVelocity: 0,
    ball: {
      x: WORLD_W / 2,
      y: PADDLE_Y - BALL_R - 4,
      vx: 0,
      vy: 0,
      stuck: true,
      launched: false,
    },
    score: 0,
    combo: 0,
    lives: 3,
    won: false,
    lost: false,
    lastCollision: null,
  };
}

function bounceFromPaddle(ballX, paddleX, incomingSpeed, paddleVelocity = 0) {
  const offset = clamp((ballX - paddleX) / (PADDLE_W / 2), -1, 1);
  const angle = offset * (Math.PI * 0.42);
  const speed = Math.max(260, incomingSpeed + Math.abs(paddleVelocity) * 0.25);
  return {
    offset,
    vx: Math.sin(angle) * speed + paddleVelocity * 0.18,
    vy: -Math.cos(angle) * speed,
  };
}

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

  if (wasAbove || wasBelow) {
    ball.vy *= -1;
  } else if (wasLeft || wasRight) {
    ball.vx *= -1;
  } else {
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
    if (ball.y > WORLD_H + 30 || collisions > 6) break;
  }

  return points;
}

function predictPaddleContact(game) {
  const ball = game.ball;
  if (ball.stuck) {
    const launch = bounceFromPaddle(game.paddleX, game.paddleX, BALL_SPEED, game.paddleVelocity);
    const start = {
      x: game.paddleX,
      y: PADDLE_Y - BALL_R - 4,
      vx: launch.vx,
      vy: launch.vy,
    };
    return {
      kind: "launch",
      contact: { x: game.paddleX, y: PADDLE_Y - 4 },
      incoming: { x: 0, y: -1 },
      outgoing: normalize(launch.vx, launch.vy),
      impulse: normalize(launch.vx, launch.vy),
      incomingPathPoints: [
        { x: game.paddleX, y: PADDLE_Y - BALL_R - 4 },
        { x: game.paddleX, y: PADDLE_Y - 40 },
      ],
      previewPoints: simulatePath(start, game.bricks),
    };
  }

  if (ball.vy <= 0) return null;
  const distanceToPaddle = PADDLE_Y - BALL_R - ball.y;
  if (distanceToPaddle <= 0) return null;
  const timeToPaddle = distanceToPaddle / ball.vy;
  if (timeToPaddle < 0 || timeToPaddle > 2.5) return null;

  const predictedX = ball.x + ball.vx * timeToPaddle;
  const missDelta = predictedX - game.paddleX;
  const willMiss = predictedX < game.paddleX - PADDLE_W / 2 - BALL_R || predictedX > game.paddleX + PADDLE_W / 2 + BALL_R;

  if (willMiss) {
    return {
      kind: "miss",
      contact: { x: predictedX, y: PADDLE_Y },
      incoming: normalize(ball.vx, ball.vy),
      outgoing: null,
      impulse: null,
      offset: null,
      missDelta,
      incomingPathPoints: [
        { x: ball.x, y: ball.y },
        { x: predictedX, y: PADDLE_Y - BALL_R - 1 },
      ],
      previewPoints: null,
    };
  }

  const speed = magnitude(ball.vx, ball.vy);
  const bounce = bounceFromPaddle(predictedX, game.paddleX, speed, game.paddleVelocity);
  const previewBall = {
    x: predictedX,
    y: PADDLE_Y - BALL_R - 1,
    vx: bounce.vx,
    vy: bounce.vy,
  };
  const incoming = normalize(ball.vx, ball.vy);
  const outgoing = normalize(bounce.vx, bounce.vy);
  const impulse = normalize(bounce.vx - ball.vx, bounce.vy - ball.vy);

  return {
    kind: "bounce",
    contact: { x: predictedX, y: PADDLE_Y },
    incoming,
    outgoing,
    impulse,
    offset: bounce.offset,
    missDelta: 0,
    incomingPathPoints: [
      { x: ball.x, y: ball.y },
      { x: predictedX, y: PADDLE_Y - BALL_R - 1 },
    ],
    previewPoints: simulatePath(previewBall, game.bricks),
  };
}

function estimateSensitivity(game) {
  const delta = 10;
  const base = predictPaddleContact(game);
  if (!base?.previewPoints?.length) return null;

  const plusGame = { ...game, paddleX: clamp(game.paddleX + delta, WALL + PADDLE_W / 2, WORLD_W - WALL - PADDLE_W / 2) };
  const minusGame = { ...game, paddleX: clamp(game.paddleX - delta, WALL + PADDLE_W / 2, WORLD_W - WALL - PADDLE_W / 2) };
  const plus = predictPaddleContact(plusGame);
  const minus = predictPaddleContact(minusGame);
  if (!plus?.previewPoints?.length || !minus?.previewPoints?.length) return null;

  const plusEnd = plus.previewPoints[Math.min(plus.previewPoints.length - 1, 100)];
  const minusEnd = minus.previewPoints[Math.min(minus.previewPoints.length - 1, 100)];
  if (!plusEnd || !minusEnd) return null;

  return (plusEnd.x - minusEnd.x) / (2 * delta);
}

function lineFromPoints(points) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

function formatNumber(value, digits = 2) {
  return Number(value || 0)
    .toFixed(digits)
    .replace(/\.?0+$/, "");
}

function vectorAngleDegrees(vx, vy) {
  return (Math.atan2(vy, vx) * 180) / Math.PI;
}

function getTeachingCopy(game, prediction, sensitivity) {
  if (game.ball.stuck) {
    return {
      title: "Launch preview",
      body:
        "The ghost path shows where the ball will go on launch. During live play, that same preview updates before the ball reaches the paddle so you can steer with intention instead of guessing.",
    };
  }
  if (!prediction) {
    return {
      title: "Wait for the next paddle touch",
      body:
        "When the ball is falling toward the paddle, the game can forecast the impact point, outgoing vector, and ghost path. That is where the physics lesson becomes visible.",
    };
  }
  if (prediction.kind === "miss") {
    return {
      title: "Interception problem",
      body:
        "The gold line shows where the ball will cross the paddle line. Move the paddle until the contact marker lands on the bar, then the rebound path and impulse will appear.",
    };
  }
  if (Math.abs(prediction.offset || 0) < 0.2) {
    return {
      title: "Near-center contact",
      body:
        "Hitting near the middle keeps the reflected vector closer to vertical. Small offsets around center create small directional changes, which is why the path feels stable here.",
    };
  }
  if (Math.abs(prediction.offset || 0) < 0.55) {
    return {
      title: "Moderate offset",
      body:
        "This contact point adds a stronger horizontal component. You can already feel a derivative idea here: a little paddle shift changes the output path by a noticeable amount.",
    };
  }
  return {
    title: "Edge contact",
    body:
      "At the edge, the outgoing vector rotates sharply. That is the intuitive version of sensitivity: a small input shift is causing a much larger output change.",
  };
}

export default function ArkanoidLearn() {
  const navigate = useNavigate();
  const [activeLevelId, setActiveLevelId] = useState(LEVELS[0].id);
  const [customGrid, setCustomGrid] = useState(() => loadCustomGrid());
  const [brush, setBrush] = useState(1);
  const [useCustomLevel, setUseCustomLevel] = useState(false);
  const [showPrediction, setShowPrediction] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [slowMotion, setSlowMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tiltView, setTiltView] = useState(true);
  const [frame, setFrame] = useState(0);

  const svgRef = useRef(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const gameRef = useRef(null);
  const inputRef = useRef({ left: false, right: false });
  const pointerTargetXRef = useRef(WORLD_W / 2);

  const activeLevel = useMemo(
    () => LEVELS.find((level) => level.id === activeLevelId) || LEVELS[0],
    [activeLevelId],
  );

  const loadLevel = useCallback((grid, levelId) => {
    gameRef.current = makeLevelState(levelId, grid);
    pointerTargetXRef.current = WORLD_W / 2;
    setFrame((value) => value + 1);
  }, []);

  useEffect(() => {
    localStorage.setItem(CUSTOM_LEVEL_STORAGE_KEY, serializeGrid(customGrid));
  }, [customGrid]);

  useEffect(() => {
    const grid = useCustomLevel ? customGrid : parseLevelGrid(activeLevel.grid);
    loadLevel(grid, useCustomLevel ? "custom" : activeLevel.id);
  }, [activeLevel, customGrid, loadLevel, useCustomLevel]);

  const setPaddleTargetFromClientX = useCallback((clientX) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds || !gameRef.current) return;
    const ratio = WORLD_W / bounds.width;
    const worldX = (clientX - bounds.left) * ratio;
    pointerTargetXRef.current = clamp(
      worldX,
      WALL + PADDLE_W / 2,
      WORLD_W - WALL - PADDLE_W / 2,
    );
  }, []);

  const launchBall = useCallback(() => {
    const game = gameRef.current;
    if (!game || !game.ball.stuck) return;
    const bounce = bounceFromPaddle(game.ball.x, game.paddleX, BALL_SPEED, game.paddleVelocity);
    game.ball.vx = bounce.vx;
    game.ball.vy = bounce.vy;
    game.ball.stuck = false;
    game.ball.launched = true;
    setFrame((value) => value + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        launchBall();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        inputRef.current.left = true;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        inputRef.current.right = true;
      }
    };
    const onKeyUp = (event) => {
      if (event.key === "ArrowLeft") {
        inputRef.current.left = false;
      }
      if (event.key === "ArrowRight") {
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
      const dt = paused ? 0 : rawDt * (slowMotion ? 0.38 : 1);

      if (!paused) {
        const pointerDelta = pointerTargetXRef.current - game.paddleTargetX;
        if (Math.abs(pointerDelta) > 0.1) {
          const pointerStep = Math.sign(pointerDelta) * Math.min(Math.abs(pointerDelta), PADDLE_MAX_SPEED * dt);
          game.paddleTargetX = clamp(
            game.paddleTargetX + pointerStep,
            WALL + PADDLE_W / 2,
            WORLD_W - WALL - PADDLE_W / 2,
          );
        }

        const moveDirection = (inputRef.current.right ? 1 : 0) - (inputRef.current.left ? 1 : 0);
        if (moveDirection !== 0) {
          game.paddleTargetX = clamp(
            game.paddleTargetX + moveDirection * PADDLE_MAX_SPEED * dt,
            WALL + PADDLE_W / 2,
            WORLD_W - WALL - PADDLE_W / 2,
          );
          pointerTargetXRef.current = game.paddleTargetX;
        }
      }

      const previousPaddleX = game.paddleX;
      game.paddleX += (game.paddleTargetX - game.paddleX) * Math.min(1, dt * 14);
      game.paddleX = clamp(game.paddleX, WALL + PADDLE_W / 2, WORLD_W - WALL - PADDLE_W / 2);
      game.paddleVelocity = dt > 0 ? (game.paddleX - previousPaddleX) / dt : 0;

      if (game.ball.stuck) {
        game.ball.x = game.paddleX;
        game.ball.y = PADDLE_Y - BALL_R - 4;
      } else if (!paused && !game.won && !game.lost) {
        const subSteps = 3;
        const subDt = dt / subSteps;
        for (let stepIndex = 0; stepIndex < subSteps; stepIndex += 1) {
          const ball = game.ball;
          const prevX = ball.x;
          const prevY = ball.y;

          ball.x += ball.vx * subDt;
          ball.y += ball.vy * subDt;

          if (ball.x <= WALL + BALL_R) {
            ball.x = WALL + BALL_R;
            ball.vx = Math.abs(ball.vx);
            game.lastCollision = { type: "wall", label: "Left wall reflection" };
          } else if (ball.x >= WORLD_W - WALL - BALL_R) {
            ball.x = WORLD_W - WALL - BALL_R;
            ball.vx = -Math.abs(ball.vx);
            game.lastCollision = { type: "wall", label: "Right wall reflection" };
          }

          if (ball.y <= WALL + BALL_R) {
            ball.y = WALL + BALL_R;
            ball.vy = Math.abs(ball.vy);
            game.lastCollision = { type: "wall", label: "Top wall reflection" };
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
            game.lastCollision = {
              type: "paddle",
              label: `Paddle contact: offset ${formatNumber(bounce.offset, 2)}`,
            };
          }

          for (const brick of game.bricks) {
            if (brick.hp <= 0) continue;
            if (collideBallWithBrick(ball, brick, prevX, prevY)) {
              brick.hp -= 1;
              game.score += 25;
              game.combo += 1;
              game.lastCollision = {
                type: "brick",
                label: `${BRICK_TYPES[brick.typeId]?.label || "Brick"} hit`,
              };
              break;
            }
          }

          if (ball.y >= WORLD_H + BALL_R + 12) {
            game.lives -= 1;
            if (game.lives <= 0) {
              game.lost = true;
            } else {
              game.ball = {
                x: game.paddleX,
                y: PADDLE_Y - BALL_R - 4,
                vx: 0,
                vy: 0,
                stuck: true,
                launched: false,
              };
              game.combo = 0;
              game.lastCollision = { type: "reset", label: "Ball reset on paddle" };
            }
            break;
          }
        }

        if (game.bricks.every((brick) => brick.hp <= 0)) {
          game.won = true;
        }
      }

      setFrame((value) => value + 1);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, slowMotion]);

  const game = gameRef.current || makeLevelState(activeLevel.id, parseLevelGrid(activeLevel.grid));
  const prediction = useMemo(() => (showPrediction ? predictPaddleContact(game) : null), [frame, game, showPrediction]);
  const sensitivity = useMemo(() => estimateSensitivity(game), [frame, game]);
  const teachingCopy = useMemo(() => getTeachingCopy(game, prediction, sensitivity), [frame, game, prediction, sensitivity]);

  const handleEditorCellClick = useCallback((row, col) => {
    setCustomGrid((current) =>
      current.map((gridRow, rowIndex) =>
        gridRow.map((value, colIndex) => {
          if (rowIndex !== row || colIndex !== col) return value;
          return brush;
        }),
      ),
    );
  }, [brush]);

  const applyCustomLevel = useCallback(() => {
    setUseCustomLevel(true);
  }, []);

  const loadTemplateLevel = useCallback((levelId) => {
    setUseCustomLevel(false);
    setActiveLevelId(levelId);
  }, []);

  const resetCurrentLevel = useCallback(() => {
    const grid = useCustomLevel ? customGrid : parseLevelGrid(activeLevel.grid);
    loadLevel(grid, useCustomLevel ? "custom" : activeLevel.id);
  }, [activeLevel, customGrid, loadLevel, useCustomLevel]);

  const currentSpeed = magnitude(game.ball.vx, game.ball.vy);
  const liveOverlay =
    prediction && prediction.kind === "bounce"
      ? {
          incomingAngle: vectorAngleDegrees(game.ball.vx, game.ball.vy),
          outgoingAngle: vectorAngleDegrees(prediction.outgoing.x, prediction.outgoing.y),
          offset: prediction.offset ?? 0,
          sensitivity,
          impulseMagnitude: magnitude(
            prediction.impulse.x,
            prediction.impulse.y,
          ),
        }
      : null;

  return (
    <div className="h-screen overflow-hidden bg-[#08111f] text-slate-100">
      <div className="flex h-full w-full flex-col px-3 py-3 lg:px-5">
        <div className="mb-3 rounded-[24px] border border-sky-900/40 bg-[radial-gradient(circle_at_top,_rgba(35,123,255,0.22),_transparent_36%),linear-gradient(180deg,_rgba(8,17,31,0.98),_rgba(8,17,31,0.94))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Arkanoid Learn</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Visible physics, not math decoration</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                Move the paddle and read the path, vectors, and impulse before contact, then test the idea immediately.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:self-start">
              <button
                type="button"
                onClick={() => navigate("/games")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                <X className="h-4 w-4" />
                Close
              </button>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
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
                Launch
              </button>
              <button
                type="button"
                onClick={resetCurrentLevel}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Level
              </button>
              <button
                type="button"
                onClick={() => setSlowMotion((value) => !value)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  slowMotion
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-slate-500"
                }`}
              >
                <Gauge className="h-4 w-4" />
                Slow Motion
              </button>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <aside className="min-w-0 space-y-4 overflow-y-auto pr-1">
            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Levels</div>
              <div className="mt-3 grid gap-2">
                {LEVELS.map((level) => {
                  const active = !useCustomLevel && activeLevelId === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => loadTemplateLevel(level.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-cyan-400/70 bg-cyan-400/10"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
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
                    useCustomLevel
                      ? "border-fuchsia-400/70 bg-fuchsia-400/10"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
                  }`}
                >
                  <div className="text-sm font-semibold text-white">Custom Build</div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">Paint your own brick layout and play it immediately.</div>
                </button>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Visibility</div>
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="mt-3 grid gap-2">
                {[
                  { label: "Ghost path prediction", value: showPrediction, setter: setShowPrediction },
                  { label: "Vectors and impulse arrows", value: showVectors, setter: setShowVectors },
                  { label: "2.5D tilt view", value: tiltView, setter: setTiltView },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => option.setter((value) => !value)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                      option.value
                        ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-100"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">{option.value ? "On" : "Off"}</span>
                  </button>
                ))}
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
                      brush === type.id
                        ? "border-fuchsia-400 bg-fuchsia-400/15 text-fuchsia-100"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600"
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
                          borderColor: value ? type.color : "rgba(71, 85, 105, 0.45)",
                          background: value ? `${type.color}22` : "rgba(15, 23, 42, 0.7)",
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

          <main className="flex min-w-0 min-h-0 flex-col rounded-[28px] border border-slate-800 bg-slate-950/75 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {useCustomLevel ? "Custom Build" : activeLevel.title}
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-300">
                  {useCustomLevel ? "Your own brick field is active." : activeLevel.challenge}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">Score {game.score}</span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">Lives {game.lives}</span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">Speed {formatNumber(currentSpeed, 0)} px/s</span>
              </div>
            </div>

            <div
              className="min-h-[420px] flex-1 overflow-hidden rounded-[30px] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(180deg,_rgba(7,15,27,0.98),_rgba(10,18,33,0.98))]"
              style={{
                transform: tiltView ? "perspective(1800px) rotateX(6deg)" : "none",
                transformOrigin: "center top",
              }}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
                className="block h-full w-full cursor-none select-none"
                onMouseMove={(event) => setPaddleTargetFromClientX(event.clientX)}
                onMouseDown={launchBall}
              >
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
                  <marker id="arrowHeadCyan" markerWidth="8" markerHeight="8" refX="5.8" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="#4fd1ff" />
                  </marker>
                  <marker id="arrowHeadAmber" markerWidth="8" markerHeight="8" refX="5.8" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="#f6c667" />
                  </marker>
                  <marker id="arrowHeadPink" markerWidth="8" markerHeight="8" refX="5.8" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="#ff758f" />
                  </marker>
                </defs>

                <rect x="0" y="0" width={WORLD_W} height={WORLD_H} fill="url(#fieldGlow)" />
                <rect x={WALL / 2} y={WALL / 2} width={WORLD_W - WALL} height={WORLD_H - WALL / 2} rx="26" fill="none" stroke="rgba(96, 165, 250, 0.22)" strokeWidth="2" />

                {game.bricks.map((brick) => {
                  if (brick.hp <= 0) return null;
                  const type = BRICK_TYPES[brick.typeId] || BRICK_TYPES[1];
                  return (
                    <g key={brick.id}>
                      <rect
                        x={brick.x}
                        y={brick.y}
                        width={brick.w}
                        height={brick.h}
                        rx="7"
                        fill={`${type.color}${brick.typeId === 1 ? "" : ""}`}
                        opacity={0.16 + brick.hp * 0.18}
                        stroke={type.color}
                        strokeWidth="1.5"
                        filter="url(#softGlow)"
                      />
                      <rect
                        x={brick.x + 2}
                        y={brick.y + 2}
                        width={brick.w - 4}
                        height={brick.h - 4}
                        rx="5"
                        fill={type.color}
                        opacity={0.55 + brick.hp * 0.1}
                      />
                    </g>
                  );
                })}

                {prediction?.incomingPathPoints?.length > 1 && (prediction.kind === "bounce" || prediction.kind === "miss") && (
                  <polyline
                    points={lineFromPoints(prediction.incomingPathPoints)}
                    fill="none"
                    stroke="rgba(246, 198, 103, 0.9)"
                    strokeWidth="3"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {prediction?.previewPoints?.length > 1 && prediction.kind === "bounce" && (
                  <polyline
                    points={lineFromPoints(prediction.previewPoints)}
                    fill="none"
                    stroke="rgba(110, 231, 255, 0.82)"
                    strokeWidth="3"
                    strokeDasharray="12 9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#softGlow)"
                  />
                )}

                {showVectors && prediction && (
                  <g>
                    <line
                      x1={prediction.contact.x}
                      y1={prediction.contact.y}
                      x2={prediction.contact.x + prediction.incoming.x * 68}
                      y2={prediction.contact.y + prediction.incoming.y * 68}
                      stroke="#f6c667"
                      strokeWidth="3"
                      markerEnd="url(#arrowHeadAmber)"
                    />
                    <line
                      x1={prediction.contact.x}
                      y1={prediction.contact.y}
                      x2={prediction.kind === "bounce" ? prediction.contact.x + prediction.outgoing.x * 96 : prediction.contact.x}
                      y2={prediction.kind === "bounce" ? prediction.contact.y + prediction.outgoing.y * 96 : prediction.contact.y}
                      stroke="#4fd1ff"
                      strokeWidth="3.5"
                      markerEnd="url(#arrowHeadCyan)"
                      opacity={prediction.kind === "bounce" ? 1 : 0}
                    />
                    <line
                      x1={prediction.contact.x}
                      y1={prediction.contact.y}
                      x2={prediction.kind === "bounce" ? prediction.contact.x + prediction.impulse.x * 82 : prediction.contact.x}
                      y2={prediction.kind === "bounce" ? prediction.contact.y + prediction.impulse.y * 82 : prediction.contact.y}
                      stroke="#ff758f"
                      strokeWidth="3"
                      markerEnd="url(#arrowHeadPink)"
                      opacity={prediction.kind === "bounce" ? 1 : 0}
                    />
                    <line
                      x1={prediction.contact.x}
                      y1={prediction.contact.y}
                      x2={prediction.contact.x}
                      y2={prediction.contact.y - 54}
                      stroke="rgba(226, 232, 240, 0.6)"
                      strokeDasharray="6 7"
                      strokeWidth="2"
                    />
                    <circle cx={prediction.contact.x} cy={prediction.contact.y} r="6" fill="#ffffff" opacity="0.9" />
                    <rect
                      x={game.paddleX - PADDLE_W / 2}
                      y={PADDLE_Y - 7}
                      width={PADDLE_W}
                      height="14"
                      rx="7"
                      fill="none"
                      stroke={prediction.kind === "bounce" ? "rgba(79, 209, 255, 0.45)" : "rgba(248, 113, 113, 0.42)"}
                      strokeDasharray="8 7"
                      strokeWidth="2"
                    />
                    <line
                      x1={prediction.contact.x}
                      y1={PADDLE_Y - 26}
                      x2={prediction.contact.x}
                      y2={PADDLE_Y + 26}
                      stroke={prediction.kind === "bounce" ? "#4fd1ff" : "#fb7185"}
                      strokeWidth="2.5"
                      strokeDasharray="5 5"
                    />
                    <text
                      x={prediction.contact.x + 12}
                      y={PADDLE_Y - 18}
                      fill={prediction.kind === "bounce" ? "#bae6fd" : "#fecdd3"}
                      fontSize="13"
                      fontWeight="700"
                    >
                      {prediction.kind === "bounce" ? "predicted hit" : "miss point"}
                    </text>
                    {prediction.kind === "miss" && (
                      <>
                        <line
                          x1={game.paddleX}
                          y1={PADDLE_Y - 36}
                          x2={prediction.contact.x}
                          y2={PADDLE_Y - 36}
                          stroke="#fb7185"
                          strokeWidth="3"
                          markerEnd="url(#arrowHeadPink)"
                        />
                        <text
                          x={(game.paddleX + prediction.contact.x) / 2}
                          y={PADDLE_Y - 46}
                          textAnchor="middle"
                          fill="#fecdd3"
                          fontSize="13"
                          fontWeight="700"
                        >
                          move {formatNumber(Math.abs(prediction.missDelta), 0)} px {prediction.missDelta > 0 ? "right" : "left"}
                        </text>
                      </>
                    )}
                    {prediction.kind === "bounce" && (
                      <>
                        <text x={prediction.contact.x + 12} y={prediction.contact.y - 58} fill="#fef3c7" fontSize="12" fontWeight="700">
                          in {formatNumber(vectorAngleDegrees(game.ball.vx, game.ball.vy), 0)}°
                        </text>
                        <text x={prediction.contact.x + 12} y={prediction.contact.y - 40} fill="#bae6fd" fontSize="12" fontWeight="700">
                          out {formatNumber(vectorAngleDegrees(prediction.outgoing.x, prediction.outgoing.y), 0)}°
                        </text>
                        <text x={prediction.contact.x + 12} y={prediction.contact.y - 22} fill="#fbcfe8" fontSize="12" fontWeight="700">
                          offset {formatNumber(prediction.offset, 2)}
                        </text>
                      </>
                    )}
                  </g>
                )}

                <rect
                  x={game.paddleX - PADDLE_W / 2}
                  y={PADDLE_Y}
                  width={PADDLE_W}
                  height={PADDLE_H}
                  rx="8"
                  fill="#38bdf8"
                  stroke="#dff9ff"
                  strokeWidth="1.5"
                  filter="url(#softGlow)"
                />
                <rect
                  x={game.paddleX - PADDLE_W / 2 + 10}
                  y={PADDLE_Y + 3}
                  width={PADDLE_W - 20}
                  height={PADDLE_H - 6}
                  rx="6"
                  fill="rgba(224, 242, 254, 0.4)"
                />
                <circle
                  cx={game.ball.x}
                  cy={game.ball.y}
                  r={BALL_R}
                  fill="#ffffff"
                  stroke="#4fd1ff"
                  strokeWidth="2"
                  filter="url(#softGlow)"
                />

                {game.won && (
                  <g>
                    <rect x="220" y="230" width="520" height="120" rx="28" fill="rgba(16, 185, 129, 0.18)" stroke="rgba(52, 211, 153, 0.58)" />
                    <text x="480" y="276" textAnchor="middle" fill="#dcfce7" fontSize="28" fontWeight="700">Level cleared</text>
                    <text x="480" y="310" textAnchor="middle" fill="#bbf7d0" fontSize="16">
                      Reset the level or load another challenge.
                    </text>
                  </g>
                )}

                {game.lost && (
                  <g>
                    <rect x="220" y="230" width="520" height="120" rx="28" fill="rgba(239, 68, 68, 0.18)" stroke="rgba(248, 113, 113, 0.58)" />
                    <text x="480" y="276" textAnchor="middle" fill="#fee2e2" fontSize="28" fontWeight="700">Try another run</text>
                    <text x="480" y="310" textAnchor="middle" fill="#fecaca" fontSize="16">
                      Reset and use the preview line to plan the next rebound.
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {[
                {
                  label: "Collision story",
                  value: game.lastCollision?.label || "No collision yet",
                  accent: "text-cyan-200",
                  icon: Crosshair,
                },
                {
                  label: "Prediction sensitivity",
                  value: sensitivity == null ? "Waiting for a paddle prediction" : `${formatNumber(sensitivity, 2)} px of endpoint shift per 1 px of paddle shift`,
                  accent: "text-amber-200",
                  icon: Waves,
                },
                {
                  label: "Calculus intuition",
                  value: prediction ? "The game is showing output-path change from a small input change in paddle position." : "Launch or wait for a downward approach to expose the live derivative intuition.",
                  accent: "text-fuchsia-200",
                  icon: Sparkles,
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-[22px] border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      <Icon className={`h-4 w-4 ${card.accent}`} />
                      {card.label}
                    </div>
                    <div className="mt-3 text-sm leading-7 text-slate-200">{card.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              {[
                { label: "Incoming angle", value: liveOverlay ? `${formatNumber(liveOverlay.incomingAngle, 1)}°` : "Waiting for descent" },
                { label: "Outgoing angle", value: liveOverlay ? `${formatNumber(liveOverlay.outgoingAngle, 1)}°` : "Waiting for descent" },
                { label: "Paddle offset", value: liveOverlay ? formatNumber(liveOverlay.offset, 2) : "0" },
                {
                  label: "Path sensitivity",
                  value:
                    liveOverlay && liveOverlay.sensitivity != null
                      ? `${formatNumber(liveOverlay.sensitivity, 2)} px/px`
                      : "Waiting for descent",
                },
                {
                  label: "Impulse strength",
                  value: liveOverlay ? formatNumber(liveOverlay.impulseMagnitude, 2) : "Waiting for descent",
                },
              ].map((metric) => (
                <div key={metric.label} className="rounded-[22px] border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{metric.label}</div>
                  <div className="mt-3 text-lg font-semibold text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </main>

          <aside className="min-w-0 space-y-4 overflow-y-auto pr-1">
            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">What you are learning</div>
              <div className="mt-3 text-lg font-semibold text-white">{teachingCopy.title}</div>
              <p className="mt-2 text-sm leading-7 text-slate-300">{teachingCopy.body}</p>
            </section>

            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Physics overlay</div>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
                <p><span className="font-semibold text-amber-200">Gold:</span> incoming velocity direction.</p>
                <p><span className="font-semibold text-cyan-200">Cyan:</span> reflected velocity after contact.</p>
                <p><span className="font-semibold text-pink-200">Pink:</span> impulse direction, the visible change in velocity caused by the collision.</p>
                <p><span className="font-semibold text-slate-100">Dashed line:</span> the ghost path the ball is expected to follow after the next paddle contact.</p>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Live numbers</div>
              <div className="mt-3 grid gap-3">
                {[
                  { label: "Ball x", value: `${formatNumber(game.ball.x, 1)} px` },
                  { label: "Ball y", value: `${formatNumber(game.ball.y, 1)} px` },
                  { label: "vx", value: `${formatNumber(game.ball.vx, 1)} px/s` },
                  { label: "vy", value: `${formatNumber(game.ball.vy, 1)} px/s` },
                  { label: "Paddle center", value: `${formatNumber(game.paddleX, 1)} px` },
                  { label: "Active bricks", value: String(game.bricks.filter((brick) => brick.hp > 0).length) },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
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
