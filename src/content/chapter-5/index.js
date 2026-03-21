import algebraGeometryMasterReview from './00-algebra-geometry-master-review.js'
import sequences from './00-sequences.js'
import seriesIntro from './01-series-intro.js'
import convergenceTests from './02-convergence-tests.js'
import powerSeries from './03-power-series.js'
import taylorMaclaurin from './04-taylor-maclaurin.js'

export default {
  id: 'chapter-5',
  number: 5,
  title: 'Calc 2 Bridge',
  slug: 'calc-2-bridge',
  description: 'A full bridge from Calc 1 to rigorous Calc 2: master review, sequences, series, convergence tests, power series, and Taylor/Maclaurin methods.',
  color: 'stone',
  lessons: [
    algebraGeometryMasterReview,
    sequences,
    seriesIntro,
    convergenceTests,
    powerSeries,
    taylorMaclaurin,
  ],
}
