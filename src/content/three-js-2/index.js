// Three.js 2 Course — Chapter Registry
// 14 lessons across 6 chapters

import lesson0_0, { LESSON_3JS2_0_0 } from './lesson0-0.js'
import lesson0_1, { LESSON_3JS2_0_1 } from './lesson0-1.js'

import lesson1_0, { LESSON_3JS2_1_0 } from './lesson1-0.js'
import lesson1_1, { LESSON_3JS2_1_1 } from './lesson1-1.js'

import lesson2_0, { LESSON_3JS2_2_0 } from './lesson2-0.js'
import lesson2_1, { LESSON_3JS2_2_1 } from './lesson2-1.js'

import lesson3_0, { LESSON_3JS2_3_0 } from './lesson3-0.js'
import lesson3_1, { LESSON_3JS2_3_1 } from './lesson3-1.js'

import lesson4_0, { LESSON_3JS2_4_0 } from './lesson4-0.js'
import lesson4_1, { LESSON_3JS2_4_1 } from './lesson4-1.js'
import lesson4_2, { LESSON_3JS2_4_2 } from './lesson4-2.js'

import lesson5_0, { LESSON_3JS2_5_0 } from './lesson5-0.js'
import lesson5_1, { LESSON_3JS2_5_1 } from './lesson5-1.js'
import lesson5_2, { LESSON_3JS2_5_2 } from './lesson5-2.js'

const CH0 = {
  title: 'Setup & Your First Scene',
  number: 'three-js-2.0',
  slug: 'threejs2-setup-first-scene',
  description: 'ES Modules, import maps, project structure — and the Renderer/Scene/Camera trinity that every Three.js program starts with.',
  course: 'three-js-2',
  lessons: [lesson0_0, lesson0_1],
}

const CH1 = {
  title: 'Geometry & Materials',
  number: 'three-js-2.1',
  slug: 'threejs2-geometry-materials',
  description: 'BufferGeometry internals — flat arrays, vertex attributes, winding order — and the full material spectrum from flat colour to PBR.',
  course: 'three-js-2',
  lessons: [lesson1_0, lesson1_1],
}

const CH2 = {
  title: 'Transforms & the Scene Graph',
  number: 'three-js-2.2',
  slug: 'threejs2-transforms-scene-graph',
  description: 'The 4×4 model matrix, Euler angles, gimbal lock, and the pivot-group pattern that makes hierarchical motion trivial.',
  course: 'three-js-2',
  lessons: [lesson2_0, lesson2_1],
}

const CH3 = {
  title: 'Lighting & Animation',
  number: 'three-js-2.3',
  slug: 'threejs2-lighting-animation',
  description: 'Light types, shadow maps from first principles, requestAnimationFrame, delta time, and fixed-timestep physics integration.',
  course: 'three-js-2',
  lessons: [lesson3_0, lesson3_1],
}

const CH4 = {
  title: 'Math, Vectors & Interaction',
  number: 'three-js-2.4',
  slug: 'threejs2-math-interaction',
  description: 'Vector3, Matrix4, quaternion slerp, planes, AABBs — the CAD math toolkit — plus raycasting and full mouse picking.',
  course: 'three-js-2',
  lessons: [lesson4_0, lesson4_1, lesson4_2],
}

const CH5 = {
  title: 'Curves, Surfaces & Project',
  number: 'three-js-2.5',
  slug: 'threejs2-curves-surfaces-project',
  description: 'Bézier and CatmullRom curves, the parametric surface builder, animated vertex deformation, and the complete Surface Explorer project.',
  course: 'three-js-2',
  lessons: [lesson5_0, lesson5_1, lesson5_2],
}

export default [CH0, CH1, CH2, CH3, CH4, CH5]
