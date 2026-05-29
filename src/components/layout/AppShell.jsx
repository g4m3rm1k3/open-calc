import { useState, useEffect, useCallback, useRef } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { LESSON_MAP, CURRICULUM, COURSES } from "../../content/index.js";
import Sidebar from "./Sidebar.jsx";
import UtilityPanel from "../ui/UtilityPanel.jsx";
import SearchModal from "../search/SearchModal.jsx";
import GlobalGrapher from "../ui/GlobalGrapher.jsx";
import GlobalGrapher3D from "../ui/GlobalGrapher3D.jsx";
import GlobalGrapherJSX from "../ui/GlobalGrapherJSX.jsx";
import ScratchPad from "../ui/ScratchPad.jsx";
import { useSearchContext } from "../../context/SearchContext.jsx";
import { useProgress } from "../../hooks/useProgress.js";
import GrapherContext from "../../context/GrapherContext.jsx";
import {
  Activity,
  Box,
  Settings2,
  PenLine,
  Smartphone,
  Layers,
  Search,
  BookOpen,
  Menu,
  X,
  Calculator,
  Terminal,
  Code2,
  PlayCircle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  FileText,
  Gamepad2,
  Library,
  FlaskConical,
} from "lucide-react";
import TICalc from "../calculator/TICalc.jsx";
import SigmaCalc from "../calculator/SigmaCalc.jsx";
import PolyCalc from "../calculator/PolyCalc.jsx";
import LinearAlgebraCalc from "../calculator/LinearAlgebraCalc.jsx";
import HelpModal from "../ui/HelpModal.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import GlobalPythonNotebook from "../ui/GlobalPythonNotebook.jsx";
import GlobalJSPlayground from "../ui/GlobalJSPlayground.jsx";
import { ChatProvider, useChat } from "../../context/ChatContext.jsx";
import ChatPanel from "../chat/ChatPanel.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoPlayer } from "../../context/VideoPlayerContext.jsx";
import PhysicsPoolLab from "../tools/PhysicsPoolLab.jsx";
import BasketballLab from "../tools/BasketballLab.jsx";
import MiniGolfGame from "../tools/MiniGolfGame.jsx";
import FootballCalculus from "../viz/react/FootballCalculus.jsx";
import ChemistryPage from "../../pages/ChemistryPage.jsx";
import PhysicsPage from "../../pages/PhysicsPage.jsx";
import DynamicBackground from "../ui/DynamicBackground.jsx";
import BackgroundPicker from "../ui/BackgroundPicker.jsx";

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

