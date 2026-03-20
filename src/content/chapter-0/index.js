import realNumbers from './00-real-numbers.js'
import functions from './01-functions.js'
import trigReview from './02-trig-review.js'
import exponentials from './03-exponentials.js'

export default {
  id: 'chapter-0',
  number: 0,
  title: 'Prerequisites',
  slug: 'prerequisites',
  description: 'The mathematical toolkit you need before calculus — real numbers, functions, trigonometry, and exponentials. Even if you\'ve seen these before, the intuition here will make calculus smoother.',
  color: 'slate',
  lessons: [realNumbers, functions, trigReview, exponentials],
}
