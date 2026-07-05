import ScienceNotebook from '../../geometry/viz/ScienceNotebook.jsx'
import { LESSON_CHEM_1_1 } from '../1-elements-atomic-structure/002-what-is-an-atom.js'

export default function WhatIsAnAtom({ params }) {
  return <ScienceNotebook lesson={LESSON_CHEM_1_1} params={params} />
}
