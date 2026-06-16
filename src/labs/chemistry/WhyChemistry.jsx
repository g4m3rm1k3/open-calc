import ScienceNotebook from '../../courses/chemistry/viz/ScienceNotebook.jsx'
import { LESSON_CHEM_1_0 } from '../../../courses/chemistry/1-elements-atomic-structure/001-lesson1-0.js'

export default function WhyChemistry({ params }) {
  return <ScienceNotebook lesson={LESSON_CHEM_1_0} params={params} />
}
