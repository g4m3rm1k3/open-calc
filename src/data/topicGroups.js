// Curated cross-registry topic groups for the home page's "Explore by Topic"
// section. Only `kind`/`key`/`differentiator` are stored here — cosmetic
// fields (emoji, color, tags, description) are resolved live from
// courseLoader.js / labs/registry.js / games/registry.js at render time
// (see TopicTable.jsx), so this file can never go stale relative to those
// registries. Keyed to match the existing discipline pill labels in
// HomePage.jsx (slugified) so clicking a pill finds its group directly —
// see src/docs/UpSkillOS work/ux-audit-heuristics-linear-algebra.md for the
// diagnosis the linear-algebra entry answers.
export const TOPIC_GROUPS = {
  'linear-algebra': {
    label: 'Linear Algebra',
    items: [
      { kind: 'course', key: 'linear-algebra',
        differentiator: 'Structured, sequential curriculum — start here for the full path from vectors to eigenvalues.' },
      { kind: 'lab', key: 'matrix-lab',
        differentiator: 'Code the algorithms yourself — row ops, elimination, determinants, inverse, Gram-Schmidt in JS, Python, or MATLAB.' },
      { kind: 'lab', key: 'matrix-3d-lab',
        differentiator: 'Visual, geometric 3D intuition — manipulate a live 4×4 transform and watch every entry update.' },
      { kind: 'lab', key: 'openmat',
        differentiator: 'A general computation engine — matrices are one small part of a bigger symbolic + numeric CAS.' },
      { kind: 'game', key: 'matrix-game',
        differentiator: 'Seven gamified interactive lessons — vectors, transforms, determinants, eigenvectors.' },
      { kind: 'game', key: 'asteroids-la',
        differentiator: 'Arcade application — velocity, dot products, and matrix transforms through ten waves of gameplay.' },
      { kind: 'game', key: 'vector-command',
        differentiator: '3D mission campaign — RREF, cross products, and integrals used to intercept targets.' },
    ],
  },
  'physics': {
    label: 'Physics',
    items: [
      { kind: 'course', key: 'physics',
        differentiator: 'Structured curriculum — kinematics, Newtonian mechanics, energy, momentum, and waves, in order.' },
      { kind: 'lab', key: 'sim-lab',
        differentiator: 'Build your own physics simulations from scratch — code it yourself in a Monaco editor with a live 3D sandbox.' },
      { kind: 'game', key: 'reality-runner',
        differentiator: 'Arcade runner — dodge and react to physics simulations in real time.' },
      { kind: 'game', key: 'basketball',
        differentiator: 'Apply trajectory and calculus to perfect your shot arc.' },
      { kind: 'game', key: 'pool',
        differentiator: 'Collision physics and bank angles, played out on the felt.' },
      { kind: 'game', key: 'golf',
        differentiator: 'Geometry and projectile motion, one putt at a time.' },
      { kind: 'game', key: 'football',
        differentiator: 'Integration and optimization applied to real routes and trajectories.' },
    ],
  },
  // Keyed to the existing "Computer Science" pill — Data Structures &
  // Algorithms is the first populated CS example, not the only one planned.
  'computer-science': {
    label: 'Data Structures & Algorithms',
    items: [
      { kind: 'course', key: 'data-structures-and-algorithms',
        differentiator: 'Structured curriculum covering arrays through graphs, in order.' },
      { kind: 'lesson', key: 'dsa-patterns',
        differentiator: 'Data structures and classic design patterns taught together as one guided lesson series.' },
      { kind: 'lab', key: 'dsa-arrays-lab',
        differentiator: 'Implement array operations yourself — get/insert/delete/search — with live memory visualization and a step tracer.' },
      { kind: 'lab', key: 'dsa-linked-lists-lab',
        differentiator: 'Build linked-list operations yourself — nodes, reverse, cycle detection — with animated pointer visualization.' },
    ],
  },
  // Keyed to the existing "Mathematics" pill — Probability/Statistics is
  // the first populated Math example (Linear Algebra already has its own
  // dedicated pill).
  'mathematics': {
    label: 'Probability & Statistics',
    items: [
      { kind: 'course', key: 'applied-statistics',
        differentiator: 'Structured curriculum — statistical thinking, probability, inference, and regression analysis, in order.' },
      { kind: 'lab', key: 'odds-lab',
        differentiator: 'Probability and card-counting practice with cards, dice, and blackjack decisions.' },
      { kind: 'game', key: 'card-quest',
        differentiator: 'Counting, probability, permutations, and stats — through cards and dice.' },
      { kind: 'game', key: 'card-academy',
        differentiator: 'Five card games teaching probability, statistics, and neuroscience through play.' },
    ],
  },
}

export function getTopicGroup(topicId) {
  return TOPIC_GROUPS[topicId] ?? null
}
