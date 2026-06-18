import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WebLessonPlayer from './WebLessonPlayer.jsx'

import { lesson as rs1 } from './react-s01.js'
import { lesson as rs2 } from './react-s02.js'
import { lesson as rs3 } from './react-s03.js'
import { lesson as r01 } from './react-01-jsx.js'
import { lesson as r02 } from './react-02-components.js'
import { lesson as r03 } from './react-03-props.js'
import { lesson as r04 } from './react-04-lists-keys.js'
import { lesson as r05 } from './react-05-usestate.js'
import { lesson as r06 } from './react-06-events.js'
import { lesson as r07 } from './react-07-controlled-inputs.js'
import { lesson as r08 } from './react-08-conditional-rendering.js'
import { lesson as r09 } from './react-09-lifting-state.js'
import { lesson as r10 } from './react-10-useeffect.js'
import { lesson as r11 } from './react-11-fetching-data.js'
import { lesson as r12 } from './react-12-effect-cleanup.js'
import { lesson as r13 } from './react-13-useref.js'
import { lesson as r14 } from './react-14-custom-hooks.js'
import { lesson as r15 } from './react-15-context.js'
import { lesson as r16 } from './react-16-usereducer.js'
import { lesson as r17 } from './react-17-memo.js'
import { lesson as r18 } from './react-18-usememo-callback.js'
import { lesson as r19 } from './react-19-reconciliation.js'
import { lesson as r20 } from './react-20-forms.js'
import { lesson as r21 } from './react-21-compound-components.js'
import { lesson as r22 } from './react-22-data-patterns.js'
import { lesson as r23 } from './react-23-context-reducer.js'
import { lesson as r24 } from './react-24-suspense-lazy.js'

const ORDER = ['s1','s2','s3','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24']
const LESSONS = {
  's1':rs1,'s2':rs2,'s3':rs3,
  '01':r01,'02':r02,'03':r03,'04':r04,'05':r05,'06':r06,'07':r07,'08':r08,
  '09':r09,'10':r10,'11':r11,'12':r12,'13':r13,'14':r14,'15':r15,'16':r16,
  '17':r17,'18':r18,'19':r19,'20':r20,'21':r21,'22':r22,'23':r23,'24':r24,
}

export default function ReactMasteryPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!lessonId) navigate('/web-learn/react-mastery/s1', { replace: true })
  }, [lessonId, navigate])

  const lesson = LESSONS[lessonId]
  if (!lesson) return null

  const idx = ORDER.indexOf(lessonId)
  const nextId = idx !== -1 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null
  const seriesLessons = ORDER.map(id => ({
    id, title: LESSONS[id]?.title ?? id,
    path: `/web-learn/react-mastery/${id}`,
    active: id === lessonId,
  }))

  return (
    <WebLessonPlayer
      key={lesson.id}
      lesson={lesson}
      onBack={() => navigate('/labs')}
      onNext={nextId ? () => navigate(`/web-learn/react-mastery/${nextId}`) : null}
      nextTitle={nextId ? LESSONS[nextId]?.title : null}
      seriesLessons={seriesLessons}
      onJumpToLesson={(path) => navigate(path)}
    />
  )
}
