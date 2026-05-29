import { HashRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProgressProvider } from "./context/ProgressContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";
import { PinsProvider } from "./context/PinsContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import { VideoPlayerProvider } from "./context/VideoPlayerContext.jsx";
import FloatingVideoPlayer from "./components/videos/FloatingVideoPlayer.jsx";
import LoadingSpinner from "./components/ui/LoadingSpinner.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ChapterPage = lazy(() => import("./pages/ChapterPage.jsx"));
const LessonPage = lazy(() => import("./pages/LessonPage.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const LearningPathsPage = lazy(() => import("./pages/LearningPathsPage.jsx"));
const ReferencePage = lazy(() => import("./pages/ReferencePage.jsx"));
const UniversalCalcPage = lazy(() => import("./pages/UniversalCalcPage.jsx"));
const OpenMatPage = lazy(() => import("./pages/OpenMatPage.jsx"));
const ArkanoidLearnPage = lazy(() => import("./pages/ArkanoidLearnPage.jsx"));
const CNCSimPage = lazy(() => import("./pages/CNCSimPage.jsx"));
const RealityRunnerPage = lazy(() => import("./pages/RealityRunnerPage.jsx"));
const CoursePage = lazy(() => import("./pages/CoursePage.jsx"));
const LogicSimPage = lazy(() => import("./pages/LogicSimPage.jsx"));
const ChemistryPage = lazy(() => import("./pages/ChemistryPage.jsx"));
const PhysicsPage = lazy(() => import("./pages/PhysicsPage.jsx"));
const AllCoursesPage = lazy(() => import("./pages/AllCoursesPage.jsx"));
const CadProPage = lazy(() => import("./pages/CadProPage.jsx"));
const OpenCraftPage = lazy(() => import("./pages/OpenCraftPage.jsx"));
const StemQuestPage = lazy(() => import("./pages/StemQuestPage.jsx"));
const DocsPage = lazy(() => import("./pages/DocsPage.jsx"));
const GamesPage = lazy(() => import("./pages/GamesPage.jsx"));
const LabsPage = lazy(() => import("./pages/LabsPage.jsx"));
const AsteroidsLAPage = lazy(() => import("./pages/AsteroidsLAPage.jsx"));
const CardAcademyPage = lazy(() => import("./pages/CardAcademyPage.jsx"));
const StemTetrisPage = lazy(() => import("./pages/StemTetrisPage.jsx"));
const HealthTrackerPage = lazy(() => import('./pages/HealthTrackerPage.jsx'));
const Fallback = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  return (
    <ProgressProvider>
      <SearchProvider>
        <PinsProvider>
          <VideoPlayerProvider>
            <HashRouter
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <FloatingVideoPlayer />
              <AppShell>
                <Suspense fallback={<Fallback />}>
                  <Routes>
                    <Route index element={<HomePage />} />
                    <Route path="course/:courseKey" element={<CoursePage />} />
                    <Route
                      path="chapter/:chapterId"
                      element={<ChapterPage />}
                    />
                    <Route
                      path="chapter/:chapterId/:lessonSlug"
                      element={<LessonPage />}
                    />
                    <Route
                      path="chapter/:chapterId/:lessonSlug/*"
                      element={<LessonPage />}
                    />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="paths" element={<LearningPathsPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="reference" element={<ReferencePage />} />
                    <Route
                      path="universal-calc"
                      element={<UniversalCalcPage />}
                    />
                    <Route path="openmat" element={<OpenMatPage />} />
                    <Route path="arkanoid-learn" element={<ArkanoidLearnPage />} />
                    <Route path="cnc-sim" element={<CNCSimPage />} />
                    <Route path="reality-runner" element={<RealityRunnerPage />} />
                    <Route path="logic-sim" element={<LogicSimPage />} />
                    <Route path="chemistry" element={<ChemistryPage />} />
                    <Route path="physics" element={<PhysicsPage />} />
                    <Route path="courses" element={<AllCoursesPage />} />
                    <Route path="cad-pro" element={<CadProPage />} />
                    <Route path="open-craft" element={<OpenCraftPage />} />
                    <Route path="stem-quest" element={<StemQuestPage />} />
                    <Route path="docs" element={<DocsPage />} />
                    <Route path="games" element={<GamesPage />} />
                    <Route path="labs" element={<LabsPage />} />
                    <Route path="asteroids-la" element={<AsteroidsLAPage />} />
                    <Route path="card-academy" element={<CardAcademyPage />} />
                    <Route path="stem-tetris" element={<StemTetrisPage />} />
                    <Route path="health" element={<HealthTrackerPage />} />
                  </Routes>
                </Suspense>
              </AppShell>
            </HashRouter>
          </VideoPlayerProvider>
        </PinsProvider>
      </SearchProvider>
    </ProgressProvider>
  );
}
