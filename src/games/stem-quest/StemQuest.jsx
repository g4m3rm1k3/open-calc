import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";
import lessonBattles from "./lessonBattles.json";
import questData from "./quests.json";
import {
  BookOpen,
  ChevronRight,
  Compass,
  Home,
  Lightbulb,
  Map as MapIcon,
  Mountain,
  ScrollText,
  Sparkles,
  Star,
  Swords,
  Trophy,
  X,
} from "lucide-react";

const DEFAULT_START = { lat: 38.9, lng: -77.0 };
const WORLD_ZOOM = 13;
const STEP_SIZE = 0.012;
const ENCOUNTER_STEP_THRESHOLD = 24;
const ENCOUNTER_COOLDOWN_MS = 18000;

const TOWNS = [
  {
    id: "academy",
    name: "The Academy",
    topic: "intro",
    lat: 38.9,
    lng: -77.0,
    color: "#6366f1",
    emoji: "Academy",
    marker: "🏛️",
    npc: "Professor Newton",
    difficulty: 1,
    radius: 0.07,
    description: "The starting city where your STEM journey begins.",
    purpose: "Meet your first mentor, accept your first quest, and learn how the world is laid out.",
    greeting: [
      "Welcome to the Academy, traveler. This world was built to train thinkers, builders, and problem-solvers.",
      "Four great disciplines spread out from here: Physics to the north, Chemistry to the east, Math to the south, and Engineering to the west.",
      "Do not rush. Each town teaches first and tests second. The point is not just to win battles, but to understand why your answers work.",
    ],
  },
  {
    id: "physics-keep",
    name: "Physics Keep",
    topic: "physics",
    lat: 39.3,
    lng: -77.0,
    color: "#3b82f6",
    emoji: "Physics",
    marker: "🌌",
    npc: "Sir Isaac",
    difficulty: 2,
    radius: 0.08,
    description: "A fortress devoted to motion, forces, energy, and waves.",
    purpose: "Learn how the world moves and why forces change what objects do.",
    greeting: [
      "You have arrived at Physics Keep, where every swinging pendulum and falling stone has a story.",
      "The knights here do not just memorize formulas. They use them to predict motion, estimate forces, and explain energy transfers.",
      "If you can read the lesson and answer under pressure, you will earn your place here.",
    ],
  },
  {
    id: "alchemy-lab",
    name: "Alchemy Lab",
    topic: "chemistry",
    lat: 38.9,
    lng: -76.5,
    color: "#10b981",
    emoji: "Chemistry",
    marker: "⚗️",
    npc: "Dr. Curie",
    difficulty: 2,
    radius: 0.08,
    description: "A coastal research city focused on matter, atoms, and reactions.",
    purpose: "Discover how materials are built and why different substances behave the way they do.",
    greeting: [
      "Welcome to the Alchemy Lab. Here, matter is not mysterious once you learn the language of atoms and bonds.",
      "A chemist sees patterns inside formulas, structures, and reactions the way a musician sees patterns in notes.",
      "Study the lesson before the duel. Understanding beats guessing every time.",
    ],
  },
  {
    id: "math-citadel",
    name: "Math Citadel",
    topic: "math",
    lat: 38.5,
    lng: -77.0,
    color: "#8b5cf6",
    emoji: "Math",
    marker: "∑",
    npc: "Euler",
    difficulty: 2,
    radius: 0.08,
    description: "A southern stronghold where patterns become proofs and formulas.",
    purpose: "Master the language that supports every other STEM field.",
    greeting: [
      "This is the Math Citadel, where patterns are sharpened into exact arguments.",
      "When people call math abstract, they often miss that it is the tool that makes the rest of STEM precise.",
      "Your challenge here is to think clearly, not just quickly.",
    ],
  },
  {
    id: "engineers-haven",
    name: "Engineers Haven",
    topic: "engineering",
    lat: 38.9,
    lng: -77.5,
    color: "#f59e0b",
    emoji: "Engineering",
    marker: "⚙️",
    npc: "Nikola Tesla",
    difficulty: 3,
    radius: 0.08,
    description: "A western workshop-city where circuits, structures, and systems come together.",
    purpose: "Apply STEM ideas to real designs, useful tradeoffs, and practical constraints.",
    greeting: [
      "Welcome to Engineers Haven. Here, theory must survive contact with real materials, budgets, and constraints.",
      "Every design choice has consequences. Every shortcut creates a tradeoff.",
      "If you can think like a builder and explain your reasoning, you belong here.",
    ],
  },
];

const ROAD_GRAPH = [
  ["academy", "physics-keep"],
  ["academy", "alchemy-lab"],
  ["academy", "math-citadel"],
  ["academy", "engineers-haven"],
];

const WAYPOINTS = [
  { id: "wp-north", lat: 39.1, lng: -77.0, topic: "physics", label: "Northern Crossroads", color: "#3b82f6" },
  { id: "wp-east", lat: 38.9, lng: -76.75, topic: "chemistry", label: "Eastern Trade Post", color: "#10b981" },
  { id: "wp-south", lat: 38.7, lng: -77.0, topic: "math", label: "Southern Pass", color: "#8b5cf6" },
  { id: "wp-west", lat: 38.9, lng: -77.25, topic: "engineering", label: "Western Junction", color: "#f59e0b" },
];

const REGION_GUIDE = [
  {
    id: "intro",
    label: "Academy Ring",
    hint: "Stay near home to meet mentors, accept quests, and learn the world layout.",
  },
  {
    id: "north",
    label: "Northern Physics Frontier",
    hint: "Travel north along the road to Physics Keep for motion, force, and energy.",
  },
  {
    id: "east",
    label: "Eastern Chemistry Coast",
    hint: "Travel east toward the coast for atoms, reactions, and materials.",
  },
  {
    id: "south",
    label: "Southern Math Range",
    hint: "Travel south for algebra, geometry, and calculus.",
  },
  {
    id: "west",
    label: "Western Engineering Belt",
    hint: "Travel west for circuits, structures, and applied design.",
  },
];

