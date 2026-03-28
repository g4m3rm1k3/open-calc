import CH0 from "./chapter-0/index.js";
import CH1 from "./chapter-1/index.js";
import CH2 from "./chapter-2/index.js";
import CH3 from "./chapter-3/index.js";

// Newtonian Mechanics
const CH4 = {
  title: "Newton's Laws of Motion",
  number: "p4",
  slug: "mechanics",
  lessons: [
    { id: "p1-ch4-001", title: "Newton's First Law", slug: "first-law" },
    { id: "p1-ch4-002", title: "Newton's Second Law", slug: "second-law" },
    { id: "p1-ch4-003", title: "Newton's Third Law", slug: "third-law" },
    { id: "p1-ch4-004", title: "Free Body Diagrams", slug: "fbd-skill" },
    { id: "p1-ch4-100", title: "Newton's Law Examples", slug: "newton-examples" },
    { id: "p1-ch4-200", title: "Statics Problems", slug: "statics-problems" },
    { id: "p1-ch4-300", title: "Inclined Planes", slug: "inclined-planes" },
    { id: "p1-ch4-400", title: "Pulley Systems", slug: "pulley-systems" },
    { id: "p1-ch4-500", title: "Circular Motion Dynamics", slug: "circular-dynamics" },
  ],
};

// Work & Energy
const CH5 = {
  title: "Work & Energy",
  number: "p5",
  slug: "energy",
  lessons: [
    { id: "p1-ch5-001", title: "Work In Context", slug: "work-definition" },
    { id: "p1-ch5-002", title: "Kinetic Energy", slug: "kinetic-energy" },
    { id: "p1-ch5-003", title: "Potential Energy", slug: "potential-energy" },
    { id: "p1-ch5-004", title: "Conservation of Energy", slug: "energy-conservation" },
    { id: "p1-ch5-011", title: "Power", slug: "power" },
    { id: "p1-ch5-100", title: "Energy Worked Examples", slug: "energy-examples" },
  ],
};

// Momentum & Collisions
const CH6 = {
  title: "Momentum & Collisions",
  number: "p6",
  slug: "momentum",
  lessons: [
    { id: "p1-ch6-001", title: "Momentum (p = mv)", slug: "momentum-definition" },
    { id: "p1-ch6-002", title: "Impulse & Area", slug: "impulse" },
    { id: "p1-ch6-003", title: "Conservation of Momentum", slug: "momentum-conservation" },
  ],
};

// Rotational Motion
const CH7 = {
  title: "Rotational Motion",
  number: "p7",
  slug: "rotation",
  lessons: [
    { id: "p1-ch7-001", title: "Angular Kinematics", slug: "angular-kinematics" },
    { id: "p1-ch7-002", title: "Torque & Leverage", slug: "torque" },
    { id: "p1-ch7-003", title: "Rotational Dynamics", slug: "rotational-dynamics" },
    { id: "p1-ch7-004", title: "Moment of Inertia", slug: "moment-of-inertia" },
  ],
};

// Oscillations & Waves
const CH8 = {
  title: "Oscillations & Waves",
  number: "p8",
  slug: "oscillations-waves",
  lessons: [
    { title: "Hooke's Law", slug: "hookes-law" },
    { title: "Simple Harmonic Motion", slug: "shm" },
    { title: "Wave Properties", slug: "wave-properties" },
    { title: "The Wave Equation", slug: "wave-equation" },
  ],
};

export default [CH0, CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8];
