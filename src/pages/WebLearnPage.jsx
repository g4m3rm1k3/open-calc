import { Suspense, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WebLessonPlayer from '../components/learn/WebLessonPlayer.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

// Lesson registry — add new lessons here
import { lesson as sandbox1 } from '../data/learn/sandbox/lesson-01.js'
import { lesson as sandbox2 } from '../data/learn/sandbox/lesson-02.js'
import { lesson as sandbox3 } from '../data/learn/sandbox/lesson-03.js'

// CSS Mastery lessons
import { lesson as css01 } from '../content/css-mastery/css-01-normal-flow.js'
import { lesson as css02 } from '../content/css-mastery/css-02-box-model.js'
import { lesson as css03 } from '../content/css-mastery/css-03-centering.js'
import { lesson as css04 } from '../content/css-mastery/css-04-stacking-contexts.js'
import { lesson as css05 } from '../content/css-mastery/css-05-overflow.js'
import { lesson as css06 } from '../content/css-mastery/css-06-flex-direction.js'
import { lesson as css07 } from '../content/css-mastery/css-07-flex-alignment.js'
import { lesson as css08 } from '../content/css-mastery/css-08-flex-sizing.js'
import { lesson as css09 } from '../content/css-mastery/css-09-grid-tracks.js'
import { lesson as css10 } from '../content/css-mastery/css-10-grid-areas.js'
import { lesson as css11 } from '../content/css-mastery/css-11-grid-vs-flex.js'
import { lesson as css12 } from '../content/css-mastery/css-12-viewport.js'
import { lesson as css13 } from '../content/css-mastery/css-13-media-queries.js'
import { lesson as css14 } from '../content/css-mastery/css-14-fluid-typography.js'
import { lesson as css15 } from '../content/css-mastery/css-15-responsive-images.js'
import { lesson as css16 } from '../content/css-mastery/css-16-container-queries.js'
import { lesson as css17 } from '../content/css-mastery/css-17-transitions.js'
import { lesson as css18 } from '../content/css-mastery/css-18-animations.js'
import { lesson as css19 } from '../content/css-mastery/css-19-animation-performance.js'
import { lesson as css20 } from '../content/css-mastery/css-20-scroll-driven.js'
import { lesson as css21 } from '../content/css-mastery/css-21-specificity.js'
import { lesson as css22 } from '../content/css-mastery/css-22-variables.js'
import { lesson as css23 } from '../content/css-mastery/css-23-cascade-layers.js'
import { lesson as css24 } from '../content/css-mastery/css-24-selector-scope.js'
import { lesson as css25 } from '../content/css-mastery/css-25-native-html.js'
import { lesson as css26 } from '../content/css-mastery/css-26-class-toggling.js'
import { lesson as css27 } from '../content/css-mastery/css-27-inline-styles-js.js'
import { lesson as css28 } from '../content/css-mastery/css-28-variables-js.js'
import { lesson as css29 } from '../content/css-mastery/css-29-scroll-observers.js'

// React Mastery lessons
import { lesson as react01 } from '../content/react-mastery/react-01-jsx.js'
import { lesson as react02 } from '../content/react-mastery/react-02-components.js'
import { lesson as react03 } from '../content/react-mastery/react-03-props.js'
import { lesson as react04 } from '../content/react-mastery/react-04-lists-keys.js'
import { lesson as react05 } from '../content/react-mastery/react-05-usestate.js'
import { lesson as react06 } from '../content/react-mastery/react-06-events.js'
import { lesson as react07 } from '../content/react-mastery/react-07-controlled-inputs.js'
import { lesson as react08 } from '../content/react-mastery/react-08-conditional-rendering.js'
import { lesson as react09 } from '../content/react-mastery/react-09-lifting-state.js'
import { lesson as react10 } from '../content/react-mastery/react-10-useeffect.js'
import { lesson as react11 } from '../content/react-mastery/react-11-fetching-data.js'
import { lesson as react12 } from '../content/react-mastery/react-12-effect-cleanup.js'
import { lesson as react13 } from '../content/react-mastery/react-13-useref.js'
import { lesson as react14 } from '../content/react-mastery/react-14-custom-hooks.js'
import { lesson as react15 } from '../content/react-mastery/react-15-context.js'
import { lesson as react16 } from '../content/react-mastery/react-16-usereducer.js'
import { lesson as react17 } from '../content/react-mastery/react-17-memo.js'
import { lesson as react18 } from '../content/react-mastery/react-18-usememo-callback.js'
import { lesson as react19 } from '../content/react-mastery/react-19-reconciliation.js'
import { lesson as react20 } from '../content/react-mastery/react-20-forms.js'
import { lesson as react21 } from '../content/react-mastery/react-21-compound-components.js'
import { lesson as react22 } from '../content/react-mastery/react-22-data-patterns.js'
import { lesson as react23 } from '../content/react-mastery/react-23-context-reducer.js'
import { lesson as react24 } from '../content/react-mastery/react-24-suspense-lazy.js'

const LESSONS = {
  'sandbox/1': sandbox1,
  'sandbox/2': sandbox2,
  'sandbox/3': sandbox3,
  'css-mastery/01': css01,
  'css-mastery/02': css02,
  'css-mastery/03': css03,
  'css-mastery/04': css04,
  'css-mastery/05': css05,
  'css-mastery/06': css06,
  'css-mastery/07': css07,
  'css-mastery/08': css08,
  'css-mastery/09': css09,
  'css-mastery/10': css10,
  'css-mastery/11': css11,
  'css-mastery/12': css12,
  'css-mastery/13': css13,
  'css-mastery/14': css14,
  'css-mastery/15': css15,
  'css-mastery/16': css16,
  'css-mastery/17': css17,
  'css-mastery/18': css18,
  'css-mastery/19': css19,
  'css-mastery/20': css20,
  'css-mastery/21': css21,
  'css-mastery/22': css22,
  'css-mastery/23': css23,
  'css-mastery/24': css24,
  'css-mastery/25': css25,
  'css-mastery/26': css26,
  'css-mastery/27': css27,
  'css-mastery/28': css28,
  'css-mastery/29': css29,
  'react-mastery/01': react01,
  'react-mastery/02': react02,
  'react-mastery/03': react03,
  'react-mastery/04': react04,
  'react-mastery/05': react05,
  'react-mastery/06': react06,
  'react-mastery/07': react07,
  'react-mastery/08': react08,
  'react-mastery/09': react09,
  'react-mastery/10': react10,
  'react-mastery/11': react11,
  'react-mastery/12': react12,
  'react-mastery/13': react13,
  'react-mastery/14': react14,
  'react-mastery/15': react15,
  'react-mastery/16': react16,
  'react-mastery/17': react17,
  'react-mastery/18': react18,
  'react-mastery/19': react19,
  'react-mastery/20': react20,
  'react-mastery/21': react21,
  'react-mastery/22': react22,
  'react-mastery/23': react23,
  'react-mastery/24': react24,
}

// Ordered series list — drives "Next lesson" button
const SERIES_ORDER = {
  sandbox: ['1', '2', '3'],
  'css-mastery': [
    '01', '02', '03', '04', '05',
    '06', '07', '08', '09', '10', '11',
    '12', '13', '14', '15', '16',
    '17', '18', '19', '20',
    '21', '22', '23', '24', '25',
    '26', '27', '28', '29',
  ],
  'react-mastery': [
    '01', '02', '03', '04',
    '05', '06', '07', '08', '09',
    '10', '11', '12',
    '13', '14', '15', '16',
    '17', '18', '19',
    '20', '21', '22', '23', '24',
  ],
}

// First lesson per series — used for redirect when no lessonId in URL
const SERIES_FIRST = {
  sandbox: '1',
  'css-mastery': '01',
  'react-mastery': '01',
}

export default function WebLearnPage() {
  const { series, lessonId } = useParams()
  const navigate = useNavigate()

  // Redirect /web-learn/:series → /web-learn/:series/first-lesson
  useEffect(() => {
    if (series && !lessonId) {
      const first = SERIES_FIRST[series]
      if (first) navigate(`/web-learn/${series}/${first}`, { replace: true })
    }
  }, [series, lessonId, navigate])

  const key = series && lessonId ? `${series}/${lessonId}` : null
  const lesson = key ? LESSONS[key] : null

  if (!lesson) {
    if (series && !lessonId) return null // redirecting
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#08111f] text-slate-400 gap-4">
        <p className="text-lg">Web Lesson not found: {key}</p>
        <button
          onClick={() => navigate('/labs')}
          className="text-sm text-cyan-500 hover:text-cyan-400"
        >
          Return to Labs
        </button>
      </div>
    )
  }

  // Determine next lesson in the series
  const seriesOrder = SERIES_ORDER[series] || []
  const currentIndex = seriesOrder.indexOf(lessonId)
  const nextId = currentIndex !== -1 && currentIndex < seriesOrder.length - 1
    ? seriesOrder[currentIndex + 1]
    : null
  
  const nextPath = nextId ? `/web-learn/${series}/${nextId}` : null

  // Build series metadata for the dropdown menu
  const seriesLessons = seriesOrder.map(id => {
    const l = LESSONS[`${series}/${id}`]
    return {
      id,
      title: l?.title ?? id,
      path: `/web-learn/${series}/${id}`,
      active: id === lessonId
    }
  })

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#08111f]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <WebLessonPlayer
        key={lesson.id}
        lesson={lesson}
        onBack={() => navigate('/labs')}
        onNext={nextPath ? () => navigate(nextPath) : null}
        nextTitle={nextId ? (LESSONS[`${series}/${nextId}`]?.title ?? null) : null}
        seriesLessons={seriesLessons}
        onJumpToLesson={(path) => navigate(path)}
      />
    </Suspense>
  )
}
