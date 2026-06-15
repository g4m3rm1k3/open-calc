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
    case 6: {
      // Dot Product
      const v1 = [randInt(1, 4), randInt(-3, 3), randInt(1, 4)];
      const v2 = [randInt(-3, 3), randInt(1, 4), randInt(-3, 3)];
      const dot = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
      
      return {
        type: 'dot_product',
        desc: `SHIELD ALIGNMENT: Calculate the dot product v₁ · v₂ to find the deflection scalar.`,
        eq: `v₁ = [${v1.join(', ')}]\nv₂ = [${v2.join(', ')}]\nv₁ · v₂ = ?`,
        inputs: [
          { id: 'dot', label: 'v₁ · v₂ =', ans: dot }
        ],
        hint: `Multiply corresponding components and add them: (${v1[0]}*${v2[0]}) + (${v1[1]}*${v2[1]}) + (${v1[2]}*${v2[2]})`,
        mode: 'SHIELD CALIBRATION'
      };
    }
    case 7: {
      // Inverse Matrix 2x2
      let a, b, c, d, det;
      do {
        a = randInt(1, 4); b = randInt(1, 4);
        c = randInt(1, 4); d = randInt(1, 4);
        det = a * d - b * c;
      } while (Math.abs(det) !== 1); // Keep det=1 or -1 so inverse has integers
      
      const v = [randInt(1, 5), randInt(1, 5)];
      // Inverse is [d -b; -c a] * 1/det
      const invA = d / det;
      const invB = -b / det;
      const invC = -c / det;
      const invD = a / det;
      
      const outX = invA * v[0] + invB * v[1];
      const outY = invC * v[0] + invD * v[1];

      return {
        type: 'inverse',
        desc: `DECRYPTION: Matrix A encrypts the signal. Multiply the signal vector by A⁻¹ to decode.`,
        eq: `A = [${a} ${b}; ${c} ${d}]\nSignal = [${v.join(' ')}]\nDecoded = A⁻¹ * Signal`,
        inputs: [
          { id: 'dx', label: 'x =', ans: outX },
          { id: 'dy', label: 'y =', ans: outY }
        ],
        hint: `Det = ${det}. A⁻¹ = [${invA} ${invB}; ${invC} ${invD}]. Multiply A⁻¹ by [${v.join(', ')}].`,
        mode: 'DECRYPTION'
      };
    }
    case 8: {
      // Eigenvalues
      const lambda1 = randInt(1, 4);
      const lambda2 = randInt(1, 4);
      // Construct a 2x2 matrix with these eigenvalues
      // Trace = L1 + L2
      // Det = L1 * L2
      const tr = lambda1 + lambda2;
      const det = lambda1 * lambda2;
      // Let a = 1, d = tr - 1
      const a = 1;
      const d = tr - 1;
      // a*d - b*c = det => 1*d - b*c = det => b*c = d - det
      // To make it easy, just give them a diagonal or triangular matrix, or a simple one
      // Let's use a triangular matrix so the eigenvalues are on the diagonal
      const matrix = [lambda1, randInt(1, 5), 0, lambda2];
      
      return {
        type: 'eigenvalues',
        desc: `RESONANCE: Find the two eigenvalues (λ₁, λ₂) of the core transformation matrix.`,
        eq: `A = [${matrix[0]} ${matrix[1]}; ${matrix[2]} ${matrix[3]}]\ndet(A - λI) = 0`,
        inputs: [
          { id: 'l1', label: 'λ₁ =', ans: lambda1 },
          { id: 'l2', label: 'λ₂ =', ans: lambda2 }
        ],
        hint: `Since this is an upper triangular matrix, the eigenvalues are just the entries on the main diagonal!`,
        mode: 'RESONANCE'
      };
    }
    case 9: {
      // Change of Basis
      const px = randInt(1, 3); const py = randInt(0, 2);
      const qx = randInt(0, 2); const qy = randInt(1, 3);
      const vx = randInt(1, 4); const vy = randInt(1, 4);
      // new_v = P * v
      const outX = px * vx + qx * vy;
      const outY = py * vx + qy * vy;

      return {
        type: 'change_of_basis',
        desc: `ALIGNMENT: Convert the targeting vector [${vx}, ${vy}] into the standard basis using matrix P.`,
        eq: `P = [${px} ${qx}; ${py} ${qy}]\nv_new = [${vx}, ${vy}]\nv_std = P * v_new`,
        inputs: [
          { id: 'x', label: 'x =', ans: outX },
          { id: 'y', label: 'y =', ans: outY }
        ],
        hint: `Multiply the matrix P by the column vector [${vx}, ${vy}].`,
        mode: 'SENSOR ALIGNMENT'
      };
    }
    case 10: {
      // Transformation
      const vx = randInt(1, 5);
      const vy = randInt(1, 5);
      const tx = randInt(2, 6);
      const ty = randInt(-4, -1);
      // Apply translation only for simplicity in math input, or 90 deg rotation then translate
      // 90 deg rot: [-y, x]
      const rotX = -vy;
      const rotY = vx;
      const finalX = rotX + tx;
      const finalY = rotY + ty;

      return {
        type: 'transformation',
        desc: `FINAL STRIKE: Rotate vector v by 90° CCW, then translate by T.`,
        eq: `v = [${vx}, ${vy}]\nT = [${tx}, ${ty}]\nTransform: R(90)v + T`,
        inputs: [
          { id: 'fx', label: 'Final x =', ans: finalX },
          { id: 'fy', label: 'Final y =', ans: finalY }
        ],
        hint: `90° CCW rotation swaps x and y and negates the new x. R(90)[${vx},${vy}] = [${rotX},${rotY}]. Then add T.`,
        mode: 'FINAL STRIKE'
      };
    }
    default:
      return null;
  }
}
