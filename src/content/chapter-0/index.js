import realNumbers from './00-real-numbers.js'
import setsAndLogic from './00a-sets-and-logic.js'
import geometryReview from './00b-geometry-review.js'
import inequalities from './00c-inequalities.js'
import absoluteValue from './01a-absolute-value.js'
import algebraicTechniques from './01b-algebraic-techniques.js'
import polynomialDivision from './01c-polynomial-division.js'
import completingTheSquare from './01d-completing-the-square.js'
import partialFractionsIntro from './01e-partial-fractions-intro.js'
import functions from './01-functions.js'
import trigReview from './02-trig-review.js'
import exponentials from './03-exponentials.js'
import integratedReview from './04-integrated-review.js'
import assignmentPlaybook from './05-assignment-playbook.js'

export default {
  id: 'chapter-0',
  number: 0,
  title: 'Prerequisites',
  slug: 'prerequisites',
  description: 'The mathematical toolkit you need before calculus — real numbers, functions, trigonometry, and exponentials. Even if you\'ve seen these before, the intuition here will make calculus smoother.',
  color: 'slate',
  lessons: [
    realNumbers,
    setsAndLogic,
    geometryReview,
    inequalities,
    absoluteValue,
    algebraicTechniques,
    polynomialDivision,
    completingTheSquare,
    partialFractionsIntro,
    functions,
    trigReview,
    exponentials,
    integratedReview,
    assignmentPlaybook,
  ],
}
