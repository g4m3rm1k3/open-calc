// Three.js Course — Full Chapter Registry
// seven chapters, 35 lessons total

import lesson0_0, { LESSON_3JS_0_0 } from './lesson0-0.js'
import lesson0_1, { LESSON_3JS_0_1 } from './lesson0-1.js'
import lesson0_2, { LESSON_3JS_0_2 } from './lesson0-2.js'
import lesson0_3, { LESSON_3JS_0_3 } from './lesson0-3.js'
import lesson0_4, { LESSON_3JS_0_4 } from './lesson0-4.js'

import lesson1_0, { LESSON_3JS_1_0 } from './lesson1-0.js'
import lesson1_1, { LESSON_3JS_1_1 } from './lesson1-1.js'
import lesson1_2, { LESSON_3JS_1_2 } from './lesson1-2.js'
import lesson1_3, { LESSON_3JS_1_3 } from './lesson1-3.js'
import lesson1_4, { LESSON_3JS_1_4 } from './lesson1-4.js'
import lesson1_5, { LESSON_3JS_1_5 } from './lesson1-5.js'

import lesson2_0, { LESSON_3JS_2_0 } from './lesson2-0.js'
import lesson2_1, { LESSON_3JS_2_1 } from './lesson2-1.js'
import lesson2_2, { LESSON_3JS_2_2 } from './lesson2-2.js'
import lesson2_3, { LESSON_3JS_2_3 } from './lesson2-3.js'
import lesson2_4, { LESSON_3JS_2_4 } from './lesson2-4.js'
import lesson3_0, { LESSON_3JS_3_0 } from './lesson3-0.js'
import lesson3_1, { LESSON_3JS_3_1 } from './lesson3-1.js'
import lesson3_2, { LESSON_3JS_3_2 } from './lesson3-2.js'
import lesson3_3, { LESSON_3JS_3_3 } from './lesson3-3.js'
import lesson4_0, { LESSON_3JS_4_0 } from './lesson4-0.js'
import lesson4_1, { LESSON_3JS_4_1 } from './lesson4-1.js'
import lesson4_2, { LESSON_3JS_4_2 } from './lesson4-2.js'
import lesson4_3, { LESSON_3JS_4_3 } from './lesson4-3.js'
import lesson4_4, { LESSON_3JS_4_4 } from './lesson4-4.js'
import lesson5_0, { LESSON_3JS_5_0 } from './lesson5-0.js'
import lesson5_1, { LESSON_3JS_5_1 } from './lesson5-1.js'
import lesson5_2, { LESSON_3JS_5_2 } from './lesson5-2.js'
import lesson5_3, { LESSON_3JS_5_3 } from './lesson5-3.js'
import lesson5_4, { LESSON_3JS_5_4 } from './lesson5-4.js'
import lesson6_0, { LESSON_3JS_6_0 } from './lesson6-0.js'
import lesson6_1, { LESSON_3JS_6_1 } from './lesson6-1.js'
import lesson6_2, { LESSON_3JS_6_2 } from './lesson6-2.js'
import lesson6_3, { LESSON_3JS_6_3 } from './lesson6-3.js'
import lesson6_4, { LESSON_3JS_6_4 } from './lesson6-4.js'

// ── Chapter definitions ───────────────────────────────────────────────────────

const CH0 = {
  title: 'Foundations',
  number: 'three-js.0',
  slug: 'three-js-foundations',
  description: 'GPU architecture, the rendering pipeline, vectors, matrices, and coordinate spaces — the mental models that underlie everything.',
  course: 'three-js-1',
  lessons: [lesson0_0, lesson0_1, lesson0_2, lesson0_3, lesson0_4],
}

const CH1 = {
  title: 'WebGL Core',
  number: 'three-js.1',
  slug: 'three-js-webgl-core',
  description: 'The raw WebGL pipeline from context setup to the MVP matrix — every line of the minimum viable renderer.',
  course: 'three-js-1',
  lessons: [lesson1_0, lesson1_1, lesson1_2, lesson1_3, lesson1_4, lesson1_5],
}

const CH2 = {
  title: 'Rendering Fundamentals',
  number: 'three-js.2',
  slug: 'three-js-rendering-fundamentals',
  description: 'Textures, coordinate systems in practice, camera systems, and colour — the core of a complete 3D renderer.',
  course: 'three-js-1',
  lessons: [lesson2_0, lesson2_1, lesson2_2, lesson2_3, lesson2_4],
}

const CH3 = {
  title: 'Lighting',
  number: 'three-js.3',
  slug: 'three-js-lighting',
  description: 'The Phong lighting model built from scratch, Blinn-Phong shading, materials — implemented in GLSL.',
  course: 'three-js-1',
  lessons: [lesson3_0, lesson3_1, lesson3_2, lesson3_3],
}

const CH4 = {
  title: 'Intermediate Graphics',
  number: 'three-js.4',
  slug: 'three-js-intermediate',
  description: 'Model loading, depth testing, transparency, framebuffers, and environment maps.',
  course: 'three-js-1',
  lessons: [lesson4_0, lesson4_1, lesson4_2, lesson4_3, lesson4_4],
}

const CH5 = {
  title: 'Advanced Techniques',
  number: 'three-js.5',
  slug: 'three-js-advanced',
  description: 'Shadows, normal maps, HDR, deferred rendering, and physically-based rendering.',
  course: 'three-js-1',
  lessons: [lesson5_0, lesson5_1, lesson5_2, lesson5_3, lesson5_4],
}

const CH6 = {
  title: 'Engine & Architecture',
  number: 'three-js.6',
  slug: 'three-js-engine-architecture',
  description: 'Scene graphs, ECS, resource management, render pass abstraction, and debugging at scale.',
  course: 'three-js-1',
  lessons: [lesson6_0, lesson6_1, lesson6_2, lesson6_3, lesson6_4],
}

export default [CH0, CH1, CH2, CH3, CH4, CH5, CH6]
