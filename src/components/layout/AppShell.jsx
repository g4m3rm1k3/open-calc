import { useState, useEffect, useCallback } from "react";
import AuthButton from "../ui/AuthButton.jsx";
import {
  Link,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";
import { LESSON_MAP, CURRICULUM, COURSES } from "../../courses/index.js";
import SearchModal from "../ui/SearchModal.jsx";
import GlobalGrapher from "../../tools/grapher-2d/index.jsx";
import GlobalGrapher3D from "../../tools/grapher-3d/index.jsx";
import GlobalGrapherJSX from "../../tools/grapher-jsx/index.jsx";
import ScratchPad from "../../tools/scratchpad/index.jsx";
import { TOOLS, toolsByGroup } from "../../tools/toolLoader.js";
import { useSearchContext } from "../../context/SearchContext.jsx";
import GrapherContext from "../../context/GrapherContext.jsx";
import {
  Activity,
  Box,
  Settings2,
  PenLine,
  Smartphone,
  Layers,
  Search,
  Menu,
  Calculator,
  Terminal,
  PlayCircle,
} from "lucide-react";
import TICalc from "../../tools/calculator/index.jsx";
import SigmaCalc from "../../tools/sigma/index.jsx";
import PolyCalc from "../../tools/polynomial/index.jsx";
import LinearAlgebraCalc from "../../tools/linear-algebra/index.jsx";
import MatrixReducer from "../../tools/matrix-reducer/index.jsx";
import HelpModal from "../ui/HelpModal.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import TerminalHub from "../../tools/terminal-hub/TerminalHub.jsx";
import { ChatProvider } from "../../context/ChatContext.jsx";
import ChatPanel from "../tutor/ChatPanel.jsx";
import { motion, AnimatePresence } from "framer-motion";
import PhysicsPoolLab from "../../games/pool/PhysicsPoolLab.jsx";
import BasketballLab from "../../games/basketball/BasketballLab.jsx";
import MiniGolfGame from "../../games/golf/MiniGolfGame.jsx";
import FootballCalculus from "../../games/football/FootballCalculus.jsx";
import ChemistryPage from "../../labs/chemistry/ChemistryPage.jsx";
import PhysicsPage from "../../labs/physics/PhysicsPage.jsx";
import CodeMapBackground from "../backgrounds/CodeMapBackground.jsx";
import AlphaMascot from "../ui/AlphaMascot.jsx";
import GameRules from "../../games/GameRules.jsx";
import FullscreenButton from "../desktop/FullscreenButton.jsx";
import NavClock from "../desktop/NavClock.jsx";
import TutorPanel from "../tutor/TutorPanel.jsx";

function MobileLocationBadge() {
  const { chapterId, lessonSlug } = useParams();
  if (!chapterId) return null;

  const lesson = lessonSlug ? LESSON_MAP[`${chapterId}/${lessonSlug}`] : null;
  const chapter = CURRICULUM.find(
    (c) => String(c.number) === String(chapterId),
  );

  const label = lesson ? lesson.title : chapter ? chapter.title : null;

  if (!label) return null;

  const chapterLabel = chapter
    ? /^\d+$/.test(String(chapter.number))
      ? `Ch. ${chapter.number}`
      : chapter.title
    : null;

  return (
    <div className="lg:hidden flex items-center gap-1.5 min-w-0 max-w-[160px]">
      {chapterLabel && (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          {chapterLabel}
        </span>
      )}
      <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
    </div>
  );
}

function ToolButton({ tool }) {
  const Icon = tool.icon;
  return (
    <button
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("oc-open-tool", { detail: { tool: tool.eventTool } }),
        )
      }
      className={`p-1.5 rounded-md transition-all ${tool.colorClass ?? "text-slate-500 hover:bg-black/5 dark:hover:bg-white/8"}`}
      title={tool.label}
    >
      {Icon ? <Icon className="w-4 h-4" /> : <span className="text-sm leading-none font-medium">{tool.glyph}</span>}
    </button>
  );
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

function NavSep() {
  return <div className="w-px h-4 bg-black/[0.08] dark:bg-white/[0.08] mx-1.5 flex-shrink-0" />
}

