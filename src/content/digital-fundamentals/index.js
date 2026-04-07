import lesson1_0 from './lesson1-0.js'
import lesson1_1 from './lesson1-1.js'
import lesson1_2 from './lesson1-2.js'
import lesson1_3 from './lesson1-3.js'
import lesson1_4 from './lesson1-4.js'
import lesson2_0 from './lesson2-0.js'
import lesson2_1 from './lesson2-1.js'

const DF_CH1 = {
  title: 'Signals, Binary & Data',
  number: 'df.1',
  slug: 'df-signals-binary-and-data',
  description: 'From continuous analog signals to discrete binary representation — the foundations of all digital systems.',
  course: 'digital-fundamentals',
  lessons: [lesson1_0, lesson1_1, lesson1_2, lesson1_3, lesson1_4],
}

const DF_CH2 = {
  title: 'Number Representation and Arithmetic',
  number: 'df.2',
  slug: 'df-number-representation-and-arithmetic',
  description: 'How computers add, subtract, and represent negative numbers — two\'s complement, ripple-carry adders, and overflow.',
  course: 'digital-fundamentals',
  lessons: [lesson2_1, lesson2_0],
}

export default [DF_CH1, DF_CH2]