function ScoreWidget() {
  const location = useLocation();
  const { progress } = useProgress();

  // Parse chapter/lesson from URL (same approach as Sidebar — avoids useParams pitfalls)
  const pathMatch = location.pathname.match(
    /^\/chapter\/([^/]+)(?:\/([^/]+))?/,
  );
  const chapterId = pathMatch?.[1] ?? null;
  const lessonSlug = pathMatch?.[2] ?? null;

  // Current lesson quiz score
  const lessonKey =
    chapterId && lessonSlug ? `${chapterId}/${lessonSlug}` : null;
  const currentLesson = lessonKey ? LESSON_MAP[lessonKey] : null;
  const lessonQuiz = currentLesson?.id
    ? (progress[currentLesson.id]?.quiz ?? null)
    : null;

  // Active course totals
  const chapter = chapterId
    ? CURRICULUM.find((c) => String(c.number) === chapterId)
    : null;
  const activeCourse = chapter?.course ?? null;
  if (!activeCourse) return null;

  const courseChapters = CURRICULUM.filter((c) => c.course === activeCourse);
  const courseLessons = courseChapters
    .flatMap((c) => c.lessons ?? [])
    .filter((l) => l.quiz?.length > 0);
  const courseMax = courseLessons.reduce(
    (acc, l) => acc + (l.quiz?.length ?? 0),
    0,
  );
  const courseCorrect = courseLessons.reduce(
    (acc, l) => acc + (progress[l.id]?.quiz?.correct ?? 0),
    0,
  );

  if (courseMax === 0) return null;

  const lessonPct = lessonQuiz ? lessonQuiz.correct / lessonQuiz.total : null;
  const lessonColor =
    lessonPct === null
      ? ""
      : lessonPct >= 0.8
        ? "text-emerald-600 dark:text-emerald-400"
        : lessonPct >= 0.5
          ? "text-amber-500 dark:text-amber-400"
          : "text-red-500 dark:text-red-400";

  const coursePct = courseMax > 0 ? courseCorrect / courseMax : 0;
  const barColor =
    coursePct >= 0.8
      ? "bg-emerald-500"
      : coursePct >= 0.5
        ? "bg-amber-400"
        : coursePct > 0
          ? "bg-brand-500"
          : "bg-slate-300 dark:bg-slate-600";

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs select-none">
      <span className="text-yellow-400" aria-hidden>
        ★
      </span>
      <div className="flex items-baseline gap-0.5">
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {courseCorrect}
        </span>
        <span className="text-slate-400 dark:text-slate-500">/{courseMax}</span>
      </div>
      {/* Mini progress bar */}
      <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.max(2, coursePct * 100)}%` }}
        />
      </div>
      {lessonQuiz && (
        <>
          <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <span className={`font-semibold ${lessonColor}`}>
            {lessonQuiz.correct}
            <span className="font-normal text-slate-400">/10</span>
          </span>
        </>
      )}
    </div>
  );
}

function ChatToggleButton({ onClick, isOpen }) {
  const { unreadCount } = useChat()
  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-11 rounded-2xl transition-all duration-500 overflow-hidden group ${
        isOpen
          ? "bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)]"
          : "bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/60 hover:dark:bg-slate-800/60"
      }`}
      aria-label="Study chat"
      title="Study Chat"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <div className="relative">
             <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
             <div className="absolute inset-0 bg-indigo-500/10 blur-lg rounded-full animate-pulse" />
          </div>
        )}
      </div>
      {unreadCount > 0 && !isOpen && (
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      )}
    </button>
  )
}

function CoursesDropdown() {
  return (
    <NavLink
      to="/courses"
      className={({ isActive }) =>
        `p-2 rounded-lg transition-all flex items-center ${
          isActive
            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow'
            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`
      }
      title="Courses"
      aria-label="Courses"
    >
      <BookOpen className="w-5 h-5" />
    </NavLink>
  );
}

function RibbonGroup({ children }) {
  return (
    <div className="flex items-center gap-1.5 px-2 sm:px-3 border-r border-white/5 last:border-none h-full">
      {children}
    </div>
  );
}

