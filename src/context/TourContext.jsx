import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COURSES } from '../courses/index.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

const TourContext = createContext(null)
export const useTour = () => useContext(TourContext)

export const TOUR_SEEN_KEY = 'oc-tour-seen'

function buildSteps(isMobile) {
  const tutorTarget = isMobile ? '[data-tour="stem-tutor-mobile"]' : '[data-tour="stem-tutor"]'

  const steps = [
    {
      id: 'greeting',
      target: tutorTarget,
      title: "Hi, I'm Delta!",
      body: 'Welcome to UpSkillOS — want me to show you around?',
      greeting: true, // renders the 3-way greeting UI instead of Next/Skip
    },
    {
      id: 'explore',
      target: isMobile ? '[data-tour="explore-mobile"]' : '[data-tour="start-menu"]',
      title: 'Courses, Labs, and Games',
      body: isMobile
        ? 'Tap Explore to browse every course — pre-calc through CNC machining.'
        : 'Click Start to browse Courses, Labs, and Games. Labs are hands-on sandboxes (CNC sim, circuits, chemistry); Courses are structured lessons.',
    },
    isMobile
      ? {
          id: 'mobile-tools',
          target: '[data-tour="mobile-tools-btn"]',
          title: 'Report a bug, or help build a lesson',
          body: "Tap Tools any time to report something broken, or open the Lesson Builder — anyone can write a lesson and submit it as a real GitHub pull request, no setup required.",
        }
      : {
          id: 'report-bug',
          target: '[data-tour="report-bug"]',
          title: 'See something broken?',
          body: 'Report it right here — it goes straight into the tracker, no email needed.',
        },
  ]

  if (!isMobile) {
    steps.push({
      id: 'lesson-builder',
      target: '[data-tour="start-menu"]',
      title: 'Built by the community, not one person',
      body: 'Open Start → Lesson Builder · Contribute to write a lesson and submit it as a real GitHub pull request, no local setup required.',
    })
  }

  steps.push({
    id: 'farewell',
    target: tutorTarget,
    title: "That's the tour!",
    body: "I'm always here if you need me. Click this button any time. — Delta",
    isLast: true,
  })

  return steps
}

export function TourProvider({ children }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const steps = useMemo(() => buildSteps(isMobile), [isMobile])

  const startTour = useCallback(() => {
    setStepIndex(0)
    setActive(true)
  }, [])

  const endTour = useCallback(() => {
    setActive(false)
    localStorage.setItem(TOUR_SEEN_KEY, '1')
  }, [])

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= steps.length) {
        endTour()
        return i
      }
      return i + 1
    })
  }, [steps.length, endTour])

  // Quick-reply branch from the greeting step: simple keyword match against
  // real course labels rather than a full NLU round-trip for what's really
  // just a navigation shortcut.
  const askQuestion = useCallback((text) => {
    const q = text.toLowerCase()
    const match = COURSES.find((c) => q.includes(c.label.toLowerCase().split(' ')[0]))
    endTour()
    if (match) navigate(match.path)
  }, [navigate, endTour])

  const value = useMemo(() => ({
    active,
    step: steps[stepIndex],
    stepIndex,
    totalSteps: steps.length,
    startTour,
    endTour,
    next,
    askQuestion,
  }), [active, steps, stepIndex, startTour, endTour, next, askQuestion])

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}
