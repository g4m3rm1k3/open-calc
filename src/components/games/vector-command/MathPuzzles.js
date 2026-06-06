export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePuzzle(missionLevel) {
  switch (missionLevel) {
    case 1: {
      // Linear combinations: a*v1 + b*v2 = target
      const a = randInt(1, 5);
      const b = randInt(1, 5);
      const v1 = [randInt(1, 4), randInt(-2, 2), randInt(1, 4)];
      const v2 = [randInt(-2, 3), randInt(1, 4), randInt(-2, 3)];
      const target = [
        a * v1[0] + b * v2[0],
        a * v1[1] + b * v2[1],
        a * v1[2] + b * v2[2]
      ];
      return {
        type: 'linear_combo',
        desc: `NAVIGATION WAYPOINT ACQUIRED.\nFind scalars a, b such that a·v₁ + b·v₂ = T`,
        eq: `v₁ = [${v1.join(', ')}]\nv₂ = [${v2.join(', ')}]\nT  = [${target.join(', ')}]\na·v₁ + b·v₂ = T`,
        inputs: [
          { id: 'a', label: 'a =', ans: a },
          { id: 'b', label: 'b =', ans: b }
        ],
        hint: `Check x component: ${v1[0]}a + ${v2[0]}b = ${target[0]}`,
        mode: 'NAVIGATION',
        target, v1, v2
      };
    }
    case 2: {
      // RREF: 2x2 system for interception coordinates (x, z)
      let a, b, c, d, det;
      do {
        a = randInt(1, 3); b = randInt(1, 3);
        c = randInt(1, 3); d = randInt(2, 5);
        det = a * d - b * c;
      } while (Math.abs(det) < 1);
      
      const x = randInt(1, 6);
      const z = randInt(1, 6);
      const r1 = a * x + b * z;
      const r2 = c * x + d * z;
      
      return {
        type: 'rref',
        desc: `INTERCEPT TRAJECTORY LOCKED.\nSolve this system for coordinates (x,z) using RREF.`,
        eq: `${a}x + ${b}z = ${r1}\n${c}x + ${d}z = ${r2}\n\n[ ${a} ${b} | ${r1} ]\n[ ${c} ${d} | ${r2} ]  →  RREF`,
        inputs: [
          { id: 'x', label: 'x =', ans: x },
          { id: 'z', label: 'z =', ans: z }
        ],
        hint: `Eliminate x by substituting or finding the determinant (${det}).`,
        mode: 'INTERCEPTION'
      };
    }
    case 3: {
      // Cross Product
      const v1 = [randInt(1, 4), 0, randInt(1, 3)];
      const v2 = [0, randInt(1, 4), randInt(1, 3)];
      const cp = [
        v1[1]*v2[2] - v1[2]*v2[1],
        v1[2]*v2[0] - v1[0]*v2[2],
        v1[0]*v2[1] - v1[1]*v2[0]
      ];
      
      return {
        type: 'cross_product',
        desc: `EVASIVE TRACKING: Compute v₁ × v₂ to find the perpendicular firing solution.`,
        eq: `v₁ = [${v1.join(', ')}]\nv₂ = [${v2.join(', ')}]\nv₁ × v₂ = [?, ?, ?]`,
        inputs: [
          { id: 'cx', label: 'x =', ans: cp[0] },
          { id: 'cy', label: 'y =', ans: cp[1] },
          { id: 'cz', label: 'z =', ans: cp[2] }
        ],
        hint: `x component: (v1_y * v2_z) - (v1_z * v2_y) = (${v1[1]}*${v2[2]}) - (${v1[2]}*${v2[1]}) = ${cp[0]}`,
        mode: 'TRACKING'
      };
    }
    case 4: {
      // Span check (determinant)
      const isSpan = Math.random() > 0.5;
      let v1 = [randInt(1, 3), 0, 0];
      let v2 = [0, randInt(1, 3), 0];
      let v3;
      if (isSpan) {
        v3 = [randInt(1, 3), randInt(1, 3), randInt(1, 3)];
      } else {
        const a = randInt(1, 3);
        const b = randInt(1, 3);
        v3 = [a * v1[0] + b * v2[0], a * v1[1] + b * v2[1], 0];
      }
      
      return {
        type: 'span',
        desc: `SENSOR RANGE: Do these three vectors span 3D space?\nEnter 1 if YES (det ≠ 0), 0 if NO (det = 0).`,
        eq: `v₁ = [${v1.join(', ')}]\nv₂ = [${v2.join(', ')}]\nv₃ = [${v3.join(', ')}]\ndet([v₁ v₂ v₃]) = ?`,
        inputs: [
          { id: 'span', label: 'Spans ℝ³ (1/0) =', ans: isSpan ? 1 : 0 }
        ],
        hint: `Compute the determinant of the 3x3 matrix. If it's non-zero, they span the space.`,
        mode: 'SENSOR SWEEP'
      };
    }
    case 5: {
      // Calculus / Trajectory
      const accel = randInt(2, 6);
      const v0 = randInt(1, 4);
      const t = 2;
      const pos = 0.5 * accel * t * t + v0 * t;
      
      return {
        type: 'calculus',
        desc: `LONG RANGE TORPEDO: Acceleration a(t) = ${accel}. Initial velocity v(0) = ${v0}.\nCalculate position s(t) at t = ${t}.`,
        eq: `a(t) = ${accel}\nv(t) = ∫ a(t) dt + v(0)\ns(t) = ∫ v(t) dt + s(0)\ns(${t}) = ?`,
        inputs: [
          { id: 'pos', label: `s(${t}) =`, ans: pos }
        ],
        hint: `v(t) = ${accel}t + ${v0}. Integrate again: s(t) = ${accel/2}t² + ${v0}t. Plug in t=2.`,
        mode: 'TORPEDO TARGETING'
      };
    }
    default:
      return null;
  }
}