function TopBar({ dark, toggleDark }) {
  const { openSearch } = useSearchContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-12 flex items-center px-4 gap-3 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border-b border-black/[0.07] dark:border-white/[0.07]">

      {/* LEFT — logo + app name + auth */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to="/" className="flex items-center gap-1.5 group select-none" aria-label="Home">
          <span className="text-indigo-600 dark:text-indigo-400 font-black text-[22px] leading-none tracking-tight group-hover:text-indigo-500 transition-colors">
            ∂
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 hidden sm:block tracking-tight">
            UpSkillOS
          </span>
        </Link>
        <NavSep />
        <AuthButton />
      </div>

      {/* CENTER — nav links */}
      <div className="flex-1 flex items-center gap-1">
        <Link
          to="/lesson-builder"
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 px-2.5 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors"
        >
          🔨 Lesson Builder
        </Link>
        <Link
          to="/viz-builder"
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 px-2.5 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors"
        >
          🔭 Viz Builder
        </Link>
      </div>

      {/* RIGHT — tools + utilities + clock */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {toolsByGroup("math").map((tool) => <ToolButton key={tool.key} tool={tool} />)}
        {toolsByGroup("engine").map((tool) => <ToolButton key={tool.key} tool={tool} />)}

        <NavSep />

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("oc-toggle-video"))}
          className="p-1.5 rounded-md text-slate-500 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          title="Video Player"
        >
          <PlayCircle className="w-4 h-4" />
        </button>
        <button
          onClick={openSearch}
          className="p-1.5 rounded-md text-slate-500 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={toggleDark}
          className="p-1.5 rounded-md text-slate-500 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors"
          title="Toggle theme"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <FullscreenButton className="p-1.5 rounded-md text-slate-500 hover:bg-black/5 dark:hover:bg-white/[0.08]" />

        <NavSep />

        <NavClock />
      </div>
    </header>
  );
}

