import { useEffect, useState } from 'react'
import { buildOptionalBackendUrl, mergeLessonOverride } from '../utils/optionalBackend.js'

export function useOptionalLesson(lessonKey, builtInLesson) {
  const [state, setState] = useState({
    isLoadingOverride: false,
    lessonOverride: builtInLesson,
    lessonSource: 'built-in',
  })

  useEffect(() => {
    let cancelled = false

    if (!lessonKey || !builtInLesson) {
      setState({
        isLoadingOverride: false,
        lessonOverride: builtInLesson,
        lessonSource: 'built-in',
      })
      return () => {
        cancelled = true
      }
    }

    setState({
      isLoadingOverride: true,
      lessonOverride: builtInLesson,
      lessonSource: 'built-in',
    })

    fetch(buildOptionalBackendUrl('/api/lesson-override', { key: lessonKey }))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Backend responded with ${response.status}`)
        }
        return response.json()
      })
      .then((payload) => {
        if (cancelled) return
        if (payload?.override) {
          setState({
            isLoadingOverride: false,
            lessonOverride: mergeLessonOverride(builtInLesson, payload.override),
            lessonSource: 'override',
          })
          return
        }
        setState({
          isLoadingOverride: false,
          lessonOverride: builtInLesson,
          lessonSource: 'built-in',
        })
      })
      .catch(() => {
        if (cancelled) return
        setState({
          isLoadingOverride: false,
          lessonOverride: builtInLesson,
          lessonSource: 'built-in',
        })
      })

    return () => {
      cancelled = true
    }
  }, [lessonKey, builtInLesson])

  return state
}
