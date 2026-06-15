import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WebLessonPlayer from '../../engines/lesson/WebLessonPlayer.jsx'

import { lesson as css01 } from '../../content/css-mastery/css-01-normal-flow.js'
import { lesson as css02 } from '../../content/css-mastery/css-02-box-model.js'
import { lesson as css03 } from '../../content/css-mastery/css-03-centering.js'
import { lesson as css04 } from '../../content/css-mastery/css-04-stacking-contexts.js'
import { lesson as css05 } from '../../content/css-mastery/css-05-overflow.js'
import { lesson as css06 } from '../../content/css-mastery/css-06-flex-direction.js'
import { lesson as css07 } from '../../content/css-mastery/css-07-flex-alignment.js'
import { lesson as css08 } from '../../content/css-mastery/css-08-flex-sizing.js'
import { lesson as css09 } from '../../content/css-mastery/css-09-grid-tracks.js'
import { lesson as css10 } from '../../content/css-mastery/css-10-grid-areas.js'
import { lesson as css11 } from '../../content/css-mastery/css-11-grid-vs-flex.js'
import { lesson as css12 } from '../../content/css-mastery/css-12-viewport.js'
import { lesson as css13 } from '../../content/css-mastery/css-13-media-queries.js'
import { lesson as css14 } from '../../content/css-mastery/css-14-fluid-typography.js'
import { lesson as css15 } from '../../content/css-mastery/css-15-responsive-images.js'
import { lesson as css16 } from '../../content/css-mastery/css-16-container-queries.js'
import { lesson as css17 } from '../../content/css-mastery/css-17-transitions.js'
import { lesson as css18 } from '../../content/css-mastery/css-18-animations.js'
import { lesson as css19 } from '../../content/css-mastery/css-19-animation-performance.js'
import { lesson as css20 } from '../../content/css-mastery/css-20-scroll-driven.js'
import { lesson as css21 } from '../../content/css-mastery/css-21-specificity.js'
import { lesson as css22 } from '../../content/css-mastery/css-22-variables.js'
import { lesson as css23 } from '../../content/css-mastery/css-23-cascade-layers.js'
import { lesson as css24 } from '../../content/css-mastery/css-24-selector-scope.js'
import { lesson as css25 } from '../../content/css-mastery/css-25-native-html.js'
import { lesson as css26 } from '../../content/css-mastery/css-26-class-toggling.js'
import { lesson as css27 } from '../../content/css-mastery/css-27-inline-styles-js.js'
import { lesson as css28 } from '../../content/css-mastery/css-28-variables-js.js'
import { lesson as css29 } from '../../content/css-mastery/css-29-scroll-observers.js'

const ORDER = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29']
const LESSONS = { '01':css01,'02':css02,'03':css03,'04':css04,'05':css05,'06':css06,'07':css07,'08':css08,'09':css09,'10':css10,'11':css11,'12':css12,'13':css13,'14':css14,'15':css15,'16':css16,'17':css17,'18':css18,'19':css19,'20':css20,'21':css21,'22':css22,'23':css23,'24':css24,'25':css25,'26':css26,'27':css27,'28':css28,'29':css29 }

export default function CSSMasteryPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!lessonId) navigate('/web-learn/css-mastery/01', { replace: true })
  }, [lessonId, navigate])

  const lesson = LESSONS[lessonId]
  if (!lesson) return null

  const idx = ORDER.indexOf(lessonId)
  const nextId = idx !== -1 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null
  const seriesLessons = ORDER.map(id => ({
    id, title: LESSONS[id]?.title ?? id,
    path: `/web-learn/css-mastery/${id}`,
    active: id === lessonId,
  }))

  return (
    <WebLessonPlayer
      key={lesson.id}
      lesson={lesson}
      onBack={() => navigate('/labs')}
      onNext={nextId ? () => navigate(`/web-learn/css-mastery/${nextId}`) : null}
      nextTitle={nextId ? LESSONS[nextId]?.title : null}
      seriesLessons={seriesLessons}
      onJumpToLesson={(path) => navigate(path)}
    />
  )
}
