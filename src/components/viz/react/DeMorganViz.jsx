import React, { useState } from 'react';

const VennDiagram = ({ law, highlighted }) => {
  const isDeMorgan1 = law === 'demorgan1';
  const isDeMorgan2 = law === 'demorgan2';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-48 mb-4">
        <svg viewBox="0 0 200 150" className="w-full h-full">
          {/* Circle P */}
          <circle
            cx="75"
            cy="75"
            r="50"
            fill="rgba(59, 130, 246, 0.3)"
            stroke="#3b82f6"
            strokeWidth="2"
            className={highlighted === 'P' ? 'animate-pulse' : ''}
          />
          <text x="75" y="80" textAnchor="middle" className="text-sm font-bold fill-blue-700">P</text>

          {/* Circle Q */}
          <circle
            cx="125"
            cy="75"
            r="50"
            fill="rgba(16, 185, 129, 0.3)"
            stroke="#10b981"
            strokeWidth="2"
            className={highlighted === 'Q' ? 'animate-pulse' : ''}
          />
          <text x="125" y="80" textAnchor="middle" className="text-sm font-bold fill-green-700">Q</text>

          {/* Intersection area */}
          <path
            d="M 75,75 A 50,50 0 0,1 125,75 A 50,50 0 0,1 75,75"
            fill="rgba(139, 92, 246, 0.4)"
            className={highlighted === 'intersection' ? 'animate-pulse' : ''}
          />

          {/* Labels for regions */}
          <text x="55" y="45" className="text-xs fill-gray-600">P∧Q</text>
          <text x="145" y="45" className="text-xs fill-gray-600">P∧Q</text>
          <text x="100" y="110" className="text-xs fill-gray-600">¬(P∧Q)</text>
        </svg>
      </div>

      <div className="text-center">
        <div className="text-lg font-mono mb-2">
          {isDeMorgan1 ? '¬(P ∧ Q)' : '¬(P ∨ Q)'}
        </div>
        <div className="text-sm text-gray-600">
          {isDeMorgan1 ? 'NOT (P AND Q)' : 'NOT (P OR Q)'}
        </div>
      </div>
    </div>
  );
};

export default function DeMorganViz() {
  const [selectedLaw, setSelectedLaw] = useState('demorgan1');
  const [highlighted, setHighlighted] = useState(null);

  const laws = {
    demorgan1: {
      name: "De Morgan's First Law",
      left: '¬(P ∧ Q)',
      right: '¬P ∨ ¬Q',
      description: 'NOT (P AND Q) is equivalent to (NOT P) OR (NOT Q)',
      code: '!(p && q) === (!p || !q)'
    },
    demorgan2: {
      name: "De Morgan's Second Law",
      left: '¬(P ∨ Q)',
      right: '¬P ∧ ¬Q',
      description: 'NOT (P OR Q) is equivalent to (NOT P) AND (NOT Q)',
      code: '!(p || q) === (!p && !q)'
    }
  };

  const currentLaw = laws[selectedLaw];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">De Morgan's Laws: Visual Proof</h2>

      <div className="mb-6">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setSelectedLaw('demorgan1')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              selectedLaw === 'demorgan1'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            First Law: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q
          </button>
          <button
            onClick={() => setSelectedLaw('demorgan2')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              selectedLaw === 'demorgan2'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Second Law: ¬(P ∨ Q) ≡ ¬P ∧ ¬Q
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">{currentLaw.name}</h3>
          <div className="flex items-center justify-center space-x-8 mb-4">
            <div className="text-center">
              <div className="text-2xl font-mono mb-2">{currentLaw.left}</div>
              <div className="text-sm text-gray-600">Left side</div>
            </div>
            <div className="text-3xl font-bold text-blue-600">≡</div>
            <div className="text-center">
              <div className="text-2xl font-mono mb-2">{currentLaw.right}</div>
              <div className="text-sm text-gray-600">Right side</div>
            </div>
          </div>
          <p className="text-center text-gray-700 mb-4">{currentLaw.description}</p>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm text-center">
            {currentLaw.code}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-bold mb-4">Visual Proof with Venn Diagrams</h3>
          <VennDiagram law={selectedLaw} highlighted={highlighted} />
          <p className="text-sm text-gray-600 mt-4">
            The shaded region represents the area that satisfies the expression.
            Both expressions shade exactly the same region, proving they're equivalent.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Interactive Truth Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2">P</th>
                  <th className="border border-gray-300 px-3 py-2">Q</th>
                  <th className="border border-gray-300 px-3 py-2">{currentLaw.left}</th>
                  <th className="border border-gray-300 px-3 py-2">{currentLaw.right}</th>
                  <th className="border border-gray-300 px-3 py-2">Equal?</th>
                </tr>
              </thead>
              <tbody>
                {[false, true].map(p =>
                  [false, true].map(q => {
                    const leftResult = selectedLaw === 'demorgan1' ? !(p && q) : !(p || q);
                    const rightResult = selectedLaw === 'demorgan1' ? (!p || !q) : (!p && !q);
                    return (
                      <tr key={`${p}-${q}`} className="text-center">
                        <td className="border border-gray-300 px-3 py-2 font-mono">
                          {p ? 'T' : 'F'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-mono">
                          {q ? 'T' : 'F'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-mono font-bold">
                          {leftResult ? 'T' : 'F'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-mono font-bold">
                          {rightResult ? 'T' : 'F'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <span className={leftResult === rightResult ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {leftResult === rightResult ? '✓' : '✗'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600">
            The truth table shows that both expressions have identical values for all possible inputs,
            proving they are logically equivalent.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Why De Morgan's Laws Matter</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Programming:</strong> Simplifies conditional logic - <code>!(x > 0 && y > 0)</code> becomes <code>x ≤ 0 || y ≤ 0</code></p>
          <p><strong>Circuit Design:</strong> NAND and NOR gates implement these laws in hardware</p>
          <p><strong>Set Theory:</strong> Complement of intersection = union of complements</p>
          <p><strong>Proof Writing:</strong> Essential for manipulating negations in logical arguments</p>
          <p><strong>Interactive Tip:</strong> Switch between the two laws to see how negation distributes over AND vs OR!</p>
        </div>
      </div>
    </div>
  );
}