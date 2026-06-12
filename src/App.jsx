import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProgressProvider } from "./context/ProgressContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";
import { PinsProvider } from "./context/PinsContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
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
const DocsPage = lazy(() => import("./pages/DocsPage.jsx"))
;
const VizGalleryPage = lazy(() => import("./pages/VizGalleryPage.jsx"));
const GamesPage = lazy(() => import("./pages/GamesPage.jsx"));
const LabsPage = lazy(() => import("./pages/LabsPage.jsx"));
const AsteroidsLAPage = lazy(() => import("./pages/AsteroidsLAPage.jsx"));
const VectorCommandPage = lazy(() => import("./pages/VectorCommandPage.jsx"));
const CardAcademyPage = lazy(() => import("./pages/CardAcademyPage.jsx"));
const CardQuestPage = lazy(() => import("./pages/CardQuestPage.jsx"));
const StemTetrisPage = lazy(() => import("./pages/StemTetrisPage.jsx"));
const HealthTrackerPage = lazy(() => import('./pages/HealthTrackerPage.jsx'));
const RPGWorkoutPage = lazy(() => import('./pages/RPGWorkoutPage.jsx'));
const BrainPage = lazy(() => import('./pages/BrainPage.jsx'));
const RubiksCubePage = lazy(() => import("./pages/RubiksCubePage.jsx"));
const MatrixGamePage = lazy(() => import("./pages/MatrixGamePage.jsx"));
const RobotArmLabPage = lazy(() => import("./pages/RobotArmLabPage.jsx"));
const LinearAlgebraReferencePage = lazy(() => import("./pages/LinearAlgebraReferencePage.jsx"));
const DroneLabPage = lazy(() => import("./pages/DroneLabPage.jsx"));
const SimLabPage = lazy(() => import("./pages/SimLabPage.jsx"));
const WebLearnPage = lazy(() => import("./pages/WebLearnPage.jsx"));
const MatrixLabPage = lazy(() => import("./pages/MatrixLabPage.jsx"));
const Matrix3DLabPage = lazy(() => import("./pages/Matrix3DLabPage.jsx"));
const DecompLabPage = lazy(() => import("./pages/DecompLabPage.jsx"));
const CmmLabPage = lazy(() => import("./pages/CmmLabPage.jsx"));
const FiveAxisKinematicsPage = lazy(() => import("./pages/FiveAxisKinematicsPage.jsx"));
const OddsLabPage = lazy(() => import("./pages/OddsLabPage.jsx"));
const DSAArraysLabPage = lazy(() => import("./pages/DSAArraysLabPage.jsx"));
const DSALinkedListsLabPage = lazy(() => import("./pages/DSALinkedListsLabPage.jsx"));
const PLCLabPage = lazy(() => import("./pages/PLCLabPage.jsx"))
const MatrixReducerPage = lazy(() => import("./pages/MatrixReducerPage.jsx"));
const CodeLensPage = lazy(() => import("./pages/CodeLensPage.jsx"));
const LearnPage = lazy(() => import("./pages/LearnPage.jsx"));

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
                    <Route path="linear-algebra" element={<LinearAlgebraReferencePage />} />
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
                    <Route path="studio" element={<DocsPage />} />
                    <Route path="docs" element={<Navigate to="/studio" replace />} />
                    <Route path="viz-gallery" element={<VizGalleryPage />} />
                    <Route path="games" element={<GamesPage />} />
                    <Route path="labs" element={<LabsPage />} />
                    <Route path="asteroids-la" element={<AsteroidsLAPage />} />
                    <Route path="vector-command" element={<VectorCommandPage />} />
                    <Route path="card-academy" element={<CardAcademyPage />} />
                    <Route path="card-quest" element={<CardQuestPage />} />
                    <Route path="stem-tetris" element={<StemTetrisPage />} />
                    <Route path="health" element={<HealthTrackerPage />} />
                    <Route path="rpg-workout" element={<RPGWorkoutPage />} />
                    <Route path="brain" element={<BrainPage />} />
                    <Route path="rubiks-cube" element={<RubiksCubePage />} />
                    <Route path="matrix-game" element={<MatrixGamePage />} />
                    <Route path="robot-arm-lab" element={<RobotArmLabPage />} />
                    <Route path="drone-lab" element={<DroneLabPage />} />
                    <Route path="sim-lab" element={<SimLabPage />} />
                    
                    {/* Web Learn Curriculums */}
                    <Route path="web-learn/:series/:lessonId" element={<WebLearnPage />} />
                    <Route path="web-learn/:series" element={<WebLearnPage />} />
                    
                    <Route path="matrix-lab" element={<MatrixLabPage />} />
                    <Route path="matrix-3d-lab" element={<Matrix3DLabPage />} />
                    <Route path="decomp-lab" element={<DecompLabPage />} />
                    <Route path="cmm-lab" element={<CmmLabPage />} />
                    <Route path="five-axis" element={<FiveAxisKinematicsPage />} />
                    <Route path="odds-lab" element={<OddsLabPage />} />
                    <Route path="dsa-arrays-lab" element={<DSAArraysLabPage />} />
                    <Route path="dsa-linked-lists-lab" element={<DSALinkedListsLabPage />} />
                    <Route path="plc-lab" element={<PLCLabPage />} />
                    <Route path="matrix-reducer" element={<MatrixReducerPage />} />
                    <Route path="codelens" element={<CodeLensPage />} />
                    <Route path="learn/:series/:lessonId" element={<LearnPage />} />
                    <Route path="learn/:series" element={<LearnPage />} />
                  </Routes>
                </Suspense>
              </AppShell>
            </HashRouter>
          </VideoPlayerProvider>
        </PinsProvider>
      </SearchProvider>
    </ProgressProvider>
    </AuthProvider>
  );
}
