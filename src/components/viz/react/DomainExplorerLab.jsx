import React, { useState } from 'react';

export default function DomainExplorerLab() {
  const [domain, setDomain] = useState('N'); // 'N', 'Z', 'C', 'EMPTY'

  // Predicate: P(x) = (x < 0)
  // Predicate: Q(x) = (x^2 + 1 = 0)
  // Predicate: R(x) = (x == 5)

  const tests = [
    { 
      label: '∃x (x < 0)', 
      N: { val: false, reason: 'N is strictly {0, 1, 2...}' },
      Z: { val: true, reason: 'x = -1 works exactly.' },
      C: { val: true, reason: 'x = -1 works exactly.' },
      EMPTY: { val: false, reason: 'There are literally no elements.' }
    },
    { 
      label: '∃x (x² + 1 = 0)', 
      N: { val: false, reason: 'Only gives positive results.' },
      Z: { val: false, reason: 'Squaring ANY integer goes positive.' },
      C: { val: true, reason: 'x = i (imaginary unit) works!' },
      EMPTY: { val: false, reason: 'Empty set has no witnesses.' }
    },
    { 
      label: '∀x (x > 9999)', 
      N: { val: false, reason: 'x = 0 instantly breaks this.' },
      Z: { val: false, reason: 'x = 0 instantly breaks this.' },
      C: { val: false, reason: 'Hundreds of counterexamples.' },
      EMPTY: { val: true, reason: 'Vacuously True! There are no numbers to break it.' }
    }
  ];

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-lg mb-1">The Domain Override</h3>
        <p className="text-slate-400 text-sm">Truth is relative to the Universe it lives in.</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button onClick={() => setDomain('N')} className={`px-4 py-2 font-bold rounded-lg text-sm transition-colors border-b-4 ${domain === 'N' ? 'bg-amber-500 border-amber-700 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
           ℕ (Natural Numbers)
        </button>
        <button onClick={() => setDomain('Z')} className={`px-4 py-2 font-bold rounded-lg text-sm transition-colors border-b-4 ${domain === 'Z' ? 'bg-blue-500 border-blue-700 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
           ℤ (All Integers)
        </button>
        <button onClick={() => setDomain('C')} className={`px-4 py-2 font-bold rounded-lg text-sm transition-colors border-b-4 ${domain === 'C' ? 'bg-emerald-500 border-emerald-700 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
           ℂ (Complex Numbers)
        </button>
        <button onClick={() => setDomain('EMPTY')} className={`px-4 py-2 font-bold rounded-lg text-sm transition-colors border-b-4 ${domain === 'EMPTY' ? 'bg-purple-500 border-purple-700 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
           ∅ (Empty Set)
        </button>
      </div>

      <div className="space-y-4">
        {tests.map((test, idx) => {
          const res = test[domain];
          return (
            <div key={idx} className={`p-4 rounded-lg flex flex-col md:flex-row items-center justify-between border-l-4 transition-colors duration-500 ${res.val ? 'bg-emerald-900/20 border-emerald-500' : 'bg-red-900/20 border-red-500'}`}>
               <div className="font-mono text-lg text-slate-200 font-bold tracking-widest">{test.label}</div>
               <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <span className="text-sm text-slate-400 max-w-[200px] text-right">{res.reason}</span>
                  <div className={`w-20 text-center py-1 rounded font-bold text-sm shadow-md ${res.val ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {res.val ? 'TRUE' : 'FALSE'}
                  </div>
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
