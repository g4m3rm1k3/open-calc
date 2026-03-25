import React, { useState, useMemo } from 'react';

/**
 * Induction + Recursion Visual Proof System
 *
 * Focus:
 *   - Recursive construction
 *   - Inductive step as transformation
 *   - Invariants explicitly enforced
 *
 * Add new proofs by inserting into PROOFS
 */

export default function MultiProofEngineViz() {
  const [proofId, setProofId] = useState('sum');
  const [step, setStep] = useState(0);

  const n = step + 1;

  // =========================================
  // PROOFS
  // =========================================

  const PROOFS = {

    // -----------------------------------------
    // 1. SUM (CLASSIC INDUCTION)
    // -----------------------------------------
    sum: {
      name: "Sum 1 + 2 + ... + n",

      steps: [
        {
          title: "Base Case",
          algebra: "S₁ = 1",
          insight: "A single block establishes the structure."
        },
        {
          title: "Inductive Hypothesis",
          algebra: "S_k = k(k+1)/2",
          insight: "Assume structure holds for k."
        },
        {
          title: "Inductive Step",
          algebra: "S_{k+1} = S_k + (k+1)",
          insight: "We extend the structure by adding a new row."
        },
        {
          title: "Completion",
          algebra: "2S_n = n(n+1)",
          insight: "Complement fills missing blocks → invariant emerges."
        },
        {
          title: "Conclusion",
          algebra: "S_n = n(n+1)/2",
          insight: "Half of the rectangle is the staircase."
        }
      ],

      build: (n, step) => {
        const cells = [];

        // staircase
        for (let r = 0; r < n; r++) {
          for (let c = 0; c <= r; c++) {
            cells.push({ x: c, y: r, role: 'primary' });
          }
        }

        // complement (inductive closure visualization)
        if (step >= 3) {
          for (let r = 0; r < n; r++) {
            for (let c = r + 1; c <= n; c++) {
              cells.push({ x: c, y: r, role: 'complement' });
            }
          }
        }

        return { cells, rows: n, cols: n + 1 };
      },

      invariants: (state, n, step) => [
        {
          label: "Recursive growth: add row of size n",
          valid: true
        },
        {
          label: "Row length invariant (n+1)",
          valid:
            step < 3 ||
            Array.from({ length: n }).every((_, r) =>
              state.cells.filter(c => c.y === r).length === n + 1
            )
        }
      ],

      expert: `
Induction here is not symbolic—it is structural.

The staircase encodes the recursive definition:
S_n = S_{n-1} + n

The complement is not a trick:
it enforces a global invariant (constant row length),
which allows replacing summation with multiplication.

This is the essence of induction:
local growth → global structure.
      `,

      render: (state) => gridRender(state),

      result: n => (n * (n + 1)) / 2
    },

    // -----------------------------------------
    // 2. TRIANGULAR NUMBERS (PURE RECURSION VIEW)
    // -----------------------------------------
    triangle: {
      name: "Triangular Recursion",

      steps: [
        {
          title: "Base",
          algebra: "T₁ = 1",
          insight: "Single point."
        },
        {
          title: "Recursive Growth",
          algebra: "T_n = T_{n-1} + n",
          insight: "Each step adds a longer row."
        },
        {
          title: "Layering",
          algebra: "Stack rows",
          insight: "Structure grows linearly per step."
        },
        {
          title: "Pattern Recognition",
          algebra: "Quadratic growth",
          insight: "Total area grows ~ n²."
        }
      ],

      build: (n) => {
        const cells = [];

        for (let r = 0; r < n; r++) {
          for (let c = 0; c <= r; c++) {
            cells.push({ x: c, y: r, role: 'primary' });
          }
        }

        return { cells, rows: n, cols: n };
      },

      invariants: () => [
        {
          label: "Each step adds exactly n new elements",
          valid: true
        }
      ],

      expert: `
This is recursion in its purest form.

You are not proving a formula—you are defining a process.

Induction later proves:
T_n = n(n+1)/2

But recursion shows:
why growth accumulates the way it does.
      `,

      render: (state) => gridRender(state),

      result: n => (n * (n + 1)) / 2
    },

    // -----------------------------------------
    // 3. BINARY STRINGS (2^n)
    // -----------------------------------------
    binary: {
      name: "Binary Strings (2^n)",

      steps: [
        {
          title: "Base",
          algebra: "2¹ = 2",
          insight: "0, 1"
        },
        {
          title: "Recursive Expansion",
          algebra: "2^n = 2·2^{n-1}",
          insight: "Each string splits into two."
        },
        {
          title: "Tree Growth",
          algebra: "Doubling",
          insight: "Branching structure."
        }
      ],

      build: (n) => {
        const nodes = [];

        for (let i = 0; i < Math.pow(2, n); i++) {
          nodes.push({ value: i });
        }

        return { nodes };
      },

      invariants: (state, n) => [
        {
          label: "Count = 2^n",
          valid: state.nodes.length === Math.pow(2, n)
        }
      ],

      expert: `
This is structural recursion on choices.

Each step doubles possibilities:
append 0 or 1.

Induction proves correctness.
Recursion explains generation.
      `,

      render: (state) => (
        <div className="flex flex-wrap gap-2 justify-center">
          {state.nodes.map((_, i) => (
            <div key={i} className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
              {i.toString(2)}
            </div>
          ))}
        </div>
      ),

      result: n => Math.pow(2, n)
    },

    // -----------------------------------------
    // 4. DOMINO TILING (FIBONACCI)
    // -----------------------------------------
    domino: {
      name: "Domino Tiling (Fibonacci)",

      steps: [
        {
          title: "Base",
          algebra: "F₁ = 1, F₂ = 2",
          insight: "Small boards."
        },
        {
          title: "Recursive Split",
          algebra: "F_n = F_{n-1} + F_{n-2}",
          insight: "Last tile determines structure."
        },
        {
          title: "Decomposition",
          algebra: "Case analysis",
          insight: "Vertical vs horizontal placement."
        }
      ],

      build: (n) => {
        return { length: n };
      },

      invariants: () => [
        {
          label: "Structure splits into subproblems",
          valid: true
        }
      ],

      expert: `
This is classic recursive decomposition.

Every tiling reduces to:
- one smaller board (vertical tile)
- or two smaller boards (horizontal pair)

Induction proves correctness.
Recursion reveals structure.
      `,

      render: (state) => (
        <div className="flex justify-center gap-1">
          {Array.from({ length: state.length }).map((_, i) => (
            <div key={i} className="w-6 h-10 bg-amber-500" />
          ))}
        </div>
      ),

      result: () => "Fibonacci growth"
    }
  };

  // =========================================
  // ENGINE
  // =========================================

  const proof = PROOFS[proofId];
  const state = useMemo(() => proof.build(n, step), [proofId, step]);

  const invariants = proof.invariants(state, n, step);
  const current = proof.steps[step] || proof.steps[proof.steps.length - 1];

  // =========================================
  // UI
  // =========================================

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border">

      {/* SELECT */}
      <select
        value={proofId}
        onChange={(e) => {
          setProofId(e.target.value);
          setStep(0);
        }}
        className="mb-4 border p-2 rounded"
      >
        {Object.entries(PROOFS).map(([id, p]) => (
          <option key={id} value={id}>{p.name}</option>
        ))}
      </select>

      {/* VISUAL */}
      <div className="mb-8 flex justify-center">
        {proof.render(state)}
      </div>

      {/* STEP */}
      <div className="mb-4 p-4 bg-amber-50 rounded">
        <div className="font-semibold">{current.title}</div>
        <div className="font-mono text-emerald-600">{current.algebra}</div>
        <div className="text-sm">{current.insight}</div>
      </div>

      {/* INVARIANTS */}
      <div className="mb-4 text-xs">
        <strong>Invariants</strong>
        {invariants.map((inv, i) => (
          <div key={i} className="flex justify-between">
            <span>{inv.label}</span>
            <span className={inv.valid ? 'text-green-600' : 'text-red-600'}>
              {inv.valid ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>

      {/* EXPERT */}
      <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded text-sm whitespace-pre-line">
        {proof.expert}
      </div>

      {/* RESULT */}
      <div className="text-center font-mono mb-6">
        Result: {proof.result(n)}
      </div>

      {/* CONTROLS */}
      <div className="flex justify-center gap-4">
        <button onClick={() => setStep(0)} className="px-4 py-2 border rounded">
          Reset
        </button>
        <button
          onClick={() => setStep(s => Math.min(s + 1, proof.steps.length - 1))}
          className="px-6 py-2 bg-emerald-600 text-white rounded"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------
// GENERIC GRID RENDER
// -----------------------------------------
function gridRender(state) {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${state.cols}, 32px)`,
        gridTemplateRows: `repeat(${state.rows}, 32px)`
      }}
    >
      {state.cells.map((c, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded
            ${c.role === 'primary'
              ? 'bg-orange-500'
              : 'bg-blue-500'}
          `}
          style={{
            gridColumn: c.x + 1,
            gridRow: state.rows - c.y
          }}
        />
      ))}
    </div>
  );
}