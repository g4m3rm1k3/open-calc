import { useMemo, useState } from 'react'

const NODES = ['a', 'b', 'c']

function makeEmptyMatrix(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => false))
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row])
}

function matrixFromPreset(name) {
  const m = makeEmptyMatrix(3)

  if (name === 'identity') {
    for (let i = 0; i < 3; i += 1) m[i][i] = true
    return m
  }

  if (name === 'equivalenceTwoClasses') {
    m[0][0] = true
    m[1][1] = true
    m[2][2] = true
    m[0][1] = true
    m[1][0] = true
    return m
  }

  if (name === 'partialOrder') {
    for (let i = 0; i < 3; i += 1) m[i][i] = true
    m[0][1] = true
    m[0][2] = true
    m[1][2] = true
    return m
  }

  return m
}

function isReflexive(matrix) {
  for (let i = 0; i < matrix.length; i += 1) {
    if (!matrix[i][i]) return false
  }
  return true
}

function isSymmetric(matrix) {
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix.length; j += 1) {
      if (matrix[i][j] !== matrix[j][i]) return false
    }
  }
  return true
}

function isAntisymmetric(matrix) {
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix.length; j += 1) {
      if (i !== j && matrix[i][j] && matrix[j][i]) return false
    }
  }
  return true
}

function isTransitive(matrix) {
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix.length; j += 1) {
      if (!matrix[i][j]) continue
      for (let k = 0; k < matrix.length; k += 1) {
        if (matrix[j][k] && !matrix[i][k]) return false
      }
    }
  }
  return true
}

export default function RelationMatrixLab() {
  const [matrix, setMatrix] = useState(() => matrixFromPreset('identity'))

  const properties = useMemo(() => {
    const reflexive = isReflexive(matrix)
    const symmetric = isSymmetric(matrix)
    const antisymmetric = isAntisymmetric(matrix)
    const transitive = isTransitive(matrix)

    return {
      reflexive,
      symmetric,
      antisymmetric,
      transitive,
      equivalenceRelation: reflexive && symmetric && transitive,
      partialOrder: reflexive && antisymmetric && transitive,
    }
  }, [matrix])

  const toggle = (row, col) => {
    setMatrix((prev) => {
      const next = cloneMatrix(prev)
      next[row][col] = !next[row][col]
      return next
    })
  }

  const applyPreset = (name) => {
    setMatrix(matrixFromPreset(name))
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Relation Matrix Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Build a relation on {'{a,b,c}'} and see whether it is reflexive, symmetric, antisymmetric, transitive,
        an equivalence relation, or a partial order.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => applyPreset('identity')}
          className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-sm font-medium"
        >
          Identity
        </button>
        <button
          onClick={() => applyPreset('equivalenceTwoClasses')}
          className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-sm font-medium"
        >
          Equivalence Example
        </button>
        <button
          onClick={() => applyPreset('partialOrder')}
          className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-sm font-medium"
        >
          Partial Order Example
        </button>
        <button
          onClick={() => setMatrix(makeEmptyMatrix(3))}
          className="px-3 py-1.5 rounded bg-rose-100 dark:bg-rose-900/30 text-sm font-medium"
        >
          Clear
        </button>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-slate-300 dark:border-slate-700"></th>
              {NODES.map((node) => (
                <th key={`head-${node}`} className="p-2 border border-slate-300 dark:border-slate-700">
                  {node}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NODES.map((rowNode, r) => (
              <tr key={`row-${rowNode}`}>
                <th className="p-2 border border-slate-300 dark:border-slate-700">{rowNode}</th>
                {NODES.map((colNode, c) => (
                  <td key={`${rowNode}-${colNode}`} className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                    <button
                      onClick={() => toggle(r, c)}
                      className={`px-2 py-1 rounded font-semibold ${
                        matrix[r][c]
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {matrix[r][c] ? '1' : '0'}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <p className={properties.reflexive ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
          Reflexive: {String(properties.reflexive)}
        </p>
        <p className={properties.symmetric ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
          Symmetric: {String(properties.symmetric)}
        </p>
        <p className={properties.antisymmetric ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
          Antisymmetric: {String(properties.antisymmetric)}
        </p>
        <p className={properties.transitive ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
          Transitive: {String(properties.transitive)}
        </p>
        <p className={properties.equivalenceRelation ? 'text-emerald-600 font-semibold' : 'text-slate-700 dark:text-slate-200'}>
          Equivalence relation: {String(properties.equivalenceRelation)}
        </p>
        <p className={properties.partialOrder ? 'text-emerald-600 font-semibold' : 'text-slate-700 dark:text-slate-200'}>
          Partial order: {String(properties.partialOrder)}
        </p>
      </div>
    </div>
  )
}
