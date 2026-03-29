import { HashRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProgressProvider } from './context/ProgressContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import { PinsProvider } from './context/PinsContext.jsx'
import AppShell from './components/layout/AppShell.jsx'
import { VideoPlayerProvider } from './context/VideoPlayerContext.jsx'
import FloatingVideoPlayer from './components/videos/FloatingVideoPlayer.jsx'
import ContributingModal from './components/ui/ContributingModal.jsx'
import LoadingSpinner from './components/ui/LoadingSpinner.jsx'

const HomePage    = lazy(() => import('./pages/HomePage.jsx'))
const ChapterPage = lazy(() => import('./pages/ChapterPage.jsx'))
const LessonPage  = lazy(() => import('./pages/LessonPage.jsx'))
const SearchPage  = lazy(() => import('./pages/SearchPage.jsx'))
const AboutPage   = lazy(() => import('./pages/AboutPage.jsx'))
const LearningPathsPage = lazy(() => import('./pages/LearningPathsPage.jsx'))
const ReferencePage     = lazy(() => import('./pages/ReferencePage.jsx'))
const UniversalCalcPage = lazy(() => import('./pages/UniversalCalcPage.jsx'))

const Fallback = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" />
  </div>
)

export default function App() {
  return (
    <ProgressProvider>
      <SearchProvider>
        <PinsProvider>
          <VideoPlayerProvider>
            <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <FloatingVideoPlayer />
              <ContributingModal />
              <AppShell>
                <Suspense fallback={<Fallback />}>
                  <Routes>
                    <Route index element={<HomePage />} />
                    <Route path="chapter/:chapterId" element={<ChapterPage />} />
                    <Route path="chapter/:chapterId/:lessonSlug" element={<LessonPage />} />
                    <Route path="chapter/:chapterId/:lessonSlug/*" element={<LessonPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="paths" element={<LearningPathsPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="reference" element={<ReferencePage />} />
                    <Route path="universal-calc" element={<UniversalCalcPage />} />
                  </Routes>
                </Suspense>
              </AppShell>
            </HashRouter>
          </VideoPlayerProvider>
        </PinsProvider>
      </SearchProvider>
    </ProgressProvider>
  )
}
