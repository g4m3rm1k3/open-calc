import ScienceNotebook from './ScienceNotebook.jsx'
import { LESSON_CHEM_1_0 } from '../../../content/chemistry-1/lesson1-0.js'

export default function WhyChemistry({ params }) {
  return <ScienceNotebook lesson={LESSON_CHEM_1_0} params={params} />
}
