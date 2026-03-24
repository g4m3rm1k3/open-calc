import React, { useMemo, useState } from 'react';

export default function SetsAndFunctionsExplorer({ params = {} }) {
  const { guided = true, initialMode = 'sets', mode = null } = params;

  const [activeMode, setActiveMode] = useState(mode || initialMode);
  const [setA, setSetA] = useState([1, 2, 3]);
  const [setB, setSetB] = useState([2, 3, 4]);
  const [newElement, setNewElement] = useState('');
  const [mapping, setMapping] = useState({ 1: 'a', 2: 'b', 3: 'a' });

  const codomain = ['a', 'b', 'c'];

  const union = useMemo(() => [...new Set([...setA, ...setB])], [setA, setB]);
  const intersection = useMemo(() => setA.filter((x) => setB.includes(x)), [setA, setB]);
  const difference = useMemo(() => setA.filter((x) => !setB.includes(x)), [setA, setB]);

  const images = useMemo(
    () => [...setA].sort((a, b) => a - b).map((x) => mapping[x] || codomain[0]),
    [mapping, setA]
  );
  const isInjective = useMemo(() => new Set(images).size === images.length, [images]);
  const isSurjective = useMemo(() => codomain.every((c) => images.includes(c)), [codomain, images]);
  const isBijective = isInjective && isSurjective;

  const addElement = (targetSet) => {
    if (!newElement.trim()) return;
    const num = Number.parseInt(newElement, 10);
    if (Number.isNaN(num)) return;

    if (targetSet === 'A' && !setA.includes(num)) setSetA([...setA, num].sort((a, b) => a - b));
    if (targetSet === 'B' && !setB.includes(num)) setSetB([...setB, num].sort((a, b) => a - b));
    setNewElement('');
  };

  const lockMode = mode === 'sets' || mode === 'functions';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6">
      {guided && (
        <div className="mb-6 p-5 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-600">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">This visualization is a mini-lesson</h4>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Hover over any <span className="underline decoration-dotted">underlined term</span> for a quick definition.
            Switch modes, build sets or mappings, and watch the tutor notes connect what you see to the formal definitions.
          </p>
        </div>
      )}

      {!lockMode && (
        <div className="flex gap-2 mb-6 border-b pb-4">
          <button
            onClick={() => setActiveMode('sets')}
            className={`flex-1 py-3 rounded-2xl font-medium transition-all ${activeMode === 'sets' ? 'bg-orange-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}
          >
            Set Operations
          </button>
          <button
            onClick={() => setActiveMode('functions')}
            className={`flex-1 py-3 rounded-2xl font-medium transition-all ${activeMode === 'functions' ? 'bg-orange-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}
          >
            Functions & Properties
          </button>
        </div>
      )}

      {activeMode === 'sets' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium mb-2">Set A = {'{'}{setA.join(', ')}{'}'}</div>
              <div className="flex flex-wrap gap-2">
                {setA.map((n) => <span key={n} className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-2xl font-mono">{n}</span>)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Set B = {'{'}{setB.join(', ')}{'}'}</div>
              <div className="flex flex-wrap gap-2">
                {setB.map((n) => <span key={n} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 rounded-2xl font-mono">{n}</span>)}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={newElement}
              onChange={(e) => setNewElement(e.target.value)}
              placeholder="Add element (number)"
              className="flex-1 p-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-mono focus:outline-none focus:border-orange-400"
            />
            <button onClick={() => addElement('A')} className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl">Add to A</button>
            <button onClick={() => addElement('B')} className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl">Add to B</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl">
              <strong>Union A ∪ B</strong><br />
              {union.join(', ') || '—'} <span className="text-xs text-slate-400">({union.length} elements)</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl">
              <strong>Intersection A ∩ B</strong><br />
              {intersection.join(', ') || '—'} <span className="text-xs text-slate-400">({intersection.length})</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl">
              <strong>A − B</strong><br />
              {difference.join(', ') || '—'}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="text-sm font-medium mb-4">f : {'{'}{setA.join(', ')}{'}'} → {'{'}{codomain.join(', ')}{'}'}</div>
            {[...setA].sort((a, b) => a - b).map((x) => (
              <div key={x} className="flex items-center gap-4 mb-3">
                <span className="font-mono w-12">{x} →</span>
                <select
                  value={mapping[x] || codomain[0]}
                  onChange={(e) => setMapping({ ...mapping, [x]: e.target.value })}
                  className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800"
                >
                  {codomain.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className={`p-6 rounded-3xl text-center font-semibold text-lg ${isBijective ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700' : isInjective ? 'bg-amber-100 dark:bg-amber-900 text-amber-700' : 'bg-red-100 dark:bg-red-900 text-red-700'}`}>
            {isBijective
              ? 'Bijective — perfect one-to-one correspondence'
              : isInjective
                ? 'Injective but misses some outputs'
                : 'Not injective — collisions exist'}
            <br />
            {isSurjective && 'Also surjective (onto)'}
          </div>
        </div>
      )}

      <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-3xl text-sm leading-relaxed">
        <strong>Connecting to the formal definitions:</strong><br />
        {activeMode === 'sets'
          ? 'Union, intersection, and difference are defined using logical operators (∨ and ∧), linking set operations directly to propositional logic.'
          : 'The visual mapping shows injective (no two inputs to the same output) and surjective (every codomain element is hit) exactly as used in the rigor section.'}
      </div>
    </div>
  );
}
