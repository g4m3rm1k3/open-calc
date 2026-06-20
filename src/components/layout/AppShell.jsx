import { useState, useEffect, useCallback } from "react";
import AuthButton from "../ui/AuthButton.jsx";
import {
  Link,
  Outlet,
  useLocation,
  useParams,
  useNavigate,
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
  Sun,
  Moon
} from "lucide-react";
import TICalc from "../../tools/calculator/index.jsx";
import SigmaCalc from "../../tools/sigma/index.jsx";
import PolyCalc from "../../tools/polynomial/index.jsx";
import LinearAlgebraCalc from "../../tools/linear-algebra/index.jsx";
import MatrixReducer from "../../tools/matrix-reducer/index.jsx";
import HelpModal from "../ui/HelpModal.jsx";
import ReportBugButton from "../ui/ReportBugButton.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import TerminalHub from "../../tools/terminal-hub/TerminalHub.jsx";
import CompassQuickPanel from "../../features/compass/CompassQuickPanel.jsx";
import GlobalCompassAgent from "../../features/compass/GlobalCompassAgent.jsx";
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
import NodePanel from "../backgrounds/NodePanel.jsx";

export const meta = {
  title: 'App Shell',
  description: 'Wraps every page with the top bar, sidebar, tools, background graph, and all global overlays. Pages only render content — the shell owns all layout.',
  concept: 'Layout Composition',
  conceptDetail: 'Separating shared chrome (nav, modals, overlays) from page content means pages stay focused. The shell can change structure without touching any page component.',
}
import AlphaMascot from "../ui/AlphaMascot.jsx";
import GameRules from "../../games/GameRules.jsx";
import FullscreenButton from "../desktop/FullscreenButton.jsx";
import NavClock from "../desktop/NavClock.jsx";
import TutorPanel from "../tutor/TutorPanel.jsx";
import MobileHomePage from "./MobileHomePage.jsx";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import WhatsNewModal from "../ui/WhatsNewModal.jsx";

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
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("oc-open-tool", { detail: { tool: tool.eventTool } }),
        )
      }
      className={`p-1.5 rounded-xl transition-colors ${tool.colorClass ?? "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
      title={tool.label}
    >
      {Icon ? <Icon className="w-4 h-4" /> : <span className="text-sm leading-none font-medium">{tool.glyph}</span>}
    </motion.button>
  );
}

function NavSep({ className = "" }) {
  return <div className={`w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1.5 flex-shrink-0 rounded-full ${className}`} />
}

function TopBar({ dark, toggleDark }) {
  const { openSearch } = useSearchContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-[52px] flex items-center px-4 gap-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">

      {/* LEFT — logo + app name + auth */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 group select-none" aria-label="Home">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-sm group-hover:shadow-brand-500/25 group-hover:scale-105 transition-all duration-300">
            <span className="text-white font-black text-xl leading-none tracking-tight">
              ∂
            </span>
          </div>
          <span className="text-[15px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 hidden sm:block tracking-tight">
            UpSkillOS
          </span>
        </Link>
        <NavSep />
        <AuthButton />
      </div>

      {/* CENTER — nav links */}
      <div className="flex-1 flex items-center gap-1">
      </div>

      {/* RIGHT — tools + utilities + clock */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Math/engine tool shortcuts and video/fullscreen are desktop-only —
            on mobile they'd overflow the bar, and Search/Tools already cover
            the same ground via the bottom nav. */}
        <div className="hidden lg:flex items-center gap-1">
          {toolsByGroup("math").map((tool) => <ToolButton key={tool.key} tool={tool} />)}
          {toolsByGroup("engine").map((tool) => <ToolButton key={tool.key} tool={tool} />)}
        </div>

        <NavSep className="hidden lg:block" />

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.dispatchEvent(new CustomEvent("oc-toggle-video"))}
          className="hidden lg:inline-flex p-1.5 rounded-xl text-slate-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          title="Video Player"
        >
          <PlayCircle className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={openSearch}
          className="hidden lg:inline-flex p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>
        <div className="hidden lg:block hover:scale-110 active:scale-95 transition-transform">
          <FullscreenButton className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" />
        </div>

        <NavSep className="hidden lg:block" />

        <NavClock />
      </div>
    </header>
  );
}

// First-visit onboarding used to be a standalone modal here. It's now hosted
// by Delta (the AI tutor) instead — see TourContext/TourSpotlight, mounted in
// App.jsx — so it can point at the real Taskbar/nav buttons it's describing
// instead of just describing them in a floating card.

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
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
  const isFullPageToolRoute = location.pathname.startsWith("/notebook-lab") ||
    location.pathname.startsWith("/viz-builder") ||
    location.pathname.startsWith("/playground");
  const isScrollableFullPageRoute = location.pathname.startsWith("/lesson-builder") ||
    location.pathname.startsWith("/calendar");
  const isDesktopRoute = location.pathname === '/';
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isLessonRoute = pathParts[0] === 'chapter' && pathParts.length >= 3;
  const isMobile = useIsMobile();
  const isMobileHome = isDesktopRoute && isMobile;

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
  const [selectedNode, setSelectedNode] = useState(null);
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
  const [compassQuickOpen, setCompassQuickOpen] = useState(false);
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
      else if (tool === "compass-quick") setCompassQuickOpen(true);
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
          <div className="h-[calc(100vh-44px)] w-full overflow-hidden">
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
          {compassQuickOpen && <CompassQuickPanel onClose={() => setCompassQuickOpen(false)} />}
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
          {isDesktopRoute && !isMobile && (
            <CodeMapBackground
              dark={dark}
              onNodeClick={node => setSelectedNode(node)}
            />
          )}
          {isDesktopRoute && !isMobile && selectedNode && (
            <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}
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
            className={`transition-[padding] duration-500 ease-in-out ${isChemistryRoute || isFullPageToolRoute || isScrollableFullPageRoute ? "flex flex-col h-[calc(100vh-44px)] overflow-hidden" : isDesktopRoute && !isMobile ? "h-screen" : "min-h-screen pb-28 lg:pb-11"} ${isHealthRoute || isBrainRoute ? "bg-white dark:bg-slate-950" : ""} lg:pl-0 pt-12`}
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
                isMobileHome
                  ? "w-full"
                  : isDesktopRoute
                  ? "w-full h-[calc(100vh-48px-44px)]"
                  : isChemistryRoute || isFullPageToolRoute
                    ? "flex-1 min-h-0 w-full flex flex-col overflow-hidden"
                    : isScrollableFullPageRoute
                      ? "flex-1 min-h-0 w-full overflow-y-auto"
                      : isUniversalCalcRoute
                      ? "max-w-[min(98vw,2800px)] mx-auto px-2 sm:px-3 lg:px-4 py-8"
                      : `max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-all duration-500`
              }
            >
              {isMobileHome ? <MobileHomePage /> : (children ?? <Outlet />)}
            </div>
          </main>

          {/* Mobile Tools Menu Hub */}
          <AnimatePresence>
            {mobileToolsOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed bottom-[88px] left-4 right-4 z-[55] bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[2rem] p-6 shadow-[0_10px_50px_rgba(0,0,0,0.25)] border border-white/50 dark:border-white/10 overflow-hidden"
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Math Tools</h3>
                      <p className="text-[11px] font-medium text-slate-500">Quick access to interactive apps</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileToolsOpen(false)}
                    className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <Smartphone className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10 max-h-[50vh] overflow-y-auto pr-1 pb-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeAllTools();
                      setGraphOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-indigo-500/20 flex items-center justify-center shadow-sm">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">2D Grapher</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeAllTools();
                      setGraph3DOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-500/20 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-amber-500/20 flex items-center justify-center shadow-sm">
                      <Box className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">3D Plotter</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeAllTools();
                      setGraphJSXOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-emerald-500/20 flex items-center justify-center shadow-sm">
                      <Settings2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">Pro Tools</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeAllTools();
                      setScratchOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-500/20 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-rose-500/20 flex items-center justify-center shadow-sm">
                      <PenLine className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">Scratchpad</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeAllTools();
                      setCalcOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-500/20 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-violet-500/20 flex items-center justify-center shadow-sm">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">TI Calc</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeAllTools();
                      setTerminalOpen(true);
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-slate-700/50 flex items-center justify-center shadow-sm">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">Terminal</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeAllTools();
                      window.dispatchEvent(new CustomEvent("oc-toggle-video"));
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-500/20 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-sky-500/20 flex items-center justify-center shadow-sm">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">Video Player</span>
                  </motion.button>

                  <motion.button
                    data-tour="stem-tutor-mobile"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("oc-toggle-tutor"));
                      setMobileToolsOpen(false);
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-emerald-500/20 flex items-center justify-center shadow-sm">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">Delta (AI Tutor)</span>
                  </motion.button>

                  <motion.button
                    data-tour="lesson-builder-mobile"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setMobileToolsOpen(false);
                      navigate("/lesson-builder");
                    }}
                    className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-500/20 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-amber-500/20 flex items-center justify-center shadow-sm">
                      <span className="text-lg leading-none">🔨</span>
                    </div>
                    <span className="text-xs font-bold tracking-wide">Lesson Builder</span>
                  </motion.button>

                  <ReportBugButton
                    tile
                    data-tour="report-bug-mobile"
                    onOpen={() => setMobileToolsOpen(false)}
                  />
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
          {compassQuickOpen && <CompassQuickPanel onClose={() => setCompassQuickOpen(false)} />}
          <WhatsNewModal />
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

          <GlobalCompassAgent />
          <AlphaMascot />
        </div>
      </GrapherContext.Provider>
    </ChatProvider>
  );
}
