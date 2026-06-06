export const CAMPAIGN_MISSIONS = [
  {
    level: 1,
    title: "THE KESSEL DELIVERY",
    passcode: "ALPHA-01",
    environment: {
      planetColor: "#0f766e",
      wireframePlanet: false,
      galaxyColor1: "#000000",
      galaxyColor2: "#000000",
      targetShape: "box"
    },
    story: [
      { speaker: "COMMANDER", text: "Pilot, we have a critical situation. Outpost Delta is running out of oxygen. We need you to deliver this life-support package." },
      { speaker: "AI-NAV", text: "Warning: Main navigation computer is offline due to solar flare interference. Manual thruster control required." },
      { speaker: "AI-NAV", text: "Your ship has two primary directional thrusters: Vector v₁ and Vector v₂. To reach the drop-off point (Target T), you must fire each thruster for a specific multiplier duration." },
      { speaker: "AI-NAV", text: "This is a 'Linear Combination'. We need to find scalars 'a' and 'b' such that: a·v₁ + b·v₂ = T." },
      { speaker: "AI-NAV", text: "Tip: Look at the x-components and z-components separately to solve the system. For example, if v₁=[2,0,0], v₂=[0,0,1], and T=[4,0,3], then a=2 and b=3." },
      { speaker: "COMMANDER", text: "Do the math, Pilot. Lives depend on it." }
    ],
    puzzleType: "linear_combo",
    successMsg: "Package delivered! Oxygen levels stabilizing."
  },
  {
    level: 2,
    title: "PIRATE INTERCEPTION",
    passcode: "BRAVO-22",
    environment: {
      planetColor: "#6d28d9",
      wireframePlanet: true,
      galaxyColor1: "#3b82f6",
      galaxyColor2: "#a855f7",
      targetShape: "cone"
    },
    story: [
      { speaker: "COMMANDER", text: "Great job on the delivery. Unfortunately, a pirate scout picked up your energy signature. They are attempting to flee and warn their fleet." },
      { speaker: "AI-NAV", text: "We must intercept them before they jump to lightspeed. I have tracked their trajectory as a system of linear equations." },
      { speaker: "AI-NAV", text: "To find their exact jump coordinates (x, z), you need to solve the system. We can use Row Reduction (RREF)." },
      { speaker: "AI-NAV", text: "Example: If you have [2 1 | 8] and [-3 -1 | -11], try adding rows together or substituting to eliminate a variable. Once you isolate x and z, input them into the targeting console." },
      { speaker: "COMMANDER", text: "Lock onto their jump coordinates and take the shot." }
    ],
    puzzleType: "rref",
    successMsg: "Target neutralized. The sector is secure."
  },
  {
    level: 3,
    title: "EVASIVE MANEUVERS",
    passcode: "CHARLIE-77",
    environment: {
      planetColor: "#b91c1c",
      wireframePlanet: false,
      galaxyColor1: "#ef4444",
      galaxyColor2: "#f97316",
      targetShape: "octahedron"
    },
    story: [
      { speaker: "COMMANDER", text: "Incoming! The pirate fleet arrived earlier than expected. They've fired a tracking torpedo that matches our every move." },
      { speaker: "AI-NAV", text: "Standard evasion is useless. To shake the torpedo, we need to thrust perfectly perpendicular to both our current velocity (v₁) and the torpedo's velocity (v₂)." },
      { speaker: "AI-NAV", text: "In 3D space, the Cross Product of two vectors gives a third vector that is orthogonal (perpendicular) to both." },
      { speaker: "AI-NAV", text: "Formula: v₁ × v₂ = [ (y₁·z₂ - z₁·y₂), (z₁·x₂ - x₁·z₂), (x₁·y₂ - y₁·x₂) ]. Calculate the cross product to find our escape vector!" }
    ],
    puzzleType: "cross_product",
    successMsg: "Evasion successful! We lost them."
  },
  {
    level: 4,
    title: "SENSOR SWEEP",
    passcode: "DELTA-99",
    environment: {
      planetColor: "#0369a1",
      wireframePlanet: true,
      galaxyColor1: "#0284c7",
      galaxyColor2: "#38bdf8",
      targetShape: "sphere"
    },
    story: [
      { speaker: "COMMANDER", text: "We're flying blind in this nebula. I need you to deploy three sensor buoys to map the area." },
      { speaker: "AI-NAV", text: "For the sensors to map 3-dimensional space, their position vectors must 'Span R³'. This means they cannot all lie on the same flat 2D plane." },
      { speaker: "AI-NAV", text: "If the 3 vectors are linearly dependent, they only span a plane (or a line), leaving blind spots. We test this using the Determinant." },
      { speaker: "AI-NAV", text: "Calculate the determinant of the 3x3 matrix formed by the vectors. If det ≠ 0, they span 3D space. If det = 0, we have a blind spot." },
      { speaker: "COMMANDER", text: "Check the buoy deployment coordinates. Do they span the space?" }
    ],
    puzzleType: "span",
    successMsg: "Sensor grid established. Space is fully mapped."
  },
  {
    level: 5,
    title: "THE TRACTOR BEAM",
    passcode: "ECHO-55",
    environment: {
      planetColor: "#eab308",
      wireframePlanet: false,
      galaxyColor1: "#ca8a04",
      galaxyColor2: "#facc15",
      targetShape: "torus"
    },
    story: [
      { speaker: "COMMANDER", text: "Our sensors picked up a derelict ancient vessel. It's drifting rapidly towards a black hole." },
      { speaker: "AI-NAV", text: "We need to catch it with our tractor beam, but it's accelerating. We only have its acceleration function a(t) and initial velocity v(0)." },
      { speaker: "AI-NAV", text: "This requires Calculus. Acceleration is the derivative of velocity, and velocity is the derivative of position." },
      { speaker: "AI-NAV", text: "Integrate a(t) to get v(t). Then integrate v(t) to get position s(t). Plug in the time 't' to find exactly where the derelict will be so we can lock the beam." },
      { speaker: "COMMANDER", text: "Save that ship, Pilot!" }
    ],
    puzzleType: "calculus",
    successMsg: "Tractor beam locked! We got it!"
  }
];