function WelcomeModal() {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem("oc-welcome-seen"),
  );

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem("oc-welcome-seen", "1");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
            ∂
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to UpSkillOS!
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Concepts here are taught in multiple ways — visually, algebraically,
          and conceptually. If a specific interactive or explanation doesn't
          click for you right away, don't worry! Keep scrolling. You will likely
          find an analogy or visual that perfectly matches how your brain works.
        </p>
        <button
          onClick={dismiss}
          className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();
  const isUniversalCalcRoute = location.pathname.startsWith("/universal-calc");
  const isChemistryRoute = location.pathname.startsWith("/chemistry");
  const isOpenMatRoute = location.pathname.startsWith("/openmat");
  const isCNCSimRoute = location.pathname.startsWith("/cnc-sim");
  const isCadProRoute = location.pathname.startsWith("/cad-pro");
  const isDocsRoute = location.pathname.startsWith("/studio") || location.pathname.startsWith("/docs");
  const isHealthRoute = location.pathname.startsWith("/health");
  const isBrainRoute = location.pathname.startsWith("/brain");
  const isFiveAxisRoute = location.pathname.startsWith("/five-axis");
  const isCodeLensRoute = location.pathname.startsWith("/codelens");
  const isLearnRoute = location.pathname.startsWith("/learn") || location.pathname.startsWith("/web-learn");
  const isDesktopRoute = location.pathname === '/';
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isLessonRoute = pathParts[0] === 'chapter' && pathParts.length >= 3;

  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  // Restore dev mode across page refreshes
  useEffect(() => {
    if (localStorage.getItem("oc-dev-mode")) {
      document.documentElement.classList.add("dev-mode");
    }
  }, []);
  const [graphOpen, setGraphOpen] = useState(false);
  const [graph3DOpen, setGraph3DOpen] = useState(false);
  const [graphJSXOpen, setGraphJSXOpen] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [sigmaOpen, setSigmaOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);
  const [chemOpen, setChemOpen] = useState(false);
  const [physicsOpen, setPhysicsOpen] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [golfOpen, setGolfOpen] = useState(false);
  const [footballOpen, setFootballOpen] = useState(false);
  const [polyOpen, setPolyOpen] = useState(false);
  const [laOpen, setLAOpen] = useState(false);
  const [matrixReducerOpen, setMatrixReducerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [gameRulesOpen, setGameRulesOpen] = useState(false);
  const [scratchSnap, setScratchSnap] = useState(null);
  const [scratchSnapW, setScratchSnapW] = useState(680);
  const handleScratchSnap = useCallback((side, w) => {
    setScratchSnap(side);
    if (w) setScratchSnapW(w);
  }, []);
  useEffect(() => {
    if (!scratchOpen) setScratchSnap(null);
  }, [scratchOpen]);
  useEffect(() => {
    document.body.dataset.chatOpen = chatOpen ? '1' : '0';
    return () => { delete document.body.dataset.chatOpen; };
  }, [chatOpen]);
  const closeAllTools = useCallback(() => {
    setGraphOpen(false);
    setGraph3DOpen(false);
    setGraphJSXOpen(false);
    setScratchOpen(false);
    setCalcOpen(false);
    setSigmaOpen(false);
    setPolyOpen(false);
    setLAOpen(false);
    setTerminalOpen(false);
    setPoolOpen(false);
    setChemOpen(false);
    setPhysicsOpen(false);
    setBasketOpen(false);
    setGolfOpen(false);
    setFootballOpen(false);
  }, []);
  const [grapherLaunchConfig, setGrapherLaunchConfig] = useState(null);
  const { openSearch } = useSearchContext();

  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("oc-theme", isDark ? "dark" : "light");
    setDark(isDark);
  };

  // openGrapher — called by any lesson/component via GrapherContext
  const openGrapher = useCallback((config) => {
    const mode = config?.mode ?? "pro";
    setGrapherLaunchConfig(config);
    setGraphOpen(false);
    setGraph3DOpen(false);
    setGraphJSXOpen(false);
    if (mode === "2d") setGraphOpen(true);
    else if (mode === "3d") setGraph3DOpen(true);
    else setGraphJSXOpen(true); // 'pro' default
  }, []);

  useEffect(() => {
    const handler = () => setChatOpen(c => !c);
    window.addEventListener('oc-toggle-chat', handler);
    return () => window.removeEventListener('oc-toggle-chat', handler);
  }, []);

  useEffect(() => {
    const handler = () => setGameRulesOpen(g => !g);
    window.addEventListener('oc-game-rules', handler);
    return () => window.removeEventListener('oc-game-rules', handler);
  }, []);

  useEffect(() => {
    const openScratch = () => setScratchOpen(true);
    window.addEventListener("oc-open-scratchpad", openScratch);
    return () => window.removeEventListener("oc-open-scratchpad", openScratch);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { tool } = e.detail ?? {};
      if (tool === "calculator") setCalcOpen(true);
      else if (tool === "sigma") setSigmaOpen(true);
      else if (tool === "polynomial") setPolyOpen(true);
      else if (tool === "linear-algebra") setLAOpen(true);
      else if (tool === "python" || tool === "terminal") {
        setTerminalOpen(true);
        if (tool === "python") {
          window.dispatchEvent(new CustomEvent("oc-terminal-open-tab", { detail: { type: 'python' } }));
        }
      }
      else if (tool === "javascript") setTerminalOpen(true);
      else if (tool === "scratchpad") setScratchOpen(true);
      else if (tool === "grapher") setGraphOpen(true);
      else if (tool === "grapher-3d") setGraph3DOpen(true);
      else if (tool === "jsxgraph") setGraphJSXOpen(true);
      else if (tool === "matrix-reducer") setMatrixReducerOpen(true);
    };
    window.addEventListener("oc-open-tool", handler);
    return () => window.removeEventListener("oc-open-tool", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { game } = e.detail ?? {};
      if (game === "basketball") setBasketOpen(true);
      else if (game === "pool") setPoolOpen(true);
      else if (game === "golf") setGolfOpen(true);
      else if (game === "football") setFootballOpen(true);
      else if (game === "chemistry") setChemOpen(true);
      else if (game === "physics") setPhysicsOpen(true);
    };
    window.addEventListener("oc-open-game", handler);
    return () => window.removeEventListener("oc-open-game", handler);
  }, []);

  if (
    isOpenMatRoute ||
    isCNCSimRoute ||
    isCadProRoute ||
    isDocsRoute ||
    isFiveAxisRoute ||
    isCodeLensRoute ||
    isLearnRoute
  ) {
    return (
      <GrapherContext.Provider value={{ openGrapher }}>
        <div
          className={`h-screen overflow-hidden ${isCadProRoute || isFiveAxisRoute || isCodeLensRoute || isLearnRoute ? "bg-[#08111f]" : "bg-white dark:bg-slate-950"}`}
        >
          <div className="h-full w-full overflow-hidden">
            {children ?? <Outlet />}
          </div>
          <SearchModal />
          <GlobalGrapher
            isOpen={graphOpen}
            launchConfig={graphOpen ? grapherLaunchConfig : null}
            onClose={() => {
              setGraphOpen(false);
              setGrapherLaunchConfig(null);
            }}
            onSwitchTo3D={() => {
              setGraphOpen(false);
              setGraph3DOpen(true);
            }}
            onSwitchToJSX={() => {
              setGraphOpen(false);
              setGraphJSXOpen(true);
            }}
          />
          <GlobalGrapher3D
            isOpen={graph3DOpen}
            launchConfig={graph3DOpen ? grapherLaunchConfig : null}
            onClose={() => {
              setGraph3DOpen(false);
              setGrapherLaunchConfig(null);
            }}
            onSwitchTo2D={() => {
              setGraph3DOpen(false);
              setGraphOpen(true);
            }}
            onSwitchToJSX={() => {
              setGraph3DOpen(false);
              setGraphJSXOpen(true);
            }}
          />
          <GlobalGrapherJSX
            isOpen={graphJSXOpen}
            launchConfig={graphJSXOpen ? grapherLaunchConfig : null}
            onClose={() => {
              setGraphJSXOpen(false);
              setGrapherLaunchConfig(null);
            }}
            onSwitchTo2D={() => {
              setGraphJSXOpen(false);
              setGraphOpen(true);
            }}
            onSwitchTo3D={() => {
              setGraphJSXOpen(false);
              setGraph3DOpen(true);
            }}
          />
          <ScratchPad
            isOpen={scratchOpen}
            onClose={() => setScratchOpen(false)}
            onSnap={handleScratchSnap}
          />
          {calcOpen && <TICalc onClose={() => setCalcOpen(false)} />}
          {sigmaOpen && <SigmaCalc onClose={() => setSigmaOpen(false)} />}
          {polyOpen && <PolyCalc onClose={() => setPolyOpen(false)} />}
          {laOpen && <LinearAlgebraCalc onClose={() => setLAOpen(false)} />}
          {matrixReducerOpen && <MatrixReducer onBack={() => setMatrixReducerOpen(false)} />}
          <TerminalHub
            isOpen={terminalOpen}
            onClose={() => setTerminalOpen(false)}
          />
        </div>
      </GrapherContext.Provider>
    );
  }

  return (
    <ChatProvider>
      <GrapherContext.Provider value={{ openGrapher }}>
        <div className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${isLessonRoute ? "bg-white dark:bg-slate-950" : ""}`}>
          {isDesktopRoute && <CodeMapBackground dark={dark} />}
          <TopBar dark={dark} toggleDark={toggleDark} />

          {/* Mobile tools backdrop */}
          {(graphOpen || graph3DOpen || graphJSXOpen || mobileToolsOpen) && (
            <div
              className="fixed inset-0 z-[45] bg-black/30 backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent"
              onClick={() => {
                setMobileToolsOpen(false);
                if (window.innerWidth < 1024) {
                  setGraphOpen(false);
                  setGraph3DOpen(false);
                  setGraphJSXOpen(false);
                  setTerminalOpen(false);
                }
              }}
            />
          )}

          {/* Main content */}
          <main
            className={`transition-[padding] duration-500 ease-in-out pb-20 lg:pb-11 ${isChemistryRoute ? "h-screen overflow-hidden" : isDesktopRoute ? "h-screen" : "min-h-screen"} ${isHealthRoute || isBrainRoute ? "bg-white dark:bg-slate-950" : ""} lg:pl-0 pt-12`}
            style={{
              paddingRight: chatOpen
                ? (scratchSnap === "right" ? `${scratchSnapW}px` : "var(--chat-width, 380px)")
                : scratchSnap === "right" ? `${scratchSnapW}px` : undefined,
              ...(scratchSnap === "left"
                ? { paddingLeft: `${12 + scratchSnapW}px` }
                : {}),
            }}
          >
            <div
              className={
                isDesktopRoute
                  ? "w-full h-[calc(100vh-48px-44px)]"
                  : isChemistryRoute
                    ? "w-full h-[calc(100vh-48px)] flex flex-col overflow-hidden"
                    : isUniversalCalcRoute
                      ? "max-w-[min(98vw,2800px)] mx-auto px-2 sm:px-3 lg:px-4 py-8"
                      : `max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-all duration-500`
              }
            >
              {children ?? <Outlet />}
            </div>
          </main>

          {/* Mobile Tools Menu Hub */}
          <AnimatePresence>
            {mobileToolsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="lg:hidden fixed bottom-20 left-4 right-4 z-[55] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-black/5 dark:ring-white/5"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Math Tools Hub
                  </h3>
                  <button
                    onClick={() => setMobileToolsOpen(false)}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      closeAllTools();
                      setGraphOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      2D Grapher
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      closeAllTools();
                      setGraph3DOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                      <Box className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      3D Plotter
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      closeAllTools();
                      setGraphJSXOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                      <Settings2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Pro Tools
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      closeAllTools();
                      setScratchOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-800/50 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-800/50 flex items-center justify-center">
                      <PenLine className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Scratchpad
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      closeAllTools();
                      setCalcOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 border border-violet-100 dark:border-violet-800/50 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-800/50 flex items-center justify-center">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      TI Calc
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      closeAllTools();
                      setTerminalOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Terminal
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      closeAllTools();
                      window.dispatchEvent(new CustomEvent("oc-toggle-video"));
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 border border-sky-100 dark:border-sky-800/50 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-800/50 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Video Player
                    </span>
                  </motion.button>
                </div>

                {/* Quick stats / tips? */}
                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap overflow-hidden">
                  <span className="w-1 h-1 rounded-full bg-brand-500 animate-pulse" />
                  Tap tools to open fullscreen overlays. Close via backdrop.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <MobileBottomNav
            onSearchOpen={openSearch}
            onToolsToggle={() => setMobileToolsOpen((o) => !o)}
          />

          {calcOpen && <TICalc onClose={() => setCalcOpen(false)} />}
          {sigmaOpen && <SigmaCalc onClose={() => setSigmaOpen(false)} />}
          {polyOpen && <PolyCalc onClose={() => setPolyOpen(false)} />}
          {laOpen && <LinearAlgebraCalc onClose={() => setLAOpen(false)} />}
          {matrixReducerOpen && <MatrixReducer onBack={() => setMatrixReducerOpen(false)} />}
          <WelcomeModal />
          <SearchModal />
          <GlobalGrapher
            isOpen={graphOpen}
            launchConfig={graphOpen ? grapherLaunchConfig : null}
            onClose={() => {
              setGraphOpen(false);
              setGrapherLaunchConfig(null);
            }}
            onSwitchTo3D={() => {
              setGraphOpen(false);
              setGraph3DOpen(true);
            }}
            onSwitchToJSX={() => {
              setGraphOpen(false);
              setGraphJSXOpen(true);
            }}
          />
          <GlobalGrapher3D
            isOpen={graph3DOpen}
            launchConfig={graph3DOpen ? grapherLaunchConfig : null}
            onClose={() => {
              setGraph3DOpen(false);
              setGrapherLaunchConfig(null);
            }}
            onSwitchTo2D={() => {
              setGraph3DOpen(false);
              setGraphOpen(true);
            }}
            onSwitchToJSX={() => {
              setGraph3DOpen(false);
              setGraphJSXOpen(true);
            }}
          />
          <GlobalGrapherJSX
            isOpen={graphJSXOpen}
            launchConfig={graphJSXOpen ? grapherLaunchConfig : null}
            onClose={() => {
              setGraphJSXOpen(false);
              setGrapherLaunchConfig(null);
            }}
            onSwitchTo2D={() => {
              setGraphJSXOpen(false);
              setGraphOpen(true);
            }}
            onSwitchTo3D={() => {
              setGraphJSXOpen(false);
              setGraph3DOpen(true);
            }}
          />
          <ScratchPad
            isOpen={scratchOpen}
            onClose={() => {
              setScratchOpen(false);
              setScratchSnap(null);
            }}
            onSnap={handleScratchSnap}
          />
          <TerminalHub
            isOpen={terminalOpen}
            onClose={() => setTerminalOpen(false)}
          />
          <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
          {gameRulesOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 300 }}>
              <GameRules onClose={() => setGameRulesOpen(false)} />
            </div>
          )}
          {poolOpen && <PhysicsPoolLab onClose={() => setPoolOpen(false)} />}
          {basketOpen && <BasketballLab onClose={() => setBasketOpen(false)} />}
          {golfOpen && <MiniGolfGame onClose={() => setGolfOpen(false)} />}
          <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
          <TutorPanel lesson={null} />


          {footballOpen && (
            <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950 overflow-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏈</span>
                  <span className="font-bold text-white text-sm">
                    Football Calculus
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    Integration · Optimization · Related Rates
                  </span>
                </div>
                <button
                  onClick={() => setFootballOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <FootballCalculus />
              </div>
            </div>
          )}
          {chemOpen && (
            <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
              <ChemistryPage onClose={() => setChemOpen(false)} />
            </div>
          )}
          {physicsOpen && (
            <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
              <PhysicsPage onClose={() => setPhysicsOpen(false)} />
            </div>
          )}

          <AlphaMascot />
        </div>
      </GrapherContext.Provider>
    </ChatProvider>
  );
}
