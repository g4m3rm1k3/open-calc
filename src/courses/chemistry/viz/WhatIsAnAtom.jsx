import ScienceNotebook from './ScienceNotebook.jsx'
import { LESSON_CHEM_1_1 } from '../1-elements-atomic-structure/002-lesson1-1.js'

export default function WhatIsAnAtom({ params }) {
  return <ScienceNotebook lesson={LESSON_CHEM_1_1} params={params} />
}
