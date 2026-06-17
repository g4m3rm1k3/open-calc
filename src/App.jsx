import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProgressProvider } from "./context/ProgressContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";
import { PinsProvider } from "./context/PinsContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import { VideoPlayerProvider } from "./context/VideoPlayerContext.jsx";
import FloatingVideoPlayer from "./components/ui/FloatingVideoPlayer.jsx";
import LoadingSpinner from "./components/ui/LoadingSpinner.jsx";
import { getLabEntry } from "./labs/labLoader.js";
import { getGameEntry } from "./games/gameLoader.js";
import DesktopProvider from "./components/desktop/DesktopProvider.jsx";

const DesktopPage = lazy(() => import("./pages/DesktopPage.jsx"));
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ChapterPage = lazy(() => import("./pages/ChapterPage.jsx"));
const LessonPage = lazy(() => import("./pages/LessonPage.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ReferencePage = lazy(() => import("./pages/ReferencePage.jsx"));
const UniversalCalcPage = lazy(() => import("./labs/universal-calc/UniversalCalcPage.jsx"));
const OpenMatPage = lazy(() => import("./labs/openmat/OpenMatPage.jsx"));
const CNCSimPage = lazy(() => import("./labs/cnc-sim/CNCSimPage.jsx"));
const CoursePage = lazy(() => import("./pages/CoursePage.jsx"));
const LogicSimPage = lazy(() => import("./labs/logic-sim/LogicSimPage.jsx"));
const ChemistryPage = lazy(() => import("./labs/chemistry/ChemistryPage.jsx"));
const PhysicsPage = lazy(() => import("./labs/physics/PhysicsPage.jsx"));
const AllCoursesPage = lazy(() => import("./pages/AllCoursesPage.jsx"));
const CadProPage = lazy(() => import("./labs/cad-pro/CadProPage.jsx"));
const MarkdownHub = lazy(() => import("./components/docs/MarkdownHub.jsx"));
const HealthTrackerPage = lazy(() => import('./games/HealthTrackerPage.jsx'));
const RPGWorkoutPage = lazy(() => import('./features/rpg/RPGWorkoutPage.jsx'));
const BrainPage = lazy(() => import('./features/brain/BrainPage.jsx'));
const EntryShell = lazy(() => import("./pages/EntryShell.jsx"));
const LinearAlgebraReferencePage = lazy(() => import("./pages/LinearAlgebraReferencePage.jsx"));
const CSSMasteryPage = lazy(() => import("./labs/css-mastery/CSSMasteryPage.jsx"));
const ReactMasteryPage = lazy(() => import("./labs/react-mastery/ReactMasteryPage.jsx"));
const FiveAxisKinematicsPage = lazy(() => import("./labs/five-axis/FiveAxisKinematicsPage.jsx"));
const CodeLensPage = lazy(() => import("./labs/codelens/CodeLensPage.jsx"));
const SICPPage = lazy(() => import("./labs/sicp-js/SICPPage.jsx"));
const DSAPatternsPage = lazy(() => import("./labs/dsa-patterns/DSAPatternsPage.jsx"));

const Fallback = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
    <ProgressProvider>
      <SearchProvider>
        <PinsProvider>
          <VideoPlayerProvider>
            <HashRouter
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <DesktopProvider>
              <FloatingVideoPlayer />
              <AppShell>
                <Suspense fallback={<Fallback />}>
                  <Routes>
                    <Route index element={<DesktopPage />} />
                    <Route path="welcome" element={<HomePage />} />
                    <Route path="course/:courseKey" element={<CoursePage />} />
                    <Route path="chapter/:chapterId" element={<ChapterPage />} />
                    <Route path="chapter/:chapterId/:lessonSlug" element={<LessonPage />} />
                    <Route path="chapter/:chapterId/:lessonSlug/*" element={<LessonPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="reference" element={<ReferencePage />} />
                    <Route path="linear-algebra" element={<LinearAlgebraReferencePage />} />
                    <Route path="universal-calc" element={<UniversalCalcPage />} />
                    <Route path="openmat" element={<OpenMatPage />} />
                    <Route path="cnc-sim" element={<CNCSimPage />} />
                    <Route path="logic-sim" element={<LogicSimPage />} />
                    <Route path="chemistry" element={<ChemistryPage />} />
                    <Route path="physics" element={<PhysicsPage />} />
                    <Route path="courses" element={<AllCoursesPage />} />
                    <Route path="cad-pro" element={<CadProPage />} />
                    <Route path="studio" element={<MarkdownHub />} />
                    <Route path="docs" element={<Navigate to="/studio" replace />} />
                    <Route path="games" element={<Navigate to="/" replace />} />
                    <Route path="labs" element={<Navigate to="/" replace />} />
                    <Route path="health" element={<HealthTrackerPage />} />
                    <Route path="rpg-workout" element={<RPGWorkoutPage />} />
                    <Route path="brain" element={<BrainPage />} />

                    {/* Game auto-discovery */}
                    <Route path="game/:gameKey" element={
                      <EntryShell paramKey="gameKey" loader={getGameEntry}
                        notFoundEmoji="🎮" notFoundLabel="Game not found"
                        backTo="/games" backLabel="Back to games" />
                    } />

                    {/* Legacy redirects for bookmarked game URLs */}
                    <Route path="rubiks-cube" element={<Navigate to="/game/rubiks-cube" replace />} />
                    <Route path="matrix-game" element={<Navigate to="/game/matrix-game" replace />} />
                    <Route path="stem-tetris" element={<Navigate to="/game/stem-tetris" replace />} />
                    <Route path="card-quest" element={<Navigate to="/game/card-quest" replace />} />
                    <Route path="card-academy" element={<Navigate to="/game/card-academy" replace />} />
                    <Route path="asteroids-la" element={<Navigate to="/game/asteroids-la" replace />} />
                    <Route path="vector-command" element={<Navigate to="/game/vector-command" replace />} />
                    <Route path="arkanoid-learn" element={<Navigate to="/game/arkanoid" replace />} />
                    <Route path="stem-quest" element={<Navigate to="/game/stem-quest" replace />} />
                    <Route path="open-craft" element={<Navigate to="/game/open-craft" replace />} />
                    <Route path="reality-runner" element={<Navigate to="/game/reality-runner" replace />} />

                    <Route path="five-axis" element={<FiveAxisKinematicsPage />} />
                    <Route path="codelens" element={<CodeLensPage />} />

                    {/* Web Learn Curriculums */}
                    <Route path="web-learn/css-mastery/:lessonId" element={<CSSMasteryPage />} />
                    <Route path="web-learn/css-mastery" element={<CSSMasteryPage />} />
                    <Route path="web-learn/react-mastery/:lessonId" element={<ReactMasteryPage />} />
                    <Route path="web-learn/react-mastery" element={<ReactMasteryPage />} />

                    <Route path="learn/sicp/:lessonId" element={<SICPPage />} />
                    <Route path="learn/sicp" element={<SICPPage />} />
                    <Route path="learn/dsa-patterns/:lessonId" element={<DSAPatternsPage />} />
                    <Route path="learn/dsa-patterns" element={<DSAPatternsPage />} />

                    {/* Lab auto-discovery */}
                    <Route path="lab/:labKey" element={
                      <EntryShell paramKey="labKey" loader={getLabEntry}
                        notFoundEmoji="🔬" notFoundLabel="Lab not found"
                        backTo="/labs" backLabel="Back to labs" />
                    } />

                    {/* Legacy redirects for bookmarked lab URLs */}
                    <Route path="robot-arm-lab" element={<Navigate to="/lab/robot-arm-sim" replace />} />
                    <Route path="drone-lab" element={<Navigate to="/lab/drone-lab" replace />} />
                    <Route path="sim-lab" element={<Navigate to="/lab/sim-lab" replace />} />
                    <Route path="matrix-lab" element={<Navigate to="/lab/matrix-lab" replace />} />
                    <Route path="matrix-3d-lab" element={<Navigate to="/lab/matrix-3d-lab" replace />} />
                    <Route path="decomp-lab" element={<Navigate to="/lab/decomp-lab" replace />} />
                    <Route path="cmm-lab" element={<Navigate to="/lab/cmm-lab" replace />} />
                    <Route path="odds-lab" element={<Navigate to="/lab/odds-lab" replace />} />
                    <Route path="plc-lab" element={<Navigate to="/lab/plc-lab" replace />} />
                    <Route path="html-lab" element={<Navigate to="/lab/html-lab" replace />} />
                    <Route path="music-lab" element={<Navigate to="/lab/music-lab" replace />} />
                  </Routes>
                </Suspense>
              </AppShell>
              </DesktopProvider>
            </HashRouter>
          </VideoPlayerProvider>
        </PinsProvider>
      </SearchProvider>
    </ProgressProvider>
    </AuthProvider>
  );
}
