import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import AuthButton from "../ui/AuthButton.jsx";
import {
  Link,
  Outlet,
  useLocation,
  useParams,
  useNavigate,
} from "react-router-dom";
import { LESSON_MAP, CURRICULUM, COURSES } from "../../courses/index.js";
const SearchModal = lazy(() => import("../ui/SearchModal.jsx"));
const GlobalGrapher = lazy(() => import("../../tools/grapher-2d/index.jsx"));
const GlobalGrapher3D = lazy(() => import("../../tools/grapher-3d/index.jsx"));
const GlobalGrapherJSX = lazy(() => import("../../tools/grapher-jsx/index.jsx"));
const ScratchPad = lazy(() => import("../../tools/scratchpad/index.jsx"));
import { TOOLS, toolsByGroup } from "../../tools/toolLoader.js";
import { useSearchContext } from "../../context/SearchContext.jsx";
import GrapherContext from "../../context/GrapherContext.jsx";
import {
  Search,
  PlayCircle,
  Sun,
  Moon,
} from "lucide-react";
const MatrixReducer = lazy(() => import("../../tools/matrix-reducer/index.jsx"));
const MathOS = lazy(() => import("../../tools/math-os/MathOS.jsx"));
const TICalc = lazy(() => import("../../tools/calculator/index.jsx"));
const SigmaCalc = lazy(() => import("../../tools/sigma/index.jsx"));
const PolyCalc = lazy(() => import("../../tools/polynomial/index.jsx"));
const LinearAlgebraCalc = lazy(() => import("../../tools/linear-algebra/index.jsx"));
const HelpModal = lazy(() => import("../ui/HelpModal.jsx"));
const TerminalHub = lazy(() => import("../../tools/terminal-hub/TerminalHub.jsx"));
import CompassQuickPanel from "../../features/compass/CompassQuickPanel.tsx";
import MontyAmbientNudge from "../../features/compass/components/MontyAmbientNudge.tsx";
import { ChatProvider } from "../../context/ChatContext.jsx";
const ChatPanel = lazy(() => import("../tutor/ChatPanel.jsx"));
const PhysicsPoolLab = lazy(() => import("../../games/pool/PhysicsPoolLab.jsx"));
const BasketballLab = lazy(() => import("../../games/basketball/BasketballLab.jsx"));
const MiniGolfGame = lazy(() => import("../../games/golf/MiniGolfGame.jsx"));
const FootballCalculus = lazy(() => import("../../games/football/FootballCalculus.jsx"));
const ChemistryPage = lazy(() => import("../../labs/chemistry/ChemistryPage.jsx"));
const PhysicsPage = lazy(() => import("../../labs/physics/PhysicsPage.jsx"));
import CodeMapBackground from "../backgrounds/CodeMapBackground.jsx";
import NodePanel from "../backgrounds/NodePanel.jsx";

