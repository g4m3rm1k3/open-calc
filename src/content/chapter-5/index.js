import algebraGeometryMasterReview from './00-algebra-geometry-master-review.js'
import sequences from './00-sequences.js'
import seriesIntro from './01-series-intro.js'
import convergenceTests from './02-convergence-tests.js'
import powerSeries from './03-power-series.js'
import taylorMaclaurin from './04-taylor-maclaurin.js'

export default {
  id: 'chapter-5',
  number: 5,
  title: 'Calc 2 Bridge: Sequences, Series & Beyond',
  slug: 'calc-2-bridge',
  description: 'Your complete bridge from Calc 1 to rigorous Calc 2. Starts with an algebra and geometry master review, then builds systematically: sequences, series, convergence tests, power series, and Taylor/Maclaurin — everything you need to ace the hardest Calc 2 course.',
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