const REGION_NOTES = {
  intro: [
    "This world is meant to unfold like an RPG map, not a menu. Use roads and quest markers to decide where to go next.",
    "The Academy is your anchor point. It teaches the basics and gives you the first purpose-driven quests.",
    "Specialist towns get harder, but they also unlock more interesting ideas and bigger rewards.",
  ],
  physics: [
    "Physics asks how quantities change in space and time.",
    "Force, acceleration, and energy are some of the most reusable ideas in all of STEM.",
    "When a formula feels abstract, imagine what it predicts in a real machine or moving object.",
  ],
  chemistry: [
    "Chemistry explains why materials are different, not just what they are called.",
    "Atoms, bonds, and reactions give you the hidden structure behind visible matter.",
    "A good chemistry lesson turns a formula into a mental picture of particles and change.",
  ],
  math: [
    "Math is the structure behind the map. It is what lets science make exact statements.",
    "A derivative is not just a rule. It is a rate. An integral is not just notation. It is accumulation.",
    "Clear thinking is the main weapon here.",
  ],
  engineering: [
    "Engineering is where theory meets tradeoffs.",
    "A design can be elegant in theory and still fail in practice if the constraints are ignored.",
    "Units, diagrams, assumptions, and efficiency all matter because real systems are not perfect.",
  ],
};

const ENEMIES = {
  intro: [
    { name: "Curious Slime", emoji: "🟢" },
    { name: "Pop Quiz Bat", emoji: "🦇" },
  ],
  physics: [
    { name: "Vector Wisp", emoji: "💫" },
    { name: "Momentum Knight", emoji: "🛡️" },
  ],
  chemistry: [
    { name: "Reaction Sprite", emoji: "🧪" },
    { name: "Bond Drake", emoji: "🐉" },
  ],
  math: [
    { name: "Limit Shade", emoji: "📐" },
    { name: "Derivative Phantom", emoji: "👻" },
  ],
  engineering: [
    { name: "Circuit Golem", emoji: "🤖" },
    { name: "Bridge Troll", emoji: "🪜" },
  ],
};

function getTownById(id) {
  return TOWNS.find((town) => town.id === id) ?? null;
}

function getQuestList(progress) {
  return questData.map((quest) => {
    const unlocked = !quest.requires || quest.requires.every((flag) => hasProgressFlag(progress, flag));
    const complete = quest.completeWhen.every((flag) => hasProgressFlag(progress, flag));
    return {
      ...quest,
      unlocked,
      complete,
    };
  });
}

function hasProgressFlag(progress, flag) {
  if (flag.startsWith("visited:")) {
    return progress.visitedTowns.includes(flag.replace("visited:", ""));
  }
  if (flag.startsWith("topic:")) {
    return progress.completedTopics.includes(flag.replace("topic:", ""));
  }
  if (flag.startsWith("victories>=")) {
    return progress.victories >= Number(flag.replace("victories>=", ""));
  }
  return false;
}

function getRegionTopic(pos, origin = DEFAULT_START) {
  const dLat = pos.lat - origin.lat;
  const dLng = pos.lng - origin.lng;
  const distance = Math.hypot(dLat, dLng);

  if (distance < 0.16) return "intro";
  if (Math.abs(dLat) >= Math.abs(dLng)) {
    return dLat > 0 ? "physics" : "math";
  }
  return dLng > 0 ? "chemistry" : "engineering";
}

function getRegionCard(topic) {
  if (topic === "physics") return REGION_GUIDE.find((item) => item.id === "north");
  if (topic === "chemistry") return REGION_GUIDE.find((item) => item.id === "east");
  if (topic === "math") return REGION_GUIDE.find((item) => item.id === "south");
  if (topic === "engineering") return REGION_GUIDE.find((item) => item.id === "west");
  return REGION_GUIDE.find((item) => item.id === "intro");
}

function getTopicColor(topic) {
  if (topic === "physics") return "#3b82f6";
  if (topic === "chemistry") return "#10b981";
  if (topic === "math") return "#8b5cf6";
  if (topic === "engineering") return "#f59e0b";
  return "#6366f1";
}

function distanceToTown(a, b) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

function pickEncounterTown(topic, playerPos) {
  const pool = ENEMIES[topic] ?? ENEMIES.intro;
  const enemy = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: `encounter-${topic}-${Date.now()}`,
    topic,
    name: `${enemy.name} Encounter`,
    marker: enemy.emoji,
    emoji: enemy.name,
    npc: enemy.name,
    color: getTopicColor(topic),
    description: "A roaming challenge blocks your road.",
    purpose: "Defeat the roaming challenge to keep traveling.",
    difficulty: topic === "engineering" ? 3 : topic === "intro" ? 1 : 2,
    encounter: true,
    lat: playerPos.lat,
    lng: playerPos.lng,
    greeting: [
      `A ${enemy.name} steps onto the road.`,
      "It does not attack blindly. First it forces you to understand a key idea.",
    ],
  };
}

function getRoadPath(fromId, toId) {
  const from = getTownById(fromId);
  const to = getTownById(toId);
  if (!from || !to) return [];
  if (from.id === "academy" || to.id === "academy") {
    return [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ];
  }
  const academy = getTownById("academy");
  return [
    [from.lat, from.lng],
    [academy.lat, academy.lng],
    [to.lat, to.lng],
  ];
}

function StoryBanner({ quest, onDismiss }) {
  if (!quest) return null;

  return (
    <div className="absolute left-1/2 top-4 z-[650] w-[min(720px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-indigo-400/30 bg-slate-950 px-5 py-4 shadow-2xl">
      <div className="mb-2 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-xl">
          📖
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300">Story Quest</div>
          <div className="text-lg font-bold text-white">{quest.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-300">{quest.story}</div>
        </div>
        <button onClick={onDismiss} className="text-slate-500 transition-colors hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="rounded-xl border border-slate-700/50 bg-slate-900 px-3 py-2 text-xs text-slate-300">
        <span className="font-semibold text-slate-100">Objective:</span> {quest.detail}
      </div>
    </div>
  );
}

function MapSync({ pos, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView([pos.lat, pos.lng], zoom, { animate: false });
  }, [map, pos, zoom]);

  return null;
}

