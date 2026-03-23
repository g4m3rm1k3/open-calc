// Proof data for all geometry reference entries.

const S = {
  setup:    { bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  key:      { bg: "#eff6ff", text: "#1e40af",  border: "#bfdbfe" },
  algebra:  { bg: "#fff7ed", text: "#9a3412",  border: "#fed7aa" },
  geo:      { bg: "#ecfdf5", text: "#065f46",  border: "#6ee7b7" },
  limit:    { bg: "#fdf4ff", text: "#6b21a8",  border: "#e9d5ff" },
  conclude: { bg: "#f0fdf4", text: "#14532d",  border: "#86efac" },
  verify:   { bg: "#f0fdfa", text: "#134e4a",  border: "#99f6e4" },
}

export const GEOMETRY_PROOFS = {

  'pythagorean': {
    title: "Pythagorean Theorem",
    subtitle: "Why a² + b² = c² for any right triangle",
    category: "Geometry",
    problem: "a^2 + b^2 = c^2",
    preamble: "In a right triangle with legs a, b and hypotenuse c, the sum of the areas of the squares on the legs equals the area of the square on the hypotenuse. We prove this with a geometric area argument.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Draw a large square of side (a+b). Arrange 4 identical right triangles inside it, each with legs a and b.",
        math: "\\text{Large square area} = (a+b)^2 = a^2 + 2ab + b^2",
        note: "The 4 triangles, arranged with their hypotenuses forming the boundary of an inner square, tile the large square perfectly.",
        why: {
          tag: "How do 4 triangles fit to leave a perfect inner square?",
          explanation: "Place each right triangle with the right angle at a corner of the large square, rotated 90° each time. The four hypotenuses c each form one side of an inner quadrilateral. The inner quadrilateral is actually a square: all sides have length c (hypotenuse), and the angles are 90° because the angles at each corner of the inner shape come from the two acute angles of the right triangle (which sum to 90°). So the inner shape has 4 equal sides and 4 right angles — a square of side c.",
          why: null,
        },
      },
      {
        id: 2, tag: "Geometry", tagStyle: S.geo,
        instruction: "Compute the same large square area a second way: 4 triangles + inner square.",
        math: "\\text{Large square area} = 4 \\cdot \\tfrac{1}{2}ab + c^2 = 2ab + c^2",
        note: "Each right triangle has area (1/2)ab. Four of them: 4·(1/2)ab = 2ab. Inner square: c².",
        why: {
          tag: "Why is the area of a right triangle (1/2)ab?",
          explanation: "A right triangle with legs a and b is half of a rectangle with sides a and b (cut diagonally). Rectangle area = ab. Half = (1/2)ab. This is the general formula for triangles: Area = (1/2)·base·height. For a right triangle, the two legs serve as base and height since they meet at 90°.",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Both expressions equal the area of the same square — set them equal.",
        math: "a^2 + 2ab + b^2 = 2ab + c^2",
        note: "This is the same total area computed two different ways.",
        why: null,
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Cancel 2ab from both sides.",
        math: "a^2 + b^2 = c^2 \\;\\checkmark",
        note: "This proof works for ANY right triangle, not just specific ones. The area argument is purely geometric — no algebra beyond basic arithmetic.",
        why: {
          tag: "How many proofs of the Pythagorean theorem exist?",
          explanation: "Over 370 proofs are known, making it the most-proved theorem in mathematics. Notable ones include: (1) The rearrangement proof shown here (attributed to the Chinese text Zhoubi Suanjing, ~200 BCE). (2) Similar triangles: the altitude from the right angle to the hypotenuse creates two sub-triangles similar to the original. (3) Calculus: relate arc length and coordinates on a unit circle. (4) President James Garfield's proof (1876) using a trapezoid. The variety of proofs reflects how deeply the theorem connects geometry, algebra, and trigonometry.",
          why: null,
        },
      },
    ],
  },

  'circle-eq': {
    title: "Circle Equation",
    subtitle: "Why (x−h)² + (y−k)² = r²",
    category: "Geometry",
    problem: "(x-h)^2 + (y-k)^2 = r^2",
    preamble: "A circle is defined as the set of all points exactly distance r from a center point. The equation follows directly from the distance formula.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "A circle centered at (h, k) with radius r is all points (x, y) at distance r from (h, k).",
        math: "\\text{distance from }(x,y)\\text{ to }(h,k) = r",
        note: "This is the definition of a circle — nothing more.",
        why: {
          tag: "Why is this the definition of a circle?",
          explanation: "A circle is the set of all points equidistant from a single point (the center). This equidistance is what distinguishes a circle from other curves. Varying r gives concentric circles. If you allow r=0, the 'circle' degenerates to just the center point. If r < 0, no real points satisfy the equation.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the distance formula: distance = √((x−h)² + (y−k)²).",
        math: "\\sqrt{(x-h)^2 + (y-k)^2} = r",
        note: "The distance formula comes from the Pythagorean theorem applied to the horizontal and vertical legs.",
        why: {
          tag: "Where does the distance formula come from?",
          explanation: "To go from (h,k) to (x,y), move horizontally by (x−h) and vertically by (y−k). These form the two legs of a right triangle. By the Pythagorean theorem: distance² = (x−h)² + (y−k)². Taking the positive square root: distance = √((x−h)² + (y−k)²).",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Square both sides to get the standard circle equation.",
        math: "(x-h)^2 + (y-k)^2 = r^2",
        note: "At origin: h=k=0, giving x²+y²=r². Example: x²+y²=25 is a circle centered at origin with radius 5.",
        why: {
          tag: "Why square both sides — doesn't that introduce extraneous solutions?",
          explanation: "Both sides are non-negative: the left side is a sum of squares, and r > 0. Squaring a non-negative equality is reversible (no sign ambiguity), so no extraneous solutions appear. We square to eliminate the square root and get a more workable algebraic form. The resulting equation defines exactly the same set of points.",
          why: null,
        },
      },
    ],
  },

  'distance': {
    title: "Distance Formula",
    subtitle: "Why d = √((x₂−x₁)² + (y₂−y₁)²)",
    category: "Geometry",
    problem: "d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}",
    preamble: "The distance between two points is the length of the hypotenuse of the right triangle formed by their horizontal and vertical separation. This is the Pythagorean theorem in coordinate form.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Two points P₁=(x₁,y₁) and P₂=(x₂,y₂) form a right triangle with a third point at (x₂, y₁).",
        math: "\\text{Horizontal leg: } |x_2 - x_1|, \\quad \\text{Vertical leg: } |y_2 - y_1|",
        note: "The horizontal leg goes from P₁ to the corner; the vertical leg goes from the corner to P₂.",
        why: {
          tag: "Why construct a right triangle?",
          explanation: "Measuring diagonal distance directly is hard. But horizontal and vertical distances are easy — they're just differences of coordinates. By constructing a right triangle where the direct path (P₁ to P₂) is the hypotenuse, we can use the Pythagorean theorem: the diagonal distance equals the hypotenuse, which is calculated from the two legs.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Pythagorean theorem: d² = (horizontal leg)² + (vertical leg)².",
        math: "d^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2",
        note: "The absolute values disappear when squaring: |Δx|² = (Δx)².",
        why: null,
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Take the positive square root.",
        math: "d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}",
        note: "Example: distance from (1,2) to (4,6): √((4−1)²+(6−2)²) = √(9+16) = √25 = 5.",
        why: {
          tag: "How does this extend to 3D?",
          explanation: "In 3D, a third leg is added for the z-direction: d = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²). Apply Pythagorean theorem twice: first in the xy-plane to get the horizontal distance √((Δx)²+(Δy)²), then in the vertical direction with Δz: d = √(horizontal² + (Δz)²) = √((Δx)²+(Δy)²+(Δz)²). The same pattern extends to any number of dimensions.",
          why: null,
        },
      },
    ],
  },

  'midpoint': {
    title: "Midpoint Formula",
    subtitle: "Why M = ((x₁+x₂)/2, (y₁+y₂)/2)",
    category: "Geometry",
    problem: "M = \\left(\\frac{x_1+x_2}{2},\\, \\frac{y_1+y_2}{2}\\right)",
    preamble: "The midpoint of a segment is the average of the endpoints' coordinates. This follows from the fact that averaging gives the halfway point on a number line.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "On a number line, the midpoint between x₁ and x₂ is their average.",
        math: "\\text{Midpoint of } [x_1, x_2] = \\frac{x_1 + x_2}{2}",
        note: "The average of two numbers is the number exactly halfway between them.",
        why: {
          tag: "Why is the average the midpoint?",
          explanation: "The average (x₁+x₂)/2 is equidistant from both endpoints. Distance from x₁: (x₁+x₂)/2 − x₁ = (x₂−x₁)/2. Distance from x₂: x₂ − (x₁+x₂)/2 = (x₂−x₁)/2. Both distances are equal — it's exactly in the middle.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "In 2D, apply the averaging independently to each coordinate.",
        math: "M_x = \\frac{x_1+x_2}{2}, \\quad M_y = \\frac{y_1+y_2}{2}",
        note: "x and y coordinates are independent — horizontal position doesn't affect vertical.",
        why: {
          tag: "Why can we treat x and y independently?",
          explanation: "The Cartesian coordinate system is 'orthogonal' — x and y directions are perpendicular and don't interact. The midpoint is defined as the point halfway along each axis independently. Formally: M is the midpoint if M = (P₁ + P₂)/2 as a vector average: ((x₁,y₁)+(x₂,y₂))/2 = ((x₁+x₂)/2, (y₁+y₂)/2).",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "M = ((x₁+x₂)/2, (y₁+y₂)/2). Average each coordinate.",
        math: "M = \\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)",
        note: "Example: midpoint of (2,4) and (8,10): ((2+8)/2, (4+10)/2) = (5, 7).",
        why: null,
      },
    ],
  },

  'circle-area': {
    title: "Circle Area",
    subtitle: "Why A = πr²",
    category: "Geometry",
    problem: "A = \\pi r^2",
    preamble: "The area of a circle is πr². We derive this by slicing the circle into thin rings and using the fact that as rings get infinitely thin, they straighten into rectangles — a core idea of calculus.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Slice the circle into many thin concentric rings. Each ring at radius ρ has circumference 2πρ and thickness dρ.",
        math: "\\text{Ring area} \\approx 2\\pi\\rho \\, d\\rho",
        note: "A thin ring, when cut and unrolled, is approximately a rectangle with width = circumference = 2πρ and height = thickness dρ.",
        why: {
          tag: "Why does unrolling a ring give a rectangle?",
          explanation: "A thin ring is a circular strip. If the ring is thin enough (dρ very small), the inner and outer circumferences are nearly equal (both ≈ 2πρ). Cutting the ring at one point and flattening it gives a strip of length ≈ 2πρ and width dρ. The area of this rectangle ≈ 2πρ · dρ. As dρ → 0, the approximation becomes exact.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Sum (integrate) all ring areas from ρ=0 to ρ=r.",
        math: "A = \\int_0^r 2\\pi\\rho\\,d\\rho = 2\\pi\\left[\\frac{\\rho^2}{2}\\right]_0^r = 2\\pi \\cdot \\frac{r^2}{2} = \\pi r^2",
        note: "This is an integral: summing infinitely many infinitely thin rings.",
        why: {
          tag: "What is the integral doing here?",
          explanation: "∫₀ʳ 2πρ dρ is adding up the areas of all the rings from the center (ρ=0) to the edge (ρ=r). Each ring has area 2πρ·dρ. The integral is the limit of this sum as the rings get infinitely thin. By the power rule: ∫2πρ dρ = 2π·ρ²/2 = πρ². Evaluating from 0 to r: πr² − 0 = πr².",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "A = πr². The area grows as the square of the radius.",
        math: "A = \\pi r^2",
        note: "Alternative derivation: rearrange the slices into a triangle. N pie slices, each with arc = (2πr/N) and height r, rearranged into a triangle with base = circumference = 2πr and height r: Area = (1/2)·base·height = (1/2)·2πr·r = πr².",
        why: {
          tag: "What is π exactly — why does it appear here?",
          explanation: "π is the ratio of any circle's circumference to its diameter: π = C/d = C/(2r). Since C = 2πr, the circumference is π times the diameter. The area πr² can be derived from the circumference 2πr — they're related because area is built from circumference by integration. π ≈ 3.14159... is irrational and transcendental — it cannot be expressed as a fraction or as a root of a polynomial.",
          why: null,
        },
      },
    ],
  },

  'circle-circ': {
    title: "Circumference",
    subtitle: "Why C = 2πr",
    category: "Geometry",
    problem: "C = 2\\pi r",
    preamble: "The circumference of a circle equals 2πr. This is essentially the definition of π: the ratio of circumference to diameter. We show why this ratio is constant for all circles.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "π is defined as the ratio of a circle's circumference C to its diameter d = 2r.",
        math: "\\pi = \\frac{C}{d} = \\frac{C}{2r}",
        note: "This ratio is the same for all circles — a remarkable geometric fact.",
        why: {
          tag: "Why is C/d the same for all circles? That's not obvious.",
          explanation: "Any two circles are similar figures — one is just a scaled version of the other. When you scale a shape by factor k, all lengths scale by k. So circumference and diameter both scale by k, keeping their ratio constant. Formally: if circle 2 has radius kr (k times circle 1's radius), its circumference is also k times circle 1's circumference. The ratio C₂/d₂ = (kC₁)/(kd₁) = C₁/d₁. All circles have the same C/d ratio, which we name π.",
          why: null,
        },
      },
      {
        id: 2, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Solve for C: C = π · d = π · 2r = 2πr.",
        math: "C = 2\\pi r",
        note: "In radians: a full circle is 2π radians, and the arc length on a unit circle (r=1) swept by angle θ is rθ = θ. This is why radians are natural.",
        why: {
          tag: "How is 2πr connected to 360 degrees?",
          explanation: "360° = 2π radians. This is a conversion, not a coincidence: 2π radians is defined as a full rotation (one full circumference sweep on a unit circle, which has arc length 2π). So 360° was historically convenient for divisibility, while 2π radians is natural for geometry and calculus. The full circumference is 2πr because the angle of a full circle is 2π radians, and arc = rθ = r·2π = 2πr.",
          why: null,
        },
      },
    ],
  },

  'sphere-vol': {
    title: "Sphere Volume",
    subtitle: "Why V = (4/3)πr³",
    category: "Geometry",
    problem: "V = \\tfrac{4}{3}\\pi r^3",
    preamble: "The volume of a sphere is (4/3)πr³. We derive this by integrating circular cross-sections — slicing the sphere into thin disks.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Center the sphere at the origin. At height z, the cross-section is a circle.",
        math: "x^2 + y^2 + z^2 = r^2 \\;\\Rightarrow\\; \\text{cross-section radius at height }z: \\rho = \\sqrt{r^2 - z^2}",
        note: "The cross-section of the sphere at height z is a circle of radius ρ = √(r²−z²).",
        why: {
          tag: "Where does ρ = √(r²−z²) come from?",
          explanation: "The sphere's surface satisfies x²+y²+z² = r². At a fixed height z, the cross-section is all (x,y) satisfying x²+y² = r²−z². This is a circle of radius √(r²−z²). As z→r (near the top) or z→−r (near the bottom), ρ→0 (the circle shrinks to a point).",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Each thin disk at height z has area π·ρ² = π(r²−z²) and thickness dz.",
        math: "dV = \\pi(r^2 - z^2)\\,dz",
        note: "Disk area = π(radius)² = π(r²−z²). Volume of thin disk ≈ area × thickness.",
        why: null,
      },
      {
        id: 3, tag: "Limit", tagStyle: S.limit,
        instruction: "Integrate from z = −r to z = r.",
        math: "V = \\int_{-r}^{r} \\pi(r^2 - z^2)\\,dz = \\pi\\left[r^2 z - \\frac{z^3}{3}\\right]_{-r}^{r}",
        note: null,
        why: null,
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Evaluate the definite integral.",
        math: "= \\pi\\left[\\left(r^3 - \\frac{r^3}{3}\\right) - \\left(-r^3 + \\frac{r^3}{3}\\right)\\right] = \\pi \\cdot \\frac{4r^3}{3} = \\frac{4}{3}\\pi r^3",
        note: "Each bracket gives r³ − r³/3 = 2r³/3. Two brackets give 4r³/3. Multiply by π: (4/3)πr³.",
        why: {
          tag: "What are the steps inside the bracket?",
          explanation: "At z=r: r²·r − r³/3 = r³ − r³/3 = 2r³/3. At z=−r: r²·(−r) − (−r)³/3 = −r³ + r³/3 = −2r³/3. Subtracting: 2r³/3 − (−2r³/3) = 4r³/3. Multiply by π: V = 4πr³/3.",
          why: null,
        },
      },
    ],
  },

  'sphere-area': {
    title: "Sphere Surface Area",
    subtitle: "Why A = 4πr²",
    category: "Geometry",
    problem: "A = 4\\pi r^2",
    preamble: "The surface area of a sphere is 4πr². One elegant proof uses the fact that the surface area equals the derivative of the volume with respect to radius — adding a thin shell.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Think of the sphere's volume as built by adding infinitely thin shells, each of thickness dr.",
        math: "V(r) = \\frac{4}{3}\\pi r^3",
        note: "As r increases by dr, the volume increases by a thin shell of thickness dr wrapping the surface.",
        why: {
          tag: "Why is the shell idea valid?",
          explanation: "A thin shell at radius r has surface area A(r) and thickness dr. Its volume ≈ A(r)·dr. In the limit: dV = A(r)·dr. So A(r) = dV/dr. This is the same relationship as area and circumference for a circle: d/dr[πr²] = 2πr = circumference. For spheres: d/dr[V] = surface area.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate V(r) = (4/3)πr³ with respect to r.",
        math: "A = \\frac{dV}{dr} = \\frac{d}{dr}\\left[\\frac{4}{3}\\pi r^3\\right] = \\frac{4}{3}\\pi \\cdot 3r^2 = 4\\pi r^2",
        note: "Power rule: d/dr[r³] = 3r². The constants factor through.",
        why: {
          tag: "Why does differentiating volume give surface area?",
          explanation: "Adding a thin shell of thickness dr to a sphere of radius r: new volume = V(r+dr) ≈ V(r) + A(r)·dr. So [V(r+dr) − V(r)]/dr ≈ A(r). Taking dr→0: dV/dr = A(r). This is the limit definition of derivative. The same logic works in 2D: dA/dr = C (circumference). In each case, the (n−1)-dimensional boundary measure is the derivative of the n-dimensional content measure.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "A = 4πr². The surface area of a sphere.",
        math: "A = 4\\pi r^2",
        note: "Note: 4πr² = 4 times the area of a great circle (πr²). Archimedes proved that a sphere's surface area equals the lateral surface of its circumscribed cylinder — a famous result.",
        why: {
          tag: "Why is sphere surface area exactly 4 times the circle area?",
          explanation: "This is Archimedes' theorem: the surface of a sphere equals the lateral surface of the cylinder that exactly contains it (same radius r, height 2r). Lateral cylinder surface = 2πr·2r = 4πr². This surprising equality — the sphere's curved surface equals the cylinder's flat lateral surface — was considered one of the most beautiful results in ancient mathematics.",
          why: null,
        },
      },
    ],
  },

  'cone-vol': {
    title: "Cone Volume",
    subtitle: "Why V = (1/3)πr²h",
    category: "Geometry",
    problem: "V = \\tfrac{1}{3}\\pi r^2 h",
    preamble: "A cone has exactly one-third the volume of the cylinder with the same base and height. We derive this by integrating the circular cross-sections of the cone.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Orient the cone with apex at origin, base circle of radius r at height h. At height z, the cross-section radius is r·(z/h) (proportional to height).",
        math: "\\text{Cross-section radius at height }z: \\rho(z) = r\\cdot\\frac{z}{h}",
        note: "By similar triangles: the cone's cross-section widens linearly. At z=0 (apex): radius=0. At z=h (base): radius=r.",
        why: {
          tag: "Why is the cross-section radius proportional to z?",
          explanation: "The cone's surface is a straight line from apex to rim, so the radius grows linearly with height. By similar triangles: at height z (fraction z/h of the way up), the radius is fraction z/h of the base radius r. So ρ(z) = r·(z/h).",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Disk area at height z: π·ρ² = π·(rz/h)². Integrate from 0 to h.",
        math: "V = \\int_0^h \\pi\\left(\\frac{rz}{h}\\right)^2 dz = \\frac{\\pi r^2}{h^2}\\int_0^h z^2\\,dz",
        note: "Factor out the constants r²/h² from the integral.",
        why: null,
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Evaluate the integral using the power rule.",
        math: "= \\frac{\\pi r^2}{h^2}\\cdot\\frac{h^3}{3} = \\frac{\\pi r^2 h}{3} = \\frac{1}{3}\\pi r^2 h",
        note: "∫₀ʰ z² dz = [z³/3]₀ʰ = h³/3. Then (πr²/h²)·(h³/3) = πr²h/3.",
        why: {
          tag: "Why exactly one-third? Is there an intuitive reason?",
          explanation: "Three identical pyramids can be assembled to fill a cube (this is an old Egyptian proof). More generally, for any cone/pyramid: Cavalieri's principle says that if two solids have equal cross-sectional areas at every height, they have equal volumes. A cone's cross-section at height z has area π(rz/h)². A cylinder's has area πr². The ratio at each height is (z/h)² — always less than 1, and averaging over the height from 0 to h gives a factor of 1/3. Hence cone = (1/3) × cylinder.",
          why: null,
        },
      },
    ],
  },
}