export const meta = {
  title: 'App Shell',
  description: 'Wraps every page with the top bar, sidebar, tools, background graph, and all global overlays. Pages only render content — the shell owns all layout.',
  concept: 'Layout Composition',
  conceptDetail: 'Separating shared chrome (nav, modals, overlays) from page content means pages stay focused. The shell can change structure without touching any page component.',
}
import AlphaMascot from "../ui/AlphaMascot.jsx";
const GameRules = lazy(() => import("../../games/GameRules.jsx"));
import FullscreenButton from "../desktop/FullscreenButton.jsx";
import NavClock from "../desktop/NavClock.jsx";
const TutorPanel = lazy(() => import("../tutor/TutorPanel.jsx"));
import MobileHomePage from "./MobileHomePage.jsx";
import { useIsMobile } from "../../hooks/useIsMobile.js";
const WhatsNewModal = lazy(() => import("../ui/WhatsNewModal.jsx"));
import { useGlobalTheme } from "../../context/ThemeContext.jsx";
import ThemePicker from "../ui/ThemePicker.jsx";

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
      className={`nav-tool-btn ${tool.colorClass ?? "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
      title={tool.label}
    >
      {Icon ? <Icon className="w-[18px] h-[18px]" /> : <span className="text-[13px] leading-none font-semibold">{tool.glyph}</span>}
    </button>
  );
}

function NavSep({ className = "" }) {
  return <div className={`w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1.5 flex-shrink-0 rounded-full ${className}`} />
}

function TopBar() {
  const { openSearch } = useSearchContext();
  const location = useLocation();
  const isCompassActive = location.pathname.startsWith('/compass');

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
        <Link
          to="/blog"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Blog
        </Link>
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

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("oc-toggle-video"))}
          className="hidden lg:flex nav-tool-btn text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
          title="Video Player"
        >
          <PlayCircle className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={openSearch}
          className="hidden lg:flex nav-tool-btn text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          title="Search"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>

        <ThemePicker />

        <div className="hidden lg:block">
          <FullscreenButton className="nav-tool-btn text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 [&>svg]:w-[18px] [&>svg]:h-[18px]" />
        </div>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('oc-toggle-help'))}
          className="hidden lg:flex nav-tool-btn text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          title="Contributor Docs"
        >
          <span className="text-[15px] font-black leading-none">?</span>
        </button>

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
    location.pathname.startsWith("/playground") ||
    location.pathname.startsWith("/lesson-builder") ||
    location.pathname.startsWith("/la-explorer");
  const isScrollableFullPageRoute = location.pathname.startsWith("/calendar") ||
    location.pathname.startsWith("/blog");
  const isFullWidthRoute = location.pathname.startsWith("/rpg-workout") ||
    location.pathname.startsWith("/brain") ||
    location.pathname.startsWith("/health");
  const isDesktopRoute = location.pathname === '/';
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isLessonRoute = pathParts[0] === 'chapter' && pathParts.length >= 3;
  const isMobile = useIsMobile();
  const isMobileHome = isDesktopRoute && isMobile;

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
  const [scratchOpenFile, setScratchOpenFile] = useState(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);
  const [chemOpen, setChemOpen] = useState(false);
  const [physicsOpen, setPhysicsOpen] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [golfOpen, setGolfOpen] = useState(false);
  const [footballOpen, setFootballOpen] = useState(false);
  const [matrixReducerOpen, setMatrixReducerOpen] = useState(false);
  const [compassQuickOpen, setCompassQuickOpen] = useState(false);
  const [mathOsOpen, setMathOsOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [sigmaOpen, setSigmaOpen] = useState(false);
  const [polyOpen, setPolyOpen] = useState(false);
  const [laOpen, setLaOpen] = useState(false);
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
    setScratchOpenFile(null);
    setCalcOpen(false);
    setSigmaOpen(false);
    setPolyOpen(false);
    setLaOpen(false);
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
  const { isDarkGlobal: dark } = useGlobalTheme();

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

  const grapherContextValue = useMemo(() => ({ openGrapher }), [openGrapher]);

  useEffect(() => {
    const handler = () => setChatOpen(c => !c);
    window.addEventListener('oc-toggle-chat', handler);
    return () => window.removeEventListener('oc-toggle-chat', handler);
  }, []);

  useEffect(() => {
    const handler = () => setHelpOpen(true);
    window.addEventListener('oc-toggle-help', handler);
    return () => window.removeEventListener('oc-toggle-help', handler);
  }, []);

  useEffect(() => {
    const handler = () => setGameRulesOpen(g => !g);
    window.addEventListener('oc-game-rules', handler);
    return () => window.removeEventListener('oc-game-rules', handler);
  }, []);

  useEffect(() => {
    const openScratch = (e) => {
      if (isMobile) return;
      if (e?.detail?.filePath || e?.detail?.dir) setScratchOpenFile({ filePath: e.detail.filePath, dir: e.detail.dir });
      setScratchOpen(true);
    };
    window.addEventListener("oc-open-scratchpad", openScratch);
    return () => window.removeEventListener("oc-open-scratchpad", openScratch);
  }, [isMobile]);

  useEffect(() => {
    const handler = (e) => {
      const { tool } = e.detail ?? {};
      if (tool === "math-os") setMathOsOpen(v => !v);
      else if (tool === "calculator") setCalcOpen(v => !v);
      else if (tool === "sigma") setSigmaOpen(v => !v);
      else if (tool === "polynomial") setPolyOpen(v => !v);
      else if (tool === "linear-algebra") setLaOpen(v => !v);
      else if (tool === "python" || tool === "terminal") {
        setTerminalOpen(v => {
          if (!v && tool === "python") {
            window.dispatchEvent(new CustomEvent("oc-terminal-open-tab", { detail: { type: 'python' } }));
          }
          return !v;
        });
      }
      else if (tool === "javascript") setTerminalOpen(v => !v);
      else if (tool === "scratchpad" && !isMobile) setScratchOpen(v => !v);
      else if (tool === "grapher") setGraphOpen(v => !v);
      else if (tool === "grapher-3d") setGraph3DOpen(v => !v);
      else if (tool === "jsxgraph") setGraphJSXOpen(v => !v);
      else if (tool === "matrix-reducer") setMatrixReducerOpen(v => !v);
      else if (tool === "compass-quick") setCompassQuickOpen(v => !v);
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
      <GrapherContext.Provider value={grapherContextValue}>
        <div
          className={`h-screen overflow-hidden ${isCadProRoute || isFiveAxisRoute || isCodeLensRoute || isLearnRoute ? "bg-[#08111f]" : "bg-white dark:bg-slate-950"}`}
        >
          <div className="h-[calc(100vh-44px)] w-full overflow-hidden">
            {children ?? <Outlet />}
          </div>
          <Suspense fallback={null}>
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
            {!isMobile && (
              <ScratchPad
                isOpen={scratchOpen}
                openFile={scratchOpenFile}
                onClose={() => { setScratchOpen(false); setScratchOpenFile(null); }}
                onSnap={handleScratchSnap}
              />
            )}
            {matrixReducerOpen && <MatrixReducer onBack={() => setMatrixReducerOpen(false)} />}
            {compassQuickOpen && <CompassQuickPanel onClose={() => setCompassQuickOpen(false)} />}
            <MontyAmbientNudge />
            <TerminalHub
              isOpen={terminalOpen}
              onClose={() => setTerminalOpen(false)}
            />
            <MathOS open={mathOsOpen} onClose={() => setMathOsOpen(false)} />
          </Suspense>
        </div>
      </GrapherContext.Provider>
    );
  }

  return (
    <ChatProvider>
      <GrapherContext.Provider value={grapherContextValue}>
        <div className={`min-h-screen transition-colors duration-500 relative ${isLessonRoute ? "bg-white dark:bg-slate-950" : ""}`}>
          {isDesktopRoute && !isMobile && (
            <CodeMapBackground
              dark={dark}
              onNodeClick={node => setSelectedNode(node)}
            />
          )}
          {isDesktopRoute && !isMobile && selectedNode && (
            <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}
          <TopBar />

          {/* Mobile tools backdrop */}
          {(graphOpen || graph3DOpen || graphJSXOpen) && (
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
            className={`transition-[padding] duration-500 ease-in-out ${isChemistryRoute || isFullPageToolRoute || isScrollableFullPageRoute ? "flex flex-col h-[calc(100vh-44px)] overflow-hidden" : isFullWidthRoute ? "min-h-screen pb-4 lg:pb-11" : isDesktopRoute && !isMobile ? "h-screen" : "min-h-screen pb-4 lg:pb-11"} ${isHealthRoute || isBrainRoute ? "bg-white dark:bg-slate-950" : ""} lg:pl-0 pt-[52px]`}
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
                      ? "flex-1 min-h-0 w-full overflow-y-auto bg-white dark:bg-slate-950"
                      : isFullWidthRoute
                      ? "w-full"
                      : isUniversalCalcRoute
                      ? "max-w-[min(98vw,2800px)] mx-auto px-2 sm:px-3 lg:px-4 py-8"
                      : `max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-all duration-500`
              }
            >
              {isMobileHome ? <MobileHomePage /> : (children ?? <Outlet />)}
            </div>
          </main>

          <Suspense fallback={null}>
            {matrixReducerOpen && <MatrixReducer onBack={() => setMatrixReducerOpen(false)} />}
            {compassQuickOpen && <CompassQuickPanel onClose={() => setCompassQuickOpen(false)} />}
            <MontyAmbientNudge />
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
            {!isMobile && (
              <ScratchPad
                isOpen={scratchOpen}
                openFile={scratchOpenFile}
                onClose={() => {
                  setScratchOpen(false);
                  setScratchSnap(null);
                  setScratchOpenFile(null);
                }}
                onSnap={handleScratchSnap}
              />
            )}
            <TerminalHub
              isOpen={terminalOpen}
              onClose={() => setTerminalOpen(false)}
            />
            <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
            <MathOS open={mathOsOpen} onClose={() => setMathOsOpen(false)} />
            {calcOpen && <TICalc onClose={() => setCalcOpen(false)} />}
            {sigmaOpen && <SigmaCalc onClose={() => setSigmaOpen(false)} />}
            {polyOpen && <PolyCalc onClose={() => setPolyOpen(false)} />}
            {laOpen && <LinearAlgebraCalc onClose={() => setLaOpen(false)} />}
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
          </Suspense>

          <AlphaMascot />
        </div>
      </GrapherContext.Provider>
    </ChatProvider>
  );
}