function KeyboardController({
  setPos,
  towns,
  onNearTown,
  onEnterKey,
  onEncounter,
  gameActive,
  origin,
  progress,
}) {
  const moveCountRef = useRef(0);
  const lastEncounterRef = useRef(0);

  useEffect(() => {
    if (!gameActive) return undefined;

    function handleKeyDown(event) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter"].includes(key)) {
        event.preventDefault();
      }

      if (key === "e" || key === "enter") {
        setPos((current) => {
          const foundTown = towns.find((town) => distanceToTown(current, town) < town.radius);
          if (foundTown) onEnterKey(foundTown);
          return current;
        });
        return;
      }

      const delta = { lat: 0, lng: 0 };
      if (key === "w" || key === "arrowup") delta.lat += STEP_SIZE;
      if (key === "s" || key === "arrowdown") delta.lat -= STEP_SIZE;
      if (key === "a" || key === "arrowleft") delta.lng -= STEP_SIZE;
      if (key === "d" || key === "arrowright") delta.lng += STEP_SIZE;
      if (!delta.lat && !delta.lng) return;

      setPos((current) => {
        const next = { lat: current.lat + delta.lat, lng: current.lng + delta.lng };
        const foundTown = towns.find((town) => distanceToTown(next, town) < town.radius);
        onNearTown(foundTown ?? null);

        moveCountRef.current += 1;
        const now = Date.now();
        const canEncounter =
          progress.victories > 0 &&
          !foundTown &&
          moveCountRef.current >= ENCOUNTER_STEP_THRESHOLD &&
          now - lastEncounterRef.current > ENCOUNTER_COOLDOWN_MS &&
          Math.random() < 0.16;

        if (canEncounter) {
          moveCountRef.current = 0;
          lastEncounterRef.current = now;
          onEncounter(pickEncounterTown(getRegionTopic(next, origin), next));
        }

        return next;
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameActive, onEncounter, onEnterKey, onNearTown, origin, progress.victories, setPos, towns]);

  return null;
}

function DialogueBox({ town, onClose, onBattle }) {
  const [page, setPage] = useState(0);
  const pages = town.greeting ?? ["A lesson challenge awaits."];

  useEffect(() => {
    setPage(0);
  }, [town]);

  const isLast = page >= pages.length - 1;

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black px-6">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border bg-slate-950 px-6 shadow-2xl"
        style={{ borderColor: `${town.color}66`, boxShadow: `0 24px 80px ${town.color}22` }}
      >
        <div className="flex items-center gap-3 border-b py-5" style={{ borderColor: `${town.color}33` }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${town.color}22` }}>
            {town.marker}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: town.color }}>
              {town.emoji}
            </div>
            <div className="text-xl font-bold text-white">{town.name}</div>
            <div className="text-sm text-slate-400">{town.npc}</div>
          </div>
          <button onClick={onClose} className="text-slate-500 transition-colors hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 py-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Why This Place Matters</div>
            <p className="text-sm leading-relaxed text-slate-300">{town.purpose}</p>
          </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4">
            <p className="text-sm leading-relaxed text-slate-100">{pages[page]}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t py-4" style={{ borderColor: `${town.color}33` }}>
          <div className="flex gap-1">
            {pages.map((_, index) => (
              <div
                key={index}
                className="h-1.5 w-8 rounded-full"
                style={{ background: index === page ? town.color : "#334155" }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isLast ? (
              <button
                onClick={() => setPage((current) => Math.min(current + 1, pages.length - 1))}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                style={{ background: `${town.color}20`, color: town.color, border: `1px solid ${town.color}40` }}
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200">
                  Leave
                </button>
                <button
                  onClick={onBattle}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-colors"
                  style={{ background: town.color }}
                >
                  <Swords className="h-4 w-4" />
                  Start Lesson Battle
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildLessonSteps(round) {
  if (Array.isArray(round.lessonSteps) && round.lessonSteps.length > 0) {
    return round.lessonSteps;
  }

  const steps = [];

  steps.push({
    id: "idea",
    badge: "Core Idea",
    title: "What this idea means",
    body: round.intuition ?? round.summary,
    formula: round.formula,
    definitions: round.definitions ?? [],
    visual: round.visual ?? null,
  });

  if (Array.isArray(round.definitions) && round.definitions.length > 0) {
    steps.push({
      id: "definitions",
      badge: "Definitions",
      title: "What each symbol means",
      body: "Read the formula by naming each quantity before you try to calculate with it.",
      formula: round.formula,
      definitions: round.definitions,
      visual: { type: "definitions" },
    });
  }

  if (round.workedExample) {
    steps.push({
      id: "example",
      badge: "Worked Example",
      title: "See it in action",
      body: round.workedExample,
      formula: round.formula,
      definitions: round.definitions ?? [],
      visual: round.visual ?? null,
    });
  }

  steps.push({
    id: "takeaway",
    badge: "Takeaway",
    title: "What to remember",
    body: round.takeaway ?? round.summary,
    mistake: round.mistake ?? null,
    formula: round.formula,
    definitions: round.definitions ?? [],
    visual: null,
  });

  return steps;
}

function LessonVisual({ visual, formula, definitions, color }) {
  const accent = color ?? "#6366f1";

  if (!visual && !formula) return null;

  if (visual?.type === "atom-core") {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-400/40 bg-cyan-950/30 text-center">
          <div className="rounded-full bg-cyan-400/20 px-3 py-2 text-sm font-bold text-cyan-200">{visual.center}</div>
          <div className="absolute -bottom-7 text-xs uppercase tracking-[0.16em] text-slate-400">{visual.ring}</div>
        </div>
      </div>
    );
  }

  if (visual?.type === "molecule") {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
        <svg viewBox="0 0 240 140" className="h-full w-full">
          <line x1="120" y1="70" x2="72" y2="40" stroke="#475569" strokeWidth="4" />
          <line x1="120" y1="70" x2="168" y2="40" stroke="#475569" strokeWidth="4" />
          <circle cx="120" cy="70" r="24" fill="#0f766e" />
          <circle cx="72" cy="40" r="18" fill="#334155" />
          <circle cx="168" cy="40" r="18" fill="#334155" />
          <text x="120" y="76" textAnchor="middle" fill="#ecfeff" fontSize="22" fontWeight="700">{visual.center}</text>
          <text x="72" y="46" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700">{visual.outer?.[0] ?? "H"}</text>
          <text x="168" y="46" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700">{visual.outer?.[1] ?? "H"}</text>
        </svg>
      </div>
    );
  }

  if (visual?.type === "circle-area") {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
        <svg viewBox="0 0 240 140" className="h-full w-full">
          <circle cx="120" cy="70" r="42" fill="rgba(99,102,241,0.12)" stroke="#818cf8" strokeWidth="4" />
          <line x1="120" y1="70" x2="162" y2="70" stroke="#fbbf24" strokeWidth="4" />
          <text x="138" y="62" fill="#fbbf24" fontSize="14" fontWeight="700">r</text>
          <text x="120" y="76" textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight="700">A</text>
          <text x="120" y="124" textAnchor="middle" fill="#94a3b8" fontSize="12">{visual.tag ?? "radius controls area"}</text>
        </svg>
      </div>
    );
  }

  if (visual?.type === "line-rise" || visual?.type === "line-slope") {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
        <svg viewBox="0 0 240 140" className="h-full w-full">
          <line x1="38" y1="106" x2="202" y2="106" stroke="#475569" strokeWidth="3" />
          <line x1="38" y1="106" x2="38" y2="20" stroke="#475569" strokeWidth="3" />
          <line x1="54" y1="92" x2="170" y2="42" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <text x="202" y="122" fill="#94a3b8" fontSize="12">{visual.xLabel ?? "x"}</text>
          <text x="18" y="22" fill="#94a3b8" fontSize="12">{visual.yLabel ?? "y"}</text>
          <text x="120" y="28" textAnchor="middle" fill="#e2e8f0" fontSize="12">{visual.tag ?? "rate of change"}</text>
        </svg>
      </div>
    );
  }

  if (visual?.type === "force-box" || visual?.type === "beam-load" || visual?.type === "ratio-bars" || visual?.type === "ohm-loop" || visual?.type === "energy-bars" || visual?.type === "count-cluster" || visual?.type === "constant-bar" || visual?.type === "unit-card" || visual?.type === "bond-share") {
    const pills =
      visual.type === "force-box"
        ? [visual.left, visual.center, visual.right]
        : visual.type === "beam-load"
          ? [visual.top, visual.bottom, visual.result]
          : visual.type === "ratio-bars"
            ? [visual.left, visual.right, visual.tag]
            : visual.type === "ohm-loop"
              ? [visual.left, visual.center, visual.right]
              : visual.type === "energy-bars"
                ? visual.labels
                : visual.type === "count-cluster"
                  ? [visual.label, visual.value]
                  : visual.type === "constant-bar"
                    ? [visual.label, visual.value]
                    : visual.type === "unit-card"
                      ? visual.items
                      : [visual.left, visual.center, visual.right];

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Visual Model</div>
        <div className="flex flex-wrap items-center gap-2">
          {pills.filter(Boolean).map((pill) => (
            <div
              key={pill}
              className="rounded-full border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: `${accent}55`, background: `${accent}18`, color: "#e2e8f0" }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual?.type === "definitions" && definitions?.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="mb-3 font-mono text-lg font-bold text-emerald-300">{formula}</div>
        <div className="grid gap-2">
          {definitions.map((item) => (
            <div key={item.symbol} className="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-2">
              <div className="min-w-[56px] rounded-lg bg-slate-800 px-2 py-1 text-center font-mono text-sm font-bold text-cyan-300">
                {item.symbol}
              </div>
              <div className="text-sm text-slate-300">{item.meaning}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Key Formula</div>
      <div className="font-mono text-lg font-bold text-emerald-300">{formula}</div>
    </div>
  );
}

function BattleScreen({ town, onComplete }) {
  const topicPack = lessonBattles[town.topic] ?? lessonBattles.intro;
  const [rounds] = useState(() => {
    const shuffled = [...topicPack.lessons].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  });
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState("story");
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [playerHp, setPlayerHp] = useState(3);
  const [enemyHp, setEnemyHp] = useState(rounds.length);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(40);
  const [lessonStepIndex, setLessonStepIndex] = useState(0);
  const timerRef = useRef(null);

  const round = rounds[roundIndex];
  const question = round.question;
  const lessonSteps = buildLessonSteps(round);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(40);
    timerRef.current = setInterval(() => {
      setTimer((current) => {
        if (current <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    setSelected(null);
    setLocked(false);
    setShowHint(false);
    setLessonStepIndex(0);
    if (phase === "quiz") {
      resetTimer();
    } else {
      clearInterval(timerRef.current);
      setTimer(40);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, roundIndex, resetTimer]);

  useEffect(() => {
    if (phase !== "quiz" || timer > 0 || locked) return;
    handleAnswer(-1, true);
  }, [locked, phase, timer]);

  function finishBattle(win) {
    const xp = win ? town.difficulty * 50 : 10;
    setResult({ win, xp });
  }

  function handleAnswer(answerIndex, timeout = false) {
    clearInterval(timerRef.current);
    if (locked) return;

    setSelected(answerIndex);
    setLocked(true);
    const correct = !timeout && answerIndex === question.a;

    if (correct) {
      const nextEnemyHp = enemyHp - 1;
      setEnemyHp(nextEnemyHp);
      if (nextEnemyHp <= 0) {
        setTimeout(() => finishBattle(true), 1000);
        return;
      }
    } else {
      const nextPlayerHp = playerHp - 1;
      setPlayerHp(nextPlayerHp);
      if (nextPlayerHp <= 0) {
        setTimeout(() => finishBattle(false), 1000);
        return;
      }
    }

    setTimeout(() => {
      if (roundIndex < rounds.length - 1) {
        setRoundIndex((current) => current + 1);
        setPhase("story");
      } else {
        finishBattle(correct);
      }
    }, 1600);
  }

  if (result) {
    return (
      <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black px-6">
        <div
          className="w-full max-w-lg rounded-3xl border px-8 py-10 text-center"
          style={{
            borderColor: result.win ? "#fbbf24" : "#ef4444",
            background: "#0a0c14",
          }}
        >
          <div className="mb-4 text-6xl">{result.win ? "🏆" : "💀"}</div>
          <h2 className="mb-2 text-2xl font-bold" style={{ color: result.win ? "#fbbf24" : "#ef4444" }}>
            {result.win ? "Lesson Cleared" : "Retreat"}
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-300">
            {result.win
              ? `You cleared ${town.name} and turned the lesson into a win.`
              : `${town.npc} pushed you back. Read carefully and return when you're ready.`}
          </p>
          <div className="mb-6 flex items-center justify-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="font-bold text-yellow-400">+{result.xp} XP</span>
          </div>
          <button
            onClick={() => onComplete(result.win, result.xp)}
            className="rounded-xl px-8 py-2.5 text-sm font-bold text-white"
            style={{ background: result.win ? "#fbbf24" : "#6366f1" }}
          >
            Continue Adventure
          </button>
        </div>
      </div>
    );
  }

  if (phase === "story" || phase === "lesson") {
    const activeStep = lessonSteps[Math.min(lessonStepIndex, lessonSteps.length - 1)];
    const lastLessonStep = lessonStepIndex >= lessonSteps.length - 1;
    const badge = phase === "story" ? "Scene" : activeStep.badge ?? "Lesson";
    const title = phase === "story" ? round.title : activeStep.title ?? `Lesson: ${round.title}`;
    const body =
      phase === "story"
        ? round.story ?? `Before the challenge begins, ${town.npc} frames the problem: ${round.summary}`
        : activeStep.body;

    return (
      <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black px-6">
        <div
          className="w-full max-w-3xl rounded-3xl border bg-slate-950 shadow-2xl"
          style={{ borderColor: `${town.color}66`, boxShadow: `0 24px 80px ${town.color}20` }}
        >
          <div className="border-b px-6 py-4" style={{ borderColor: `${town.color}33` }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${town.color}22` }}>
                {town.marker}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: town.color }}>
                  {badge} {roundIndex + 1} / {rounds.length}
                </div>
                <div className="text-xl font-bold text-white">{title}</div>
                <div className="text-sm text-slate-400">{topicPack.title}</div>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4">
              <p className="text-base leading-relaxed text-slate-100">{body}</p>
            </div>
            {phase === "lesson" && (
              <>
                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    {activeStep.formula && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4">
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Key Formula</div>
                        <div className="font-mono text-lg text-emerald-300">{activeStep.formula}</div>
                      </div>
                    )}
                    {activeStep.definitions?.length > 0 && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4">
                        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Symbol Definitions</div>
                        <div className="space-y-2">
                          {activeStep.definitions.map((item) => (
                            <div key={item.symbol} className="flex items-start gap-3 rounded-xl bg-slate-950 px-3 py-2">
                              <div className="min-w-[56px] rounded-lg bg-slate-800 px-2 py-1 text-center font-mono text-sm font-bold text-cyan-300">
                                {item.symbol}
                              </div>
                              <div className="text-sm text-slate-300">{item.meaning}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeStep.mistake && (
                      <div className="rounded-2xl border border-amber-500/30 bg-slate-900 px-4 py-3 text-sm text-amber-200">
                        <span className="font-semibold">Common mistake:</span> {activeStep.mistake}
                      </div>
                    )}
                  </div>
                  <LessonVisual
                    visual={activeStep.visual}
                    formula={activeStep.formula}
                    definitions={activeStep.definitions}
                    color={town.color}
                  />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  Step {lessonStepIndex + 1} of {lessonSteps.length}. Learn the idea, name the symbols, work the example, then take the quiz.
                </div>
              </>
            )}
            {phase === "story" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                This is the narrative setup. Advance into the lesson cards, then start the quiz once the concept is clear.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4" style={{ borderColor: `${town.color}33` }}>
            <div className="text-xs text-slate-500">
              {phase === "story" ? "Story setup first." : `Lesson step ${lessonStepIndex + 1} of ${lessonSteps.length}.`}
            </div>
            <button
              onClick={() => {
                if (phase === "story") {
                  setPhase("lesson");
                  setLessonStepIndex(0);
                  return;
                }
                if (!lastLessonStep) {
                  setLessonStepIndex((current) => current + 1);
                  return;
                }
                setPhase("quiz");
              }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
              style={{ background: town.color }}
            >
              <ChevronRight className="h-4 w-4" />
              {phase === "story" ? "Continue to Lesson" : lastLessonStep ? "Start Quiz" : "Next Lesson Step"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timerWidth = `${(timer / 40) * 100}%`;
  const timerColor = timer > 20 ? "#10b981" : timer > 8 ? "#f59e0b" : "#ef4444";

  return (
    <div className="absolute inset-0 z-[2000] flex flex-col bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{town.marker}</div>
          <div>
            <div className="text-sm font-bold text-white">{town.name} Lesson Battle</div>
            <div className="text-xs text-slate-400">Round {roundIndex + 1} of {rounds.length}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <HealthPips label="Your HP" total={3} current={playerHp} color="#ef4444" />
          <HealthPips label="Enemy HP" total={rounds.length} current={enemyHp} color={town.color} square />
          <div className="text-right">
            <div className="mb-1 text-xs text-slate-400">Timer</div>
            <div className="text-sm font-bold" style={{ color: timerColor }}>
              {timer}s
            </div>
          </div>
        </div>
      </div>

      <div className="h-1 bg-slate-800">
        <div className="h-full transition-all duration-1000" style={{ width: timerWidth, background: timerColor }} />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-6">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: town.color }}>
          Quiz
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">{round.title}</h2>
        <p className="mb-6 text-lg leading-relaxed text-slate-100">{question.q}</p>

        <div className="mb-5 grid grid-cols-2 gap-3">
          {question.opts.map((option, index) => {
            let stateClass = "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800";
            if (locked) {
              if (index === question.a) {
                stateClass = "border-emerald-500 bg-emerald-950 text-emerald-300";
              } else if (index === selected) {
                stateClass = "border-red-500 bg-red-950 text-red-300";
              } else {
                stateClass = "border-slate-800 bg-slate-950 text-slate-600";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={locked}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${stateClass}`}
              >
                <span className="mr-2 text-xs opacity-60">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {showHint && (
          <div className="mb-3 rounded-lg border border-amber-500/30 bg-slate-900 px-4 py-3 text-sm text-amber-300">
            <span className="font-semibold">Hint:</span> {question.hint}
          </div>
        )}

        {locked && (
          <div className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300">
            <span className="font-semibold">Explanation:</span> {question.explain}
          </div>
        )}

        {!locked && !showHint && (
          <button
            onClick={() => setShowHint(true)}
            className="mt-3 flex items-center gap-1 self-start text-xs text-amber-400/80 transition-colors hover:text-amber-400"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Show hint
          </button>
        )}
      </div>
    </div>
  );
}

function HealthPips({ label, total, current, color, square = false }) {
  return (
    <div className="text-center">
      <div className="mb-1 text-xs text-slate-400">{label}</div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={square ? "h-3 w-3 rounded-sm" : "h-3.5 w-3.5 rounded-full border"}
            style={{
              background: index < current ? color : square ? "#1e293b" : "transparent",
              borderColor: square ? "transparent" : index < current ? color : "#475569",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function HintPanel({
  topic,
  nearTown,
  xp,
  level,
  victories,
  quests,
  progress,
  currentRegion,
  activeQuestId,
  onSelectQuest,
}) {
  const notes = REGION_NOTES[topic] ?? REGION_NOTES.intro;
  const topicTown = TOWNS.find((town) => town.topic === topic);
  const [tab, setTab] = useState("notes");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="border-b border-slate-700/50 px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Field Notes</span>
        </div>
        {topicTown && (
          <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: topicTown.color }}>
            <span>{topicTown.marker}</span>
            <span className="font-semibold">{topicTown.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-slate-700/50 px-3 py-3">
        <StatCard label="XP" value={xp} color="#facc15" />
        <StatCard label="Level" value={level} color="#a78bfa" />
        <StatCard label="Wins" value={victories} color="#4ade80" />
        <StatCard label="Towns" value={TOWNS.length} color="#60a5fa" />
      </div>

      <div className="grid grid-cols-3 gap-px border-b border-slate-700/50 bg-slate-800">
        {[
          ["notes", "Notes"],
          ["quests", "Quests"],
          ["book", "Book"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors"
            style={{
              background: tab === id ? "rgba(99,102,241,0.18)" : "transparent",
              color: tab === id ? "#c7d2fe" : "#64748b",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {nearTown && (
        <div
          className="mx-3 mt-3 rounded-lg border px-3 py-2.5 text-xs"
          style={{ borderColor: `${nearTown.color}55`, background: `${nearTown.color}20`, color: nearTown.color }}
        >
          <div className="mb-0.5 font-bold">
            {nearTown.marker} {nearTown.name}
          </div>
          <div className="text-[11px] opacity-80">{nearTown.description}</div>
          <div className="mt-1.5 font-semibold opacity-90">Press E or Enter to enter</div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tab === "notes" && (
          <>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {(topic === "intro" ? "General Science" : topicTown?.name) ?? "Notes"}
            </div>
            <div className="mb-3 rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-[11px] text-slate-300">
              <div className="mb-1 flex items-center gap-1.5 font-bold text-slate-200">
                <Compass className="h-3.5 w-3.5" />
                Current Region
              </div>
              <div className="text-slate-400">{currentRegion.label}</div>
              <div className="mt-1 text-slate-500">{currentRegion.hint}</div>
            </div>
            <div className="space-y-1.5">
              {notes.map((note, index) => (
                <div key={index} className="rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-slate-300">
                  {note}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "quests" && (
          <>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Quest Book</div>
            <div className="space-y-2">
              {quests.map((quest) => {
                const isSelected = activeQuestId === quest.id;
                return (
                  <button
                    key={quest.id}
                    onClick={() => quest.unlocked && onSelectQuest(quest.id)}
                    className="w-full rounded-lg border px-3 py-2 text-left transition-colors"
                    style={{
                      borderColor: isSelected ? "#818cf8" : "rgba(51,65,85,0.7)",
                      background: isSelected ? "rgba(99,102,241,0.18)" : "rgba(30,41,59,0.5)",
                      opacity: quest.unlocked ? 1 : 0.45,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold text-slate-200">{quest.title}</div>
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: quest.complete ? "#4ade80" : quest.unlocked ? "#cbd5e1" : "#64748b" }}
                      >
                        {quest.complete ? "Done" : quest.unlocked ? "Open" : "Locked"}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] leading-relaxed text-slate-400">{quest.detail}</div>
                    {quest.unlocked && (
                      <div className="mt-2 text-[10px] font-semibold text-indigo-300">
                        Click to track this quest
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === "book" && (
          <>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Adventure Log</div>
            <div className="space-y-2">
              <LogCard
                label="Visited Towns"
                value={
                  progress.visitedTowns.length
                    ? progress.visitedTowns.map((id) => getTownById(id)?.name ?? id).join(", ")
                    : "None yet"
                }
              />
              <LogCard
                label="Cleared Topics"
                value={progress.completedTopics.length ? progress.completedTopics.join(", ") : "None yet"}
              />
              <LogCard label="Random Encounters Won" value={String(progress.randomWins ?? 0)} />
            </div>
          </>
        )}
      </div>

      <div className="border-t border-slate-700/50 px-3 py-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Controls</div>
        <div className="space-y-0.5 text-[11px] text-slate-500">
          <div>
            <span className="text-slate-400">WASD / Arrows</span> - travel roads
          </div>
          <div>
            <span className="text-slate-400">E / Enter</span> - enter town
          </div>
          <div>
            <span className="text-slate-400">Quest Book</span> - click a quest to track it
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-lg bg-slate-800 px-3 py-2 text-center">
      <div className="text-lg font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function LogCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-xs text-slate-300">
      <div className="font-semibold text-slate-200">{label}</div>
      <div className="mt-1 text-slate-400">{value}</div>
    </div>
  );
}

export default function StemQuest() {
  const navigate = useNavigate();
  const [progress, setProgress] = useLocalStorage("stem-quest-progress", {
    playerPos: DEFAULT_START,
    homePos: DEFAULT_START,
    xp: 0,
    victories: 0,
    visitedTowns: ["academy"],
    completedTopics: [],
    randomWins: 0,
    locationSeeded: false,
    lastGeoSeedAt: null,
    activeQuestId: "starter-path",
    dismissedQuestIntro: false,
  });
  const [playerPos, setPlayerPos] = useState(progress.playerPos ?? progress.homePos ?? DEFAULT_START);
  const [homePos, setHomePos] = useState(progress.homePos ?? DEFAULT_START);
  const [nearTown, setNearTown] = useState(null);
  const [mode, setMode] = useState("world");
  const [activeTown, setActiveTown] = useState(null);
  const [hintTopic, setHintTopic] = useState("intro");
  const [xp, setXp] = useState(progress.xp ?? 0);
  const [victories, setVictories] = useState(progress.victories ?? 0);
  const [gameActive, setGameActive] = useState(true);
  const [geoStatus, setGeoStatus] = useState("Locating home...");
  const [mapStyle, setMapStyle] = useState("dark");

  const quests = useMemo(() => getQuestList(progress), [progress]);
  const activeQuest =
    quests.find((quest) => quest.id === progress.activeQuestId && quest.unlocked && !quest.complete) ??
    quests.find((quest) => quest.unlocked && !quest.complete) ??
    quests[0];

  const level = Math.floor(xp / 100) + 1;
  const currentTopic = getRegionTopic(playerPos, homePos);
  const currentRegion = useMemo(() => getRegionCard(currentTopic), [currentTopic]);
  const activeQuestTown = activeQuest?.targetTownId ? getTownById(activeQuest.targetTownId) : null;
  const activePath = activeQuestTown ? getRoadPath("academy", activeQuestTown.id) : [];

  useEffect(() => {
    setProgress((current) => ({
      ...current,
      playerPos,
      homePos,
      xp,
      victories,
    }));
  }, [homePos, playerPos, setProgress, victories, xp]);

  useEffect(() => {
    const firstUnlockedIncomplete = quests.find((quest) => quest.unlocked && !quest.complete);
    if (!firstUnlockedIncomplete) return;
    if (!progress.activeQuestId || (activeQuest && activeQuest.complete)) {
      setProgress((current) => ({ ...current, activeQuestId: firstUnlockedIncomplete.id }));
    }
  }, [activeQuest, progress.activeQuestId, quests, setProgress]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("Location unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const seeded = { lat: coords.latitude, lng: coords.longitude };
        setHomePos(seeded);
        setPlayerPos(seeded);
        setGeoStatus("Home anchored to your location");
        setProgress((current) => ({
          ...current,
          homePos: seeded,
          playerPos: seeded,
          locationSeeded: true,
          lastGeoSeedAt: Date.now(),
        }));
      },
      () => {
        setGeoStatus("Using saved home");
        setProgress((current) => ({ ...current, locationSeeded: true }));
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 },
    );
  }, [setProgress]);

  const handleNearTown = useCallback(
    (town) => {
      setNearTown(town);
      setHintTopic(town ? town.topic : getRegionTopic(playerPos, homePos));
    },
    [homePos, playerPos],
  );

  const handleEnterTown = useCallback(
    (town) => {
      if (!town) return;
      setActiveTown(town);
      setHintTopic(town.topic);
      setMode("dialogue");
      setGameActive(false);
      if (!town.encounter) {
        setProgress((current) => ({
          ...current,
          visitedTowns: current.visitedTowns.includes(town.id)
            ? current.visitedTowns
            : [...current.visitedTowns, town.id],
        }));
      }
    },
    [setProgress],
  );

  const handleEncounter = useCallback((town) => {
    setActiveTown(town);
    setHintTopic(town.topic);
    setMode("battle");
    setGameActive(false);
  }, []);

  const handleBattleComplete = useCallback(
    (won, earnedXp) => {
      setXp((current) => current + earnedXp);
      if (won) setVictories((current) => current + 1);

      setProgress((current) => ({
        ...current,
        xp: current.xp + earnedXp,
        victories: current.victories + (won ? 1 : 0),
        completedTopics:
          won &&
          activeTown?.topic &&
          activeTown.topic !== "intro" &&
          !current.completedTopics.includes(activeTown.topic)
            ? [...current.completedTopics, activeTown.topic]
            : current.completedTopics,
        randomWins: won && activeTown?.encounter ? current.randomWins + 1 : current.randomWins,
      }));

      setMode("world");
      setActiveTown(null);
      setGameActive(true);
    },
    [activeTown, setProgress],
  );

  const handleCloseDialogue = useCallback(() => {
    setMode("world");
    setActiveTown(null);
    setGameActive(true);
  }, []);

  const handleCloseGame = useCallback(() => {
    navigate("/games");
  }, [navigate]);

  const handleReturnHome = useCallback(() => {
    setPlayerPos(homePos);
    setHintTopic("intro");
  }, [homePos]);

  const handleSelectQuest = useCallback(
    (questId) => {
      setProgress((current) => ({ ...current, activeQuestId: questId }));
    },
    [setProgress],
  );

  const dismissQuestIntro = useCallback(() => {
    setProgress((current) => ({ ...current, dismissedQuestIntro: true }));
  }, [setProgress]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "stem-terrain-filter";
    style.textContent = ".terrain-tiles img { filter: brightness(0.55) saturate(0.65) hue-rotate(5deg); }";
    document.head.appendChild(style);
    return () => document.getElementById("stem-terrain-filter")?.remove();
  }, []);

  const tileUrl =
    mapStyle === "terrain"
      ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const tileAttribution =
    mapStyle === "terrain"
      ? 'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, style: © <a href="https://opentopomap.org">OpenTopoMap</a>'
      : '© <a href="https://carto.com/">CARTO</a>';

  return (
    <div style={{ display: "flex", height: "100vh", background: "#020617", overflow: "hidden" }}>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {!progress.dismissedQuestIntro && activeQuest && <StoryBanner quest={activeQuest} onDismiss={dismissQuestIntro} />}

        <MapContainer
          center={[homePos.lat, homePos.lng]}
          zoom={WORLD_ZOOM}
          zoomControl={false}
          style={{ height: "100vh", width: "100%", background: "#0f172a" }}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
          touchZoom={false}
        >
          <TileLayer url={tileUrl} attribution={tileAttribution} className={mapStyle === "terrain" ? "terrain-tiles" : undefined} />
          <MapSync pos={playerPos} zoom={WORLD_ZOOM} />
          <KeyboardController
            setPos={setPlayerPos}
            towns={TOWNS}
            onNearTown={handleNearTown}
            onEnterKey={handleEnterTown}
            onEncounter={handleEncounter}
            gameActive={gameActive && mode === "world"}
            origin={homePos}
            progress={progress}
          />

          {ROAD_GRAPH.map(([fromId, toId]) => {
            const path = getRoadPath(fromId, toId);
            const highlighted =
              activeQuestTown && (activeQuestTown.id === fromId || activeQuestTown.id === toId);
            return (
              <Polyline
                key={`${fromId}-${toId}`}
                positions={path}
                pathOptions={{
                  color: highlighted ? "#facc15" : "#94a3b8",
                  opacity: highlighted ? 0.85 : 0.45,
                  weight: highlighted ? 6 : 3,
                }}
              />
            );
          })}

          {WAYPOINTS.map((wp) => (
            <CircleMarker
              key={wp.id}
              center={[wp.lat, wp.lng]}
              radius={5}
              pathOptions={{ color: wp.color, fillColor: wp.color, fillOpacity: 0.75, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {wp.label}
              </Tooltip>
            </CircleMarker>
          ))}

          {TOWNS.map((town) => (
            <CircleMarker
              key={town.id}
              center={[town.lat, town.lng]}
              radius={nearTown?.id === town.id ? 14 : activeQuestTown?.id === town.id ? 12 : 10}
              pathOptions={{
                color: town.color,
                fillColor: town.color,
                fillOpacity: nearTown?.id === town.id ? 0.95 : activeQuestTown?.id === town.id ? 0.82 : 0.68,
                weight: nearTown?.id === town.id ? 3 : activeQuestTown?.id === town.id ? 2.5 : 2,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -8]}>
                {town.marker} {town.name}
              </Tooltip>
            </CircleMarker>
          ))}

          <CircleMarker
            center={[homePos.lat, homePos.lng]}
            radius={8}
            pathOptions={{ color: "#fff", fillColor: "#22c55e", fillOpacity: 1, weight: 2.5 }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              Home
            </Tooltip>
          </CircleMarker>
        </MapContainer>

        <div className="pointer-events-none absolute inset-0 z-[450] flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-full border-2 border-white/80 bg-indigo-500/95 px-3 py-2 text-xl shadow-2xl">🧙</div>
            <div className="rounded-full bg-slate-950/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-200 shadow-lg">
              You
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl border border-slate-700/60 bg-slate-950/95 p-3 text-xs text-slate-300 shadow-xl">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Compass</div>
          <div className="flex items-center gap-1.5"><span className="text-blue-400">N</span> Physics Keep</div>
          <div className="flex items-center gap-1.5"><span className="text-emerald-400">E</span> Alchemy Lab</div>
          <div className="flex items-center gap-1.5"><span className="text-purple-400">S</span> Math Citadel</div>
          <div className="flex items-center gap-1.5"><span className="text-amber-400">W</span> Engineers Haven</div>
        </div>

        <div className="absolute right-4 top-4 z-[500] flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-950/95 px-4 py-2 text-xs shadow-xl">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-yellow-400" />
            <span className="font-bold text-yellow-400">{xp} XP</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-bold text-purple-400">Lv. {level}</span>
          </div>
          {victories > 0 && (
            <>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold text-amber-400">{victories}</span>
              </div>
            </>
          )}
        </div>

        <div className="absolute left-1/2 top-4 z-[500] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/95 px-4 py-2 text-xs text-slate-300 shadow-xl">
          <MapIcon className="h-3.5 w-3.5 text-sky-400" />
          <span>{currentRegion.label}</span>
        </div>

        {activeQuest && (
        <div className="absolute bottom-20 left-1/2 z-[500] flex w-[min(760px,calc(100%-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-950 px-4 py-3 text-sm shadow-xl">
            <BookOpen className="h-4 w-4 shrink-0 text-indigo-300" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300">Tracked Quest</div>
              <div className="truncate font-semibold text-white">{activeQuest.title}</div>
              <div className="truncate text-xs text-slate-400">{activeQuest.detail}</div>
            </div>
            {activeQuestTown && (
              <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
                Destination: <span className="font-semibold text-white">{activeQuestTown.name}</span>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-2 text-xs text-slate-200 shadow-xl">
          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
          <span>{geoStatus}</span>
        </div>

        <div className="absolute bottom-4 right-32 z-[500] flex items-center gap-2">
          <button
            onClick={() => setMapStyle((current) => (current === "terrain" ? "dark" : "terrain"))}
            className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-200 shadow-xl transition-colors hover:bg-slate-900"
          >
            <Mountain className="h-3.5 w-3.5 text-sky-400" />
            {mapStyle === "terrain" ? "Dark Map" : "Terrain Map"}
          </button>
          <button
            onClick={handleReturnHome}
            className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-200 shadow-xl transition-colors hover:bg-slate-900"
          >
            <Home className="h-3.5 w-3.5 text-emerald-400" />
            Return Home
          </button>
        </div>

        <button
          onClick={handleCloseGame}
          className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-200 shadow-xl transition-colors hover:bg-slate-900"
        >
          <Home className="h-3.5 w-3.5" />
          Close
        </button>

        {mode === "dialogue" && activeTown && (
          <DialogueBox town={activeTown} onClose={handleCloseDialogue} onBattle={() => setMode("battle")} />
        )}

        {mode === "battle" && activeTown && <BattleScreen town={activeTown} onComplete={handleBattleComplete} />}
      </div>

      <div
        style={{
          width: 260,
          flexShrink: 0,
          background: "#0f172a",
          borderLeft: "1px solid rgba(51,65,85,0.55)",
          overflow: "hidden",
        }}
      >
        <HintPanel
          topic={hintTopic}
          nearTown={nearTown}
          xp={xp}
          level={level}
          victories={victories}
          quests={quests}
          progress={progress}
          currentRegion={currentRegion}
          activeQuestId={progress.activeQuestId}
          onSelectQuest={handleSelectQuest}
        />
      </div>
    </div>
  );
}
