import React from 'react';

export function MathCodex({ puzzleType, onClose }) {
  const getCodexContent = () => {
    switch (puzzleType) {
      case 'linear_combo':
        return {
          title: "LINEAR COMBINATIONS",
          desc: "A linear combination is the foundation of moving through vector space. It means scaling vectors by some amount and adding them together.",
          formula: "a·v₁ + b·v₂ = T",
          why: "Why it works: By adjusting the 'throttle' (scalars a and b) on your thrusters (vectors v1 and v2), you can reach any point in the plane spanned by those thrusters.",
          example: "Example: v₁=[1,0], v₂=[0,1], Target=[3,5]\nSolution: 3·[1,0] + 5·[0,1] = [3,5]."
        };
      case 'rref':
        return {
          title: "ROW REDUCTION (GAUSSIAN ELIMINATION)",
          desc: "RREF is an algorithmic way to solve systems of linear equations by transforming the matrix into a staircase of 1s.",
          formula: "[ A | b ] → [ I | x ]",
          why: "Why it works: Each row operation (swapping, scaling, adding) creates a new system with the exact same solution space, just simpler to read.",
          example: "Example:\n[2 1 | 8]\n[1 -1| 1]\nMultiply R2 by 2 and subtract: you isolate the variables!"
        };
      case 'cross_product':
        return {
          title: "CROSS PRODUCT",
          desc: "The cross product takes two vectors in 3D and produces a third vector that is perfectly perpendicular (orthogonal) to both.",
          formula: "v₁ × v₂ = [ y₁z₂-z₁y₂, z₁x₂-x₁z₂, x₁y₂-y₁x₂ ]",
          why: "Why it works: It computes the normal vector of the plane formed by the two vectors. Useful for evasion, lighting, and physics.",
          example: "Right Hand Rule: Point index finger along v₁, middle finger along v₂. Your thumb points along v₁ × v₂."
        };
      case 'span':
        return {
          title: "SPAN & DETERMINANTS",
          desc: "The span of a set of vectors is all the points you can reach using linear combinations of them.",
          formula: "det(A) ≠ 0 means the vectors span full space.",
          why: "Why it works: The determinant measures the 'volume' created by the vectors. If volume is 0, they are flattened onto a plane (linearly dependent).",
          example: "If 3 vectors lie on the same flat plane, their determinant is 0. They cannot reach every point in 3D space."
        };
      case 'calculus':
        return {
          title: "KINEMATICS & INTEGRATION",
          desc: "Integration accumulates changes over time. To find position, you must integrate acceleration twice.",
          formula: "v(t) = ∫ a(t)dt,  s(t) = ∫ v(t)dt",
          why: "Why it works: Acceleration is the rate of change of velocity. By taking the area under the acceleration curve (integral), we recover velocity.",
          example: "If a(t) = 4, then v(t) = 4t + C. If initial velocity is 0, v(t)=4t. Then s(t) = 2t²."
        };
      case 'dot_product':
        return {
          title: "DOT PRODUCT (PROJECTION)",
          desc: "The dot product measures how much of one vector goes in the direction of another.",
          formula: "A · B = AₓBₓ + AᵧBᵧ + A_zB_z",
          why: "Why it works: If A·B = 0, the vectors are perfectly perpendicular. If A·B > 0, they point somewhat in the same direction.",
          example: "Used to calculate lighting angles, shield deflections, and the energy of impact."
        };
      case 'inverse':
        return {
          title: "MATRIX INVERSES",
          desc: "The inverse of a matrix undoes its transformation. If A transforms x to y, A⁻¹ transforms y back to x.",
          formula: "A * A⁻¹ = I",
          why: "Why it works: For 2x2, A⁻¹ = 1/det(A) * [d -b; -c a]. It flips the geometry perfectly in reverse.",
          example: "If a matrix encrypts a signal, multiplying the encrypted signal by the inverse matrix decrypts it."
        };
      case 'eigenvalues':
        return {
          title: "EIGENVALUES & RESONANCE",
          desc: "Eigenvectors are special directions where the matrix only stretches the vector, without rotating it. The stretch factor is the Eigenvalue.",
          formula: "A v = λ v",
          why: "Why it works: Finding these reveals the fundamental axes of a system, like the natural frequencies of a vibrating warp core.",
          example: "Solve det(A - λI) = 0 to find the roots (λ₁, λ₂)."
        };
      case 'change_of_basis':
        return {
          title: "CHANGE OF BASIS",
          desc: "A vector's coordinates depend on its basis (its ruler). We can translate coordinates between different systems.",
          formula: "v_standard = P * v_new",
          why: "Why it works: The matrix P contains the new basis vectors as its columns. Multiplying simply rebuilds the vector in the standard world.",
          example: "Used for aligning mismatched sensors or switching to an eigenvector basis."
        };
      case 'transformation':
        return {
          title: "3D TRANSFORMATIONS",
          desc: "Complex movements are built by multiplying matrices for rotation, scaling, and adding vectors for translation.",
          formula: "T(v) = R * v + t",
          why: "Why it works: Rotations and scales are linear (matrix multiplication), while translations shift the origin (vector addition).",
          example: "To rotate a ship and move it forward, we apply the rotation matrix first, then add the thrust vector."
        };
      default:
        return { title: "DATABANK", desc: "No data available.", formula: "", why: "", example: "" };
    }
  };

  const content = getCodexContent();

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-8">
      <div className="max-w-3xl w-full bg-slate-900 border-2 border-cyan-500/50 rounded-lg p-8 shadow-[0_0_50px_rgba(34,211,238,0.2)] font-mono text-cyan-200">
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4 mb-6">
          <h2 className="text-2xl font-bold tracking-[0.2em] text-cyan-400">DATABANK: {content.title}</h2>
          <button onClick={onClose} className="text-cyan-500 hover:text-red-400 text-2xl font-bold">×</button>
        </div>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <div className="bg-cyan-500/5 border-l-4 border-cyan-500 p-4">
            <p>{content.desc}</p>
          </div>
          
          <div>
            <h3 className="text-emerald-400 font-bold mb-2 tracking-widest">FORMULA / CONCEPT</h3>
            <div className="bg-slate-950 p-4 rounded border border-slate-800 text-center text-lg text-yellow-300 tracking-wider">
              {content.formula}
            </div>
          </div>
          
          <div>
            <h3 className="text-emerald-400 font-bold mb-2 tracking-widest">WHY IT WORKS</h3>
            <p className="text-slate-300">{content.why}</p>
          </div>
          
          <div>
            <h3 className="text-emerald-400 font-bold mb-2 tracking-widest">CANONICAL EXAMPLE</h3>
            <div className="bg-slate-950 p-4 rounded border border-slate-800 whitespace-pre-line text-cyan-300">
              {content.example}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button onClick={onClose} className="px-8 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500 text-cyan-300 tracking-widest rounded transition-all font-bold">
            CLOSE DATABANK
          </button>
        </div>
      </div>
    </div>
  );
}
