import { Suspense, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LessonPlayer from './LessonPlayer.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'

import { lesson as d01 } from './lessons/lesson-01.js'
import { lesson as d02 } from './lessons/lesson-02.js'
import { lesson as d03 } from './lessons/lesson-03.js'
import { lesson as d04 } from './lessons/lesson-04.js'
import { lesson as d05 } from './lessons/lesson-05.js'
import { lesson as d06 } from './lessons/lesson-06.js'
import { lesson as d07 } from './lessons/lesson-07.js'
import { lesson as d08 } from './lessons/lesson-08.js'
import { lesson as d09 } from './lessons/lesson-09.js'
import { lesson as d10 } from './lessons/lesson-10.js'
import { lesson as d11 } from './lessons/lesson-11.js'
import { lesson as d12 } from './lessons/lesson-12.js'
import { lesson as d13 } from './lessons/lesson-13.js'
import { lesson as d14 } from './lessons/lesson-14.js'
import { lesson as d15 } from './lessons/lesson-15.js'
import { lesson as d16 } from './lessons/lesson-16.js'
import { lesson as d17 } from './lessons/lesson-17.js'
import { lesson as d18 } from './lessons/lesson-18.js'
import { lesson as d19 } from './lessons/lesson-19.js'
import { lesson as d20 } from './lessons/lesson-20.js'
import { lesson as d21 } from './lessons/lesson-21.js'
import { lesson as d22 } from './lessons/lesson-22.js'
import { lesson as d23 } from './lessons/lesson-23.js'
import { lesson as d24 } from './lessons/lesson-24.js'
import { lesson as d25 } from './lessons/lesson-25.js'
import { lesson as d26 } from './lessons/lesson-26.js'
import { lesson as d27 } from './lessons/lesson-27.js'
import { lesson as d28 } from './lessons/lesson-28.js'
import { lesson as d29 } from './lessons/lesson-29.js'
import { lesson as d30 } from './lessons/lesson-30.js'
import { lesson as d31 } from './lessons/lesson-31.js'
import { lesson as d32 } from './lessons/lesson-32.js'
import { lesson as d33 } from './lessons/lesson-33.js'
import { lesson as d34 } from './lessons/lesson-34.js'
import { lesson as d35 } from './lessons/lesson-35.js'
import { lesson as d36 } from './lessons/lesson-36.js'
import { lesson as d37 } from './lessons/lesson-37.js'
import { lesson as d38 } from './lessons/lesson-38.js'
import { lesson as d39 } from './lessons/lesson-39.js'
import { lesson as d40 } from './lessons/lesson-40.js'
import { lesson as d41 } from './lessons/lesson-41.js'
import { lesson as d42 } from './lessons/lesson-42.js'

const ORDER = [
  '01','02','03','04','05','06','07','08','09','10',
  '11','12','13','14','15','16','17','18','19','20',
  '21','22','23','24','25','26','27','28','29','30',
  '31','32','33','34','35','36','37','38','39','40',
  '41','42',
]

const LESSONS = {
  '01':d01,'02':d02,'03':d03,'04':d04,'05':d05,'06':d06,'07':d07,'08':d08,'09':d09,'10':d10,
  '11':d11,'12':d12,'13':d13,'14':d14,'15':d15,'16':d16,'17':d17,'18':d18,'19':d19,'20':d20,
  '21':d21,'22':d22,'23':d23,'24':d24,'25':d25,'26':d26,'27':d27,'28':d28,'29':d29,'30':d30,
  '31':d31,'32':d32,'33':d33,'34':d34,'35':d35,'36':d36,'37':d37,'38':d38,'39':d39,'40':d40,
  '41':d41,'42':d42,
}

export default function DSAPatternsPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!lessonId) navigate('/learn/dsa-patterns/01', { replace: true })
  }, [lessonId, navigate])

  const lesson = lessonId ? LESSONS[lessonId] : null

  if (!lesson) {
    if (!lessonId) return null
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#08111f] text-slate-400 gap-4">
        <p className="text-lg">Lesson not found: dsa-patterns/{lessonId}</p>
        <button onClick={() => navigate('/labs')} className="text-cyan-400 hover:text-cyan-300 text-sm underline">
          Back to Labs
        </button>
      </div>
    )
  }

  const idx = ORDER.indexOf(lessonId)
  const nextId = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null

  const seriesLessons = ORDER.map(id => ({
    id, title: LESSONS[id]?.title ?? id,
    path: `/learn/dsa-patterns/${id}`,
    active: id === lessonId,
  }))

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#08111f]"><LoadingSpinner size="lg" /></div>}>
      <LessonPlayer
        key={lesson.id}
        lesson={lesson}
        onBack={() => navigate('/labs')}
        onNext={nextId ? () => navigate(`/learn/dsa-patterns/${nextId}`) : null}
        nextTitle={nextId ? (LESSONS[nextId]?.title ?? null) : null}
        seriesLessons={seriesLessons}
        onJumpToLesson={(path) => navigate(path)}
      />
    </Suspense>
  )
}
