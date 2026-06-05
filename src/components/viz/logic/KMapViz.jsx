import { useState, useMemo } from 'react';

// Gray code orders for K-map axes
const GRAY2 = [0, 1];
const GRAY4 = [0, 1, 3, 2]; // 00, 01, 11, 10

function getVarName(i) { return ['A', 'B', 'C', 'D'][i]; }

function mintermsForVars(numVars) {
  return Array.from({ length: 1 << numVars }, (_, i) => i);
}

// For a given cell (row index in gray-order, col index in gray-order), return the minterm number
function cellMinterm(rowIdx, colIdx, numVars) {
  if (numVars === 2) {
    const a = GRAY2[rowIdx];
    const b = GRAY2[colIdx];
    return (a << 1) | b;
  }
  if (numVars === 3) {
    const a = GRAY2[rowIdx];
    const bc = GRAY4[colIdx];
    return (a << 2) | bc;
  }
  // 4 vars
  const ab = GRAY4[rowIdx];
  const cd = GRAY4[colIdx];
  return (ab << 2) | cd;
}

const CELL_STATES = ['0', '1', 'X'];
const CELL_COLORS = {
  '0': 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  '1': 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold',
  'X': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold',
};

// Find all groups of 1s (and optionally X treated as 1) of size 2^k
// Returns array of { minterms: Set, term: string }
function findGroups(cells, numVars, useDontCare = true) {
  const size = 1 << numVars;
  // cells is array indexed by minterm, value '0'/'1'/'X'
  const ones = new Set();
  for (let i = 0; i < size; i++) {
    if (cells[i] === '1') ones.add(i);
    if (useDontCare && cells[i] === 'X') ones.add(i); // treat X as 1 for grouping
  }

  const trueOnes = new Set();
  for (let i = 0; i < size; i++) {
    if (cells[i] === '1') trueOnes.add(i);
  }

  if (trueOnes.size === 0) return [];

  // Find all prime implicants using Quine-McCluskey-style grouping
  // For visual purposes, just find maximal rectangular groups in K-map covering all 1s
  // Simplified: iterate group sizes from largest to smallest

  const allGroups = [];
  const maxGroupSize = Math.min(size, 8); // up to 8

  for (let groupSize = maxGroupSize; groupSize >= 1; groupSize >>= 0) {
    // Try all possible starting positions for groups of this size
    // (This is simplified for 2-4 variable K-maps)
    // We'll enumerate cube implicants
    for (let mask = 0; mask < size; mask++) {
      for (let cube = 0; cube < size; cube++) {
        if ((cube & mask) !== 0) continue; // cube must have 0 in mask bits
        // This cube covers: all minterms that match (cube & ~mask)
        const groupMinterms = [];
        for (let m = 0; m < size; m++) {
          if ((m & ~mask) === cube && (m | mask) === (cube | mask)) {
            // More precisely: m matches cube on non-mask bits
          }
        }
        // Actually let's use a simpler approach
        break;
      }
      break;
    }
    break;
  }

  // Simplified approach: find the essential groups for display
  // Enumerate all valid implicants (power-of-2 cubes)
  const implicants = [];
  for (let don = 0; don < size; don++) {
    // don is the "don't care" mask — bits that are free
    if (!isPowerOf2OrZero(countBits(don))) continue;
    // For each possible base minterm
    for (let base = 0; base < size; base++) {
      if ((base & don) !== 0) continue; // base must have 0 where don has 1
      // This implicant covers all minterms: base | (subset of don)
      const covered = [];
      const subsets = 1 << countBits(don);
      const donBits = getBits(don);
      for (let s = 0; s < subsets; s++) {
        let m = base;
        for (let b = 0; b < donBits.length; b++) {
          if (s & (1 << b)) m |= donBits[b];
        }
        covered.push(m);
      }
      // Check if all covered minterms are in ones
      if (covered.every(m => ones.has(m)) && covered.some(m => trueOnes.has(m))) {
        implicants.push({ covered: new Set(covered), don, base });
      }
    }
  }

  // Find essential prime implicants (greedy covering)
  // Sort by size descending
  implicants.sort((a, b) => b.covered.size - a.covered.size);

  const covered = new Set();
  const chosen = [];
  for (const imp of implicants) {
    const uncoveredInGroup = [...imp.covered].filter(m => trueOnes.has(m) && !covered.has(m));
    if (uncoveredInGroup.length > 0) {
      chosen.push(imp);
      for (const m of imp.covered) covered.add(m);
    }
    if ([...trueOnes].every(m => covered.has(m))) break;
  }

  // Convert to term strings
  return chosen.map(imp => ({
    minterms: imp.covered,
    term: buildTerm(imp.base, imp.don, numVars),
  }));
}

