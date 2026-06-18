import React, { useMemo, useState } from 'react';

function keyOf(a, b) {
  return `${a}-${b}`;
}

export default function RelationsExplorer({ params = {} }) {
  const { guided = true, initialMode = 'equivalence' } = params;

  const [elements, setElements] = useState([1, 2, 3, 4]);
  const [newElement, setNewElement] = useState('');
  const [mode, setMode] = useState(initialMode === 'order' ? 'order' : 'equivalence');
  const [relation, setRelation] = useState(() => {
    const seeded = new Set();
    [1, 2, 3, 4].forEach((n) => seeded.add(keyOf(n, n)));
    return seeded;
  });

  const sortedElements = useMemo(() => [...elements].sort((a, b) => a - b), [elements]);

  const addElement = () => {
    const value = Number.parseInt(newElement, 10);
    if (Number.isNaN(value) || elements.includes(value)) {
      setNewElement('');
      return;
    }

    const next = [...elements, value].sort((a, b) => a - b);
    const nextRel = new Set(relation);
    next.forEach((n) => nextRel.add(keyOf(n, n)));

    setElements(next);
    setRelation(nextRel);
    setNewElement('');
  };

  const togglePair = (a, b) => {
    const next = new Set(relation);
    const ab = keyOf(a, b);
    const ba = keyOf(b, a);

    if (mode === 'equivalence' && a !== b) {
      if (next.has(ab) && next.has(ba)) {
        next.delete(ab);
        next.delete(ba);
      } else {
        next.add(ab);
        next.add(ba);
      }
    } else {
      if (next.has(ab)) next.delete(ab);
      else next.add(ab);
    }

    setRelation(next);
  };

  const ensureDiagonal = () => {
    const next = new Set(relation);
    sortedElements.forEach((n) => next.add(keyOf(n, n)));
    setRelation(next);
  };

  const clearOffDiagonal = () => {
    const next = new Set();
    sortedElements.forEach((n) => next.add(keyOf(n, n)));
    setRelation(next);
  };

  const isReflexive = useMemo(
    () => sortedElements.every((a) => relation.has(keyOf(a, a))),
    [sortedElements, relation]
  );

  const isSymmetric = useMemo(
    () => sortedElements.every((a) => sortedElements.every((b) => !relation.has(keyOf(a, b)) || relation.has(keyOf(b, a)))),
    [sortedElements, relation]
  );

  const isAntisymmetric = useMemo(
    () => sortedElements.every((a) => sortedElements.every((b) => a === b || !(relation.has(keyOf(a, b)) && relation.has(keyOf(b, a))))),
    [sortedElements, relation]
  );

  const transitivityViolation = useMemo(() => {
    for (const a of sortedElements) {
      for (const b of sortedElements) {
        for (const c of sortedElements) {
          if (relation.has(keyOf(a, b)) && relation.has(keyOf(b, c)) && !relation.has(keyOf(a, c))) {
            return { a, b, c };
          }
        }
      }
    }
    return null;
  }, [sortedElements, relation]);

  const isTransitive = transitivityViolation === null;

  const isEquivalence = isReflexive && isSymmetric && isTransitive;
  const isPartialOrder = isReflexive && isAntisymmetric && isTransitive;

  const tutorMessage =
    mode === 'equivalence'
      ? (isEquivalence
          ? 'Valid equivalence relation: reflexive, symmetric, and transitive all hold.'
          : 'In equivalence mode, keep refining until reflexive, symmetric, and transitive all hold.')
      : (isPartialOrder
          ? 'Valid partial order: reflexive, antisymmetric, and transitive all hold.'
          : 'In order mode, refine arrows until reflexive, antisymmetric, and transitive all hold.');

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6">
      {guided && (
        <div className="mb-6 p-5 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-600">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Guided Explorer</h4>
          <ol className="text-sm list-decimal pl-5 space-y-1 text-slate-700 dark:text-slate-200">
            <li>Keep all diagonal pairs to satisfy reflexivity.</li>
            <li>Use equivalence mode for bidirectional links.</li>
            <li>Use order mode for directional hierarchy links.</li>
            <li>Watch the property panel for exact pass/fail status.</li>
          </ol>
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setMode('equivalence')}
          className={`flex-1 py-2.5 rounded-2xl font-medium ${mode === 'equivalence' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
        >
          Equivalence Mode
        </button>
        <button
          onClick={() => setMode('order')}
          className={`flex-1 py-2.5 rounded-2xl font-medium ${mode === 'order' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
        >
          Partial Order Mode
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={newElement}
          onChange={(e) => setNewElement(e.target.value)}
          placeholder="Add element"
          className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-2xl font-mono bg-white dark:bg-slate-800"
        />
        <button onClick={addElement} className="px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl">Add</button>
        <button onClick={ensureDiagonal} className="px-5 bg-sky-700 text-white rounded-2xl">Fill Diagonal</button>
        <button onClick={clearOffDiagonal} className="px-5 bg-slate-600 text-white rounded-2xl">Reset Links</button>
      </div>

      <div className="overflow-auto mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              {sortedElements.map((a) => (
                <th key={`h-${a}`} className="p-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono">{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedElements.map((a) => (
              <tr key={`r-${a}`}>
                <td className="p-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-medium">{a}</td>
                {sortedElements.map((b) => {
                  const active = relation.has(keyOf(a, b));
                  const diagonal = a === b;
                  return (
                    <td
                      key={`${a}-${b}`}
                      onClick={() => togglePair(a, b)}
                      className={`p-2 border border-slate-300 dark:border-slate-700 text-center cursor-pointer select-none ${active ? (diagonal ? 'bg-amber-200 dark:bg-amber-800' : 'bg-orange-200 dark:bg-orange-800') : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      {active ? '1' : '0'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-6">
        <div className={`p-3 rounded-xl border ${isReflexive ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'}`}>
          Reflexive: {isReflexive ? 'yes' : 'no'}
        </div>
        <div className={`p-3 rounded-xl border ${isSymmetric ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'}`}>
          Symmetric: {isSymmetric ? 'yes' : 'no'}
        </div>
        <div className={`p-3 rounded-xl border ${isAntisymmetric ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'}`}>
          Antisymmetric: {isAntisymmetric ? 'yes' : 'no'}
        </div>
        <div className={`p-3 rounded-xl border ${isTransitive ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'}`}>
          Transitive: {isTransitive ? 'yes' : 'no'}
          {!isTransitive && transitivityViolation && (
            <div className="text-xs mt-1">Missing ({transitivityViolation.a}, {transitivityViolation.c}) while ({transitivityViolation.a}, {transitivityViolation.b}) and ({transitivityViolation.b}, {transitivityViolation.c}) exist.</div>
          )}
        </div>
      </div>

      <div className="p-5 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-2xl text-sm">
        <strong>Tutor insight:</strong> {tutorMessage}
      </div>

      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Current classification: {isEquivalence ? 'equivalence relation' : isPartialOrder ? 'partial order' : 'neither complete yet'}
      </div>
    </div>
  );
}