function TopBar({
  onMenuToggle,
  sidebarOpen,
  onGraphToggle,
  onGraph3DToggle,
  onGraphJSXToggle,
  onScratchToggle,
  scratchOpen,
  onCalcToggle,
  calcOpen,
  onSigmaToggle,
  sigmaOpen,
  onPolyToggle,
  polyOpen,
  onLAToggle,
  laOpen,
  onPythonToggle,
  pythonOpen,
  onJsToggle,
  jsOpen,
  onHelpToggle,
  helpOpen,
  onPoolToggle,
  poolOpen,
  onChemToggle,
  chemOpen,
  onPhysicsToggle,
  physicsOpen,
  onBasketToggle,
  basketOpen,
  onGolfToggle,
  golfOpen,
  onFootballToggle,
  footballOpen,
  onChatToggle,
  chatOpen,
  onBgPickerToggle,
  dark,
  toggleDark,

}) {
  const { openSearch } = useSearchContext();
  const {
    isOpen: videoOpen,
    isMinimized: videoMinimized,
    openPlayer,
    toggleMinimize,
  } = useVideoPlayer();
  const navigate = useNavigate();
  const videoActive = videoOpen && !videoMinimized;
  const handleVideoToggle = () => (videoOpen ? toggleMinimize() : openPlayer());
  const [gamesMenuOpen, setGamesMenuOpen] = useState(false);
  const gamesMenuRef = useRef(null);

  useEffect(() => {
    if (!gamesMenuOpen) return;
    const handler = (e) => {
      if (gamesMenuRef.current && !gamesMenuRef.current.contains(e.target))
        setGamesMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [gamesMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 flex items-center px-2 sm:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-14 overflow-x-auto overflow-y-hidden">
      {/* 1. BRANDING & SEARCH - Crystalline Module */}
      <div className="flex items-center gap-2 border-r border-white/10 pr-4 h-10">
        <Link to="/" className="relative group">
          <span className="text-indigo-600 dark:text-white font-black tracking-tighter transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(79,70,229,0.5)] text-3xl group-hover:text-4xl">
            ∂
          </span>
          <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <button
          onClick={openSearch}
          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white shadow-sm transition-all duration-300"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* 2. THE EXPANDED GRID RIBBON */}
      <nav className="flex-1 flex flex-row h-full items-center justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap">
        {/* NAV BAY — mode switchers */}
        <RibbonGroup>
          <CoursesDropdown />
          <NavLink to="/games" title="Games" aria-label="Games" className={({ isActive }) => `p-2 rounded-lg transition-all ${isActive ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
            <Gamepad2 className="w-5 h-5" />
          </NavLink>
          <NavLink to="/labs" title="Labs" aria-label="Labs" className={({ isActive }) => `p-2 rounded-lg transition-all ${isActive ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
            <FlaskConical className="w-5 h-5" />
          </NavLink>
          <NavLink to="/reference" title="Reference" aria-label="Reference Library" className={({ isActive }) => `p-2 rounded-lg transition-all ${isActive ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
            <Library className="w-5 h-5" />
          </NavLink>
          <NavLink to="/docs" title="Docs" aria-label="Technical Docs" className={({ isActive }) => `p-2 rounded-lg transition-all ${isActive ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
            <FileText className="w-5 h-5" />
          </NavLink>
          <button onClick={onHelpToggle} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title="Help">
            <HelpCircle className="w-5 h-5" />
          </button>
        </RibbonGroup>

        {/* MATH BAY */}
        <RibbonGroup>
          <button onClick={onGraphToggle} className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all" title="2D Grapher">
            <Activity className="w-5 h-5" />
          </button>
          <button onClick={onGraph3DToggle} className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all" title="3D Plotter">
            <Box className="w-5 h-5" />
          </button>
          <button onClick={onGraphJSXToggle} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all" title="JSXGraph Pro">
            <Settings2 className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-[var(--color-border)] mx-1" />
          <button onClick={onCalcToggle} className="p-2 rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all" title="Calculator">
            <Calculator className="w-5 h-5" />
          </button>
          <button onClick={onSigmaToggle} className="p-2 rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all font-bold text-sm" title="Sigma Σ">
            Σ
          </button>
          <button onClick={onPolyToggle} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all font-black text-[10px]" title="Polynomial Solver">
            P(x)
          </button>
          <button onClick={onLAToggle} className="p-2 rounded-lg text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all font-black text-[10px]" title="Linear Algebra Calculator">
            [A]
          </button>
        </RibbonGroup>

        {/* ENGINES BAY */}
        <RibbonGroup>
          <button onClick={onScratchToggle} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all" title="Scratchpad">
            <PenLine className="w-5 h-5" />
          </button>
          <button onClick={onPythonToggle} className="p-2 rounded-lg text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all" title="Python Notebook">
            <Terminal className="w-5 h-5" />
          </button>
          <button onClick={onJsToggle} className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-all" title="JS Playground">
            <Code2 className="w-5 h-5" />
          </button>
        </RibbonGroup>

      </nav>

      {/* 3. ASSISTANTS & UTILS */}
      <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-4 h-full">
        <ScoreWidget />
        <button onClick={handleVideoToggle} className={`p-2.5 rounded-xl transition-all ${videoActive ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" : "text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"}`} title="Video Academy">
          <PlayCircle className="w-5 h-5" />
        </button>
        <ChatToggleButton onClick={onChatToggle} isOpen={chatOpen} />
        <div className="w-px h-8 bg-[var(--color-border)] mx-1" />
        <button onClick={onBgPickerToggle} className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Sky Atmosphere">
          <Sparkles className="w-5 h-5" />
        </button>
        <button onClick={toggleDark} className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {dark ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg> 
                : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2" />
        

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
  const isArkanoidLearnRoute = location.pathname.startsWith("/arkanoid-learn");
  const isCNCSimRoute = location.pathname.startsWith("/cnc-sim");
  const isCadProRoute = location.pathname.startsWith("/cad-pro");
  const isOpenCraftRoute = location.pathname.startsWith("/open-craft");
  const isRealityRunnerRoute = location.pathname.startsWith("/reality-runner");
  const isStemQuestRoute = location.pathname.startsWith("/stem-quest");
  const isDocsRoute = location.pathname.startsWith("/docs");
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    const saved = localStorage.getItem("oc-sidebar-pinned");
    return saved !== null ? saved === "true" : true;
  });
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const isSidebarExpanded = sidebarPinned || (sidebarHovered && !sidebarOpen);

  useEffect(() => {
    localStorage.setItem("oc-sidebar-pinned", sidebarPinned);
  }, [sidebarPinned]);

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
  const [pythonOpen, setPythonOpen] = useState(false);
  const [jsOpen, setJsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);
  const [chemOpen, setChemOpen] = useState(false);
  const [physicsOpen, setPhysicsOpen] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [golfOpen, setGolfOpen] = useState(false);
  const [footballOpen, setFootballOpen] = useState(false);
  const [polyOpen, setPolyOpen] = useState(false);
  const [laOpen, setLAOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [scratchSnap, setScratchSnap] = useState(null)
  const [scratchSnapW, setScratchSnapW] = useState(680)
  const handleScratchSnap = useCallback((side, w) => {
    setScratchSnap(side)
    if (w) setScratchSnapW(w)
  }, [])
  useEffect(() => {
    if (!scratchOpen) setScratchSnap(null)
  }, [scratchOpen])
  const closeAllTools = useCallback(() => {
    setGraphOpen(false);
    setGraph3DOpen(false);
    setGraphJSXOpen(false);
    setScratchOpen(false);
    setCalcOpen(false);
    setSigmaOpen(false);
    setPolyOpen(false);
    setLAOpen(false);
    setPythonOpen(false);
    setJsOpen(false);
    setPoolOpen(false);
    setChemOpen(false);
    setPhysicsOpen(false);
    setBasketOpen(false);
    setGolfOpen(false);
    setFootballOpen(false);
  }, []);
  const [grapherLaunchConfig, setGrapherLaunchConfig] = useState(null);
  const { openSearch } = useSearchContext();

  const [bgConfig, setBgConfig] = useState(() => {
    const saved = localStorage.getItem('oc-bg-config')
    return saved ? JSON.parse(saved) : { type: 'dynamic' }
  })
  const [bgPickerOpen, setBgPickerOpen] = useState(false)

  const updateBgConfig = (newConfig) => {
    setBgConfig(newConfig)
    localStorage.setItem('oc-bg-config', JSON.stringify(newConfig))
  }

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
      else if (tool === "python") setPythonOpen(true);
      else if (tool === "javascript") setJsOpen(true);
      else if (tool === "scratchpad") setScratchOpen(true);
      else if (tool === "grapher") setGraphOpen(true);
      else if (tool === "grapher-3d") setGraph3DOpen(true);
      else if (tool === "jsxgraph") setGraphJSXOpen(true);
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

  if (isOpenMatRoute || isArkanoidLearnRoute || isRealityRunnerRoute || isCNCSimRoute || isCadProRoute || isOpenCraftRoute || isStemQuestRoute || isDocsRoute) {
    return (
      <GrapherContext.Provider value={{ openGrapher }}>
        <div className={`h-screen overflow-hidden ${(isArkanoidLearnRoute || isRealityRunnerRoute || isCadProRoute || isOpenCraftRoute || isStemQuestRoute) ? "bg-[#08111f]" : "bg-white dark:bg-slate-950"}`}>
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
          <GlobalPythonNotebook
            isOpen={pythonOpen}
            onClose={() => setPythonOpen(false)}
          />
          <GlobalJSPlayground isOpen={jsOpen} onClose={() => setJsOpen(false)} />
        </div>
      </GrapherContext.Provider>
    );
  }

  return (
    <ChatProvider>
    <GrapherContext.Provider value={{ openGrapher }}>
      <div className="min-h-screen transition-colors duration-500 relative overflow-hidden">
        <DynamicBackground mode={dark ? "dark" : "light"} config={bgConfig} />
        <TopBar
onMenuToggle={() => setSidebarOpen((o) => !o)}
          sidebarOpen={sidebarOpen}
          onGraphToggle={() => setGraphOpen((prev) => !prev)}
          onGraph3DToggle={() => setGraph3DOpen((prev) => !prev)}
          onGraphJSXToggle={() => setGraphJSXOpen((prev) => !prev)}
          onScratchToggle={() => setScratchOpen((prev) => !prev)}
          scratchOpen={scratchOpen}
          onCalcToggle={() => setCalcOpen((prev) => !prev)}
          calcOpen={calcOpen}
          onSigmaToggle={() => setSigmaOpen((prev) => !prev)}
          sigmaOpen={sigmaOpen}
          onPolyToggle={() => setPolyOpen((prev) => !prev)}
          polyOpen={polyOpen}
          onLAToggle={() => setLAOpen((prev) => !prev)}
          laOpen={laOpen}
          onPythonToggle={() => setPythonOpen((prev) => !prev)}
          pythonOpen={pythonOpen}
          onJsToggle={() => setJsOpen((prev) => !prev)}
          jsOpen={jsOpen}
          onHelpToggle={() => setHelpOpen((prev) => !prev)}
          helpOpen={helpOpen}
          onPoolToggle={() => setPoolOpen((prev) => !prev)}
          poolOpen={poolOpen}
          onChemToggle={() => setChemOpen((prev) => !prev)}
          chemOpen={chemOpen}
          onPhysicsToggle={() => setPhysicsOpen((prev) => !prev)}
          physicsOpen={physicsOpen}
          onBasketToggle={() => setBasketOpen((prev) => !prev)}
          basketOpen={basketOpen}
          onGolfToggle={() => setGolfOpen((prev) => !prev)}
          golfOpen={golfOpen}
          onFootballToggle={() => setFootballOpen((prev) => !prev)}
          footballOpen={footballOpen}
          onChatToggle={() => setChatOpen((prev) => !prev)}
          chatOpen={chatOpen}
          onBgPickerToggle={() => setBgPickerOpen(o => !o)}
          dark={dark}
          toggleDark={toggleDark}
        />

        {/* Mobile sidebar/tools backdrop */}
        {(sidebarOpen ||
          graphOpen ||
          graph3DOpen ||
          graphJSXOpen ||
          mobileToolsOpen) && (
          <div
            className="fixed inset-0 z-[45] bg-black/30 backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent"
            onClick={() => {
              setSidebarOpen(false);
              setMobileToolsOpen(false);
              if (window.innerWidth < 1024) {
                setGraphOpen(false);
                setGraph3DOpen(false);
                setGraphJSXOpen(false);
                setPythonOpen(false);
              }
            }}
          />
        )}

        {/* Sidebar - Desktop logic for pin/hover, Mobile logic for toggle */}
        <aside
          onMouseEnter={() => !sidebarPinned && setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={`fixed left-0 bottom-0 z-50 bg-[var(--color-surface)] backdrop-blur-xl border-r border-[var(--color-border)] transition-all duration-500 ease-in-out w-[280px]
          top-14
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isSidebarExpanded ? "lg:translate-x-0" : "lg:-translate-x-[276px]"}
          ${!sidebarPinned && isSidebarExpanded ? "shadow-2xl ring-1 ring-black/5 dark:ring-white/5" : ""}
        `}
        >
          <Sidebar
            onNavigate={() => setSidebarOpen(false)}
            isPinned={sidebarPinned}
            togglePin={() => setSidebarPinned(!sidebarPinned)}
            isCollapsed={!isSidebarExpanded && !sidebarOpen}
            onSearchOpen={openSearch}
          />

          {/* Hover trigger - Zen Mode Desktop ONLY */}
          {!sidebarPinned && !isSidebarExpanded && !sidebarOpen && (
            <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-brand-500/10 dark:bg-brand-400/5 hover:bg-brand-500/20 transition-colors cursor-pointer hidden lg:block" />
          )}
        </aside>

        {/* Main content */}
        <main
          className={`transition-[padding] duration-500 ease-in-out pb-20 lg:pb-0 ${(isChemistryRoute || isOpenMatRoute) ? "h-screen overflow-hidden" : "min-h-screen"} ${sidebarPinned ? "lg:pl-[280px]" : "lg:pl-3"} ${chatOpen ? "lg:pr-[400px]" : "lg:pr-0"} pt-14`}
          style={{
            ...(scratchSnap === 'left'  ? { paddingLeft:  `${(sidebarPinned ? 280 : 12) + scratchSnapW}px` } : {}),
            ...(scratchSnap === 'right' ? { paddingRight: `${scratchSnapW}px` } : {}),
          }}
        >
          <div
            className={
              isChemistryRoute
                ? "w-full h-[calc(100vh-60px)] flex flex-col overflow-hidden"
                : isOpenMatRoute
                  ? "w-full h-[calc(100vh-60px)] flex flex-col overflow-hidden"
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
                    setPythonOpen(true);
                    setMobileToolsOpen(false);
                  }}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 border border-teal-100 dark:border-teal-800/50 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-800/50 flex items-center justify-center">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Python
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    closeAllTools();
                    setJsOpen(true);
                    setMobileToolsOpen(false);
                  }}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-800/50 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800/50 flex items-center justify-center">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    JS Playground
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
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          onSearchOpen={openSearch}
          onToolsToggle={() => setMobileToolsOpen((o) => !o)}
        />

        {calcOpen && <TICalc onClose={() => setCalcOpen(false)} />}
        {sigmaOpen && <SigmaCalc onClose={() => setSigmaOpen(false)} />}
        {polyOpen && <PolyCalc onClose={() => setPolyOpen(false)} />}
        {laOpen && <LinearAlgebraCalc onClose={() => setLAOpen(false)} />}
        <UtilityPanel />
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
          onClose={() => { setScratchOpen(false); setScratchSnap(null) }}
          onSnap={handleScratchSnap}
        />
        <GlobalPythonNotebook
          isOpen={pythonOpen}
          onClose={() => setPythonOpen(false)}
        />
        <GlobalJSPlayground isOpen={jsOpen} onClose={() => setJsOpen(false)} />
        <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        {poolOpen && <PhysicsPoolLab onClose={() => setPoolOpen(false)} />}
        {basketOpen && <BasketballLab onClose={() => setBasketOpen(false)} />}
        {golfOpen && <MiniGolfGame onClose={() => setGolfOpen(false)} />}
        <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        {bgPickerOpen && (
          <BackgroundPicker 
            config={bgConfig} 
            onUpdate={updateBgConfig} 
            onClose={() => setBgPickerOpen(false)} 
          />
        )}

        {footballOpen && (
          <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950 overflow-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏈</span>
                <span className="font-bold text-white text-sm">Football Calculus</span>
                <span className="text-xs text-slate-500 ml-2">Integration · Optimization · Related Rates</span>
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
      </div>
    </GrapherContext.Provider>
    </ChatProvider>
  );
}