function isPowerOf2OrZero(n) { return n === 0 || (n & (n - 1)) === 0; }
function countBits(n) { let c = 0; while (n) { c += n & 1; n >>= 1; } return c; }
function getBits(n) {
  const bits = [];
  for (let i = 0; n >> i; i++) {
    if (n & (1 << i)) bits.push(1 << i);
  }
  return bits;
}

function buildTerm(base, don, numVars) {
  // don mask = bits that are free (variable eliminated)
  // base = value of non-free bits
  let term = '';
  for (let i = numVars - 1; i >= 0; i--) {
    const bit = 1 << i;
    if (don & bit) continue; // this variable was eliminated
    const varName = getVarName(numVars - 1 - i);
    if (base & bit) {
      term += varName;
    } else {
      term += varName + '̅'; // combining overline
    }
  }
  return term || '1'; // all variables eliminated = constant 1
}

// Group colors for highlighting
const GROUP_COLORS = [
  'bg-blue-200/70 dark:bg-blue-800/50 border-blue-400',
  'bg-rose-200/70 dark:bg-rose-800/50 border-rose-400',
  'bg-purple-200/70 dark:bg-purple-800/50 border-purple-400',
  'bg-orange-200/70 dark:bg-orange-800/50 border-orange-400',
  'bg-cyan-200/70 dark:bg-cyan-800/50 border-cyan-400',
];

