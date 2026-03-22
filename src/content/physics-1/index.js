import CH0 from './chapter-0/index.js'

// Kinematics
const CH1 = {
  title: 'Kinematics: Motion without Forces',
  number: 'p1',
  slug: 'kinematics',
  lessons: [
    { title: 'Position & Trajectory', slug: 'position-displacement' },
    { title: 'Velocity Analysis', slug: 'velocity' },
    { title: 'Acceleration Analysis', slug: 'acceleration' },
    { title: 'Constant Acceleration Derivations', slug: 'constant-acceleration' },
    { title: 'Projectile Motion', slug: 'projectile-motion' },
  ],
}

// Newtonian Mechanics
const CH2 = {
  title: 'Newtonian Mechanics',
  number: 'p2',
  slug: 'mechanics',
  lessons: [
    { title: 'Newton\'s Laws', slug: 'newtons-laws' },
    { title: 'Free Body Diagrams', slug: 'fbd-skill' },
    { title: 'Common Forces', slug: 'common-forces' },
    { title: 'Inclined Planes', slug: 'inclined-planes' },
  ],
}

// Work & Energy
const CH3 = {
  title: 'Work & Energy',
  number: 'p3',
  slug: 'energy',
  lessons: [
    { title: 'Work In Context', slug: 'work-definition' },
    { title: 'Kinetic Energy & Derivation', slug: 'kinetic-energy' },
    { title: 'Potential Energy', slug: 'potential-energy' },
    { title: 'Conservation of Energy', slug: 'energy-conservation' },
    { title: 'Power', slug: 'power' },
  ],
}

// Momentum & Collisions
const CH4 = {
  title: 'Momentum & Collisions',
  number: 'p4',
  slug: 'momentum',
  lessons: [
    { title: 'Momentum (p = mv)', slug: 'momentum-definition' },
    { title: 'Impulse & Area', slug: 'impulse' },
    { title: 'Conservation of Momentum', slug: 'momentum-conservation' },
  ],
}

// Rotational Motion
const CH5 = {
  title: 'Rotational Motion',
  number: 'p5',
  slug: 'rotation',
  lessons: [
    { title: 'Angular Kinematics', slug: 'angular-kinematics' },
    { title: 'Torque & Leverage', slug: 'torque' },
    { title: 'Rotational Dynamics', slug: 'rotational-dynamics' },
    { title: 'Moment of Inertia', slug: 'moment-of-inertia' },
  ],
}

// Oscillations & Waves
const CH6 = {
  title: 'Oscillations & Waves',
  number: 'p6',
  slug: 'oscillations-waves',
  lessons: [
    { title: 'Hooke\'s Law', slug: 'hookes-law' },
    { title: 'Simple Harmonic Motion', slug: 'shm' },
    { title: 'Wave Properties', slug: 'wave-properties' },
    { title: 'The Wave Equation', slug: 'wave-equation' },
  ],
}

export default [CH0, CH1, CH2, CH3, CH4, CH5, CH6]
