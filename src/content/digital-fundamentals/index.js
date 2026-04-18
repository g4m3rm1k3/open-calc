import lesson1_0 from './lesson1-0.js'
import lesson1_1 from './lesson1-1.js'
import lesson1_2 from './lesson1-2.js'
import lesson1_3 from './lesson1-3.js'
import lesson1_4 from './lesson1-4.js'
import lesson2_0 from './lesson2-0.js'
import lesson2_1 from './lesson2-1.js'
import lesson2_2 from './lesson2-2.js'
import lesson3_0 from './lesson3-0.js'
import lesson3_1 from './lesson3-1.js'
import lesson3_2 from './lesson3-2.js'
import lesson3_4 from './lesson3-4.js'
import lesson3_5 from './lesson3-5.js'

import lesson4_1 from './df l4 1 booleanalgebra.js'
import lesson4_2 from './Df l4 2 harnaughmaps.js'
import lesson4_3 from './Df l4 3 circuitconversion.js'

import lesson5_1 from './Df l5 1 adders.js'
import lesson5_3 from './Df l5 3 muxdemux.js'
import lesson5_4 from './Df l5 4 decodersencoders.js'
import lesson5_5 from './Df l5 alu.js'

import lesson6_1 from './Df l6 1 latfchesflipflop.js'
import lesson6_2 from './Df l6 2 registershiftregulators.js'


const DF_CH1 = {
  title: 'Signals, Binary & Data',
  number: 'df.1',
  slug: 'df-signals-binary-and-data',
  description: 'From continuous analog signals to discrete binary representation — the foundations of all digital systems.',
  course: 'digital-fundamentals',
  lessons: [lesson1_0, lesson1_1, lesson1_3, lesson1_4],
}

const DF_CH2 = {
  title: 'Number Representation and Arithmetic',
  number: 'df.2',
  slug: 'df-number-representation-and-arithmetic',
  description: "How computers add, subtract, and represent negative numbers — two's complement, ripple-carry adders, and overflow.",
  course: 'digital-fundamentals',
  lessons: [lesson2_1, lesson1_2, lesson2_0, lesson2_2],
}

const DF_CH3 = {
  title: 'Boolean Logic & Gate Fundamentals',
  number: 'df.3',
  slug: 'df-boolean-logic-and-gates',
  description: 'AND, OR, and NOT — the three primitive operations that underpin every digital circuit ever built.',
  course: 'digital-fundamentals',
  lessons: [lesson3_0, lesson3_1, lesson3_2, lesson3_4, lesson3_5],
}

const DF_CH4 = {
  title: 'Boolean Algebra & Optimization',
  number: 'df.4',
  slug: 'df-boolean-algebra-and-optimization',
  description: 'Applying mathematical laws to simplify logic expressions and reduce gate count.',
  course: 'digital-fundamentals',
  lessons: [lesson4_1, lesson4_2, lesson4_3],
}

const DF_CH5 = {
  title: 'Combinational Logic Modules',
  number: 'df.5',
  slug: 'df-combinational-logic-modules',
  description: 'Building complex blocks from simple gates: adders, multiplexers, decoders, and ALUs.',
  course: 'digital-fundamentals',
  lessons: [lesson5_1, lesson5_3, lesson5_4, lesson5_5],
}

const DF_CH6 = {
  title: 'Sequential Logic & Storage',
  number: 'df.6',
  slug: 'df-sequential-logic-and-storage',
  description: 'Circuits with memory — latches, flip-flops, and registers that store state over time.',
  course: 'digital-fundamentals',
  lessons: [lesson6_1, lesson6_2],
}

export default [DF_CH1, DF_CH2, DF_CH3, DF_CH4, DF_CH5, DF_CH6]