export default function KMapViz() {
  const [numVars, setNumVars] = useState(3);
  const [cells, setCells] = useState(() => {
    const c = {};
    for (let i = 0; i < 8; i++) c[i] = '0';
    return c;
  });

  const rows = numVars <= 2 ? 2 : 2;
  const cols = numVars === 2 ? 2 : numVars === 3 ? 4 : 4;
  const totalCells = 1 << numVars;

  const handleVarChange = (n) => {
    const newCells = {};
    for (let i = 0; i < (1 << n); i++) newCells[i] = '0';
    setNumVars(n);
    setCells(newCells);
  };

  const cycleCell = (minterm) => {
    const cur = cells[minterm] || '0';
    const next = CELL_STATES[(CELL_STATES.indexOf(cur) + 1) % CELL_STATES.length];
    setCells(prev => ({ ...prev, [minterm]: next }));
  };

  const groups = useMemo(() => findGroups(cells, numVars), [cells, numVars]);

  const trueOnes = Object.entries(cells).filter(([, v]) => v === '1').map(([k]) => parseInt(k));
  const dontCares = Object.entries(cells).filter(([, v]) => v === 'X').map(([k]) => parseInt(k));

  const sopTerms = groups.map(g => g.term);
  const sop = sopTerms.length === 0
    ? (trueOnes.length === 0 ? 'F = 0' : 'F = 1')
    : 'F = ' + sopTerms.join(' + ');

  // Row labels
  const rowLabels = numVars <= 2
    ? GRAY2.map(v => getVarName(0) + '=' + v)
    : GRAY2.map(v => getVarName(0) + '=' + v);

  // Col labels
  const colLabels = numVars === 2
    ? GRAY2.map(v => getVarName(1) + '=' + v)
    : numVars === 3
    ? GRAY4.map(v => {
        const b = (v >> 1) & 1, c = v & 1;
        return `${getVarName(1)}${getVarName(2)}=${b}${c}`;
      })
    : GRAY4.map(v => {
        const c = (v >> 1) & 1, d = v & 1;
        return `${getVarName(2)}${getVarName(3)}=${c}${d}`;
      });

  // Row label for 4-var: rows are AB
  const rowLabel4 = numVars === 4
    ? GRAY4.map(v => {
        const a = (v >> 1) & 1, b = v & 1;
        return `${getVarName(0)}${getVarName(1)}=${a}${b}`;
      })
    : null;

  const actualRows = numVars === 4 ? 4 : 2;

  // Which group(s) cover each cell
  const cellGroups = useMemo(() => {
    const map = {};
    groups.forEach((g, gi) => {
      for (const m of g.minterms) {
        if (!map[m]) map[m] = [];
        map[m].push(gi);
      }
    });
    return map;
  }, [groups]);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>Karnaugh Map</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => handleVarChange(n)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                border: '2px solid',
                borderColor: numVars === n ? '#6366f1' : '#e2e8f0',
                background: numVars === n ? '#6366f1' : 'transparent',
                color: numVars === n ? 'white' : '#64748b',
                cursor: 'pointer',
              }}
            >
              {n} vars
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Click cells: 0 → 1 → X (don't care)</span>
      </div>

      {/* K-Map grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ width: 70, fontSize: 10, color: '#94a3b8', fontWeight: 600, textAlign: 'right', paddingRight: 8 }}>
                {numVars === 4 ? `${getVarName(0)}${getVarName(1)} \\ ${getVarName(2)}${getVarName(3)}` : `${rowLabels[0].split('=')[0]} \\ ${colLabels[0].split('=')[0]}`}
              </th>
              {colLabels.map((label, ci) => (
                <th key={ci} style={{ width: 52, fontSize: 10, color: '#6366f1', fontWeight: 700, textAlign: 'center', padding: '0 4px 6px' }}>
                  {label.split('=')[1]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: actualRows }, (_, ri) => (
              <tr key={ri}>
                <td style={{ fontSize: 10, color: '#6366f1', fontWeight: 700, textAlign: 'right', paddingRight: 8 }}>
                  {numVars === 4 ? (rowLabel4?.[ri]?.split('=')[1] ?? '') : rowLabels[ri]?.split('=')[1] ?? ''}
                </td>
                {Array.from({ length: cols }, (_, ci) => {
                  const minterm = cellMinterm(ri, ci, numVars);
                  const val = cells[minterm] ?? '0';
                  const groupList = cellGroups[minterm] ?? [];
                  const primaryGroup = groupList[0];

                  let bg = val === '1' ? '#d1fae5' : val === 'X' ? '#fef3c7' : '#f8fafc';
                  if (primaryGroup !== undefined) {
                    const colors = ['#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa', '#a5f3fc'];
                    bg = colors[primaryGroup % colors.length];
                  }

                  return (
                    <td key={ci}
                      onClick={() => cycleCell(minterm)}
                      style={{
                        width: 52, height: 44,
                        border: '2px solid #e2e8f0',
                        borderRadius: 6,
                        background: bg,
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: 16,
                        fontWeight: 700,
                        color: val === '1' ? '#065f46' : val === 'X' ? '#92400e' : '#94a3b8',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                      title={`m${minterm}`}
                    >
                      {val === 'X' ? '×' : val}
                      <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 9, color: '#94a3b8', fontWeight: 400 }}>{minterm}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {groups.map((g, gi) => {
          const colors = ['#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa', '#a5f3fc'];
          const termClean = g.term.replace(/̅/g, '̅');
          return (
            <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: colors[gi % colors.length], border: '1px solid #cbd5e1' }} />
              <span style={{ fontFamily: 'monospace', color: '#1e293b' }}>{termClean}</span>
            </div>
          );
        })}
      </div>

      {/* SOP Result */}
      <div style={{
        background: groups.length > 0 ? '#f0fdf4' : '#f8fafc',
        border: `1px solid ${groups.length > 0 ? '#86efac' : '#e2e8f0'}`,
        borderRadius: 10, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Minimal SOP</span>
        <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#065f46', letterSpacing: 1 }}>{sop}</span>
      </div>

      {/* Minterm notation */}
      {trueOnes.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
          F = Σm({trueOnes.sort((a,b)=>a-b).join(', ')})
          {dontCares.length > 0 && ` + d(${dontCares.sort((a,b)=>a-b).join(', ')})`}
        </div>
      )}
    </div>
  );
}
