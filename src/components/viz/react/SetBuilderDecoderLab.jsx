import React, { useState } from 'react';

export default function SetBuilderDecoderLab() {
  const [hovered, setHovered] = useState('NONE'); // BRACES, INGREDIENTS, PIPE, RULE

  const decodings = {
    NONE: 'Hover over any mathematical symbol sequence to decode its meaning.',
    BRACES: 'The Curly Braces literally just mean "The Set of all..." They form the physical bag containing the items.',
    INGREDIENTS: 'The Universe (Ingredients): We are officially targeting "x", and x must be strictly pulled from ℤ (The infinite Integers).',
    PIPE: 'The Sieve Filter Pipe. Read this line simply as "...such that..."',
    RULE: 'The Conditional Rule: The Integer we pulled must be strictly greater than 5, AND it must be an Even number.'
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6 flex flex-col items-center">
      
      <div className="text-center mb-10">
        <h3 className="text-white font-bold text-xl mb-1">Set-Builder Syntax Decoder</h3>
        <p className="text-slate-400 text-sm">Translating dense alien mathematical symbols back into a plain English sentence.</p>
      </div>

      <div className="flex items-center justify-center font-mono text-3xl sm:text-4xl md:text-5xl font-bold gap-1 md:gap-2 cursor-pointer select-none flex-wrap">
        
        <span 
           onMouseEnter={() => setHovered('BRACES')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 p-2 rounded ${hovered === 'BRACES' ? 'text-amber-400 bg-amber-900/30' : 'text-slate-300'}`}
        >
          {"{"}
        </span>
        
        <span 
           onMouseEnter={() => setHovered('INGREDIENTS')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 p-2 rounded tracking-widest ${hovered === 'INGREDIENTS' ? 'text-emerald-400 bg-emerald-900/30' : 'text-white'}`}
        >
          x ∈ ℤ
        </span>
        
        <span 
           onMouseEnter={() => setHovered('PIPE')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 p-2 rounded ${hovered === 'PIPE' ? 'text-brand-400 bg-brand-900/30 scale-125' : 'text-slate-500'}`}
        >
          |
        </span>
        
        <span 
           onMouseEnter={() => setHovered('RULE')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 p-2 rounded tracking-tighter sm:tracking-normal ${hovered === 'RULE' ? 'text-pink-400 bg-pink-900/30' : 'text-slate-300'}`}
        >
          x &gt; 5 ∧ Even(x)
        </span>

        <span 
           onMouseEnter={() => setHovered('BRACES')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 p-2 rounded ${hovered === 'BRACES' ? 'text-amber-400 bg-amber-900/30' : 'text-slate-300'}`}
        >
          {"}"}
        </span>

      </div>

      <div className="mt-12 w-full max-w-2xl min-h-[100px] border-2 border-dashed border-slate-600 rounded-lg p-6 flex items-center justify-center bg-slate-950 transition-colors duration-300 text-center">
         <p className={`text-lg font-medium transition-colors duration-300 ${hovered !== 'NONE' ? 'text-white' : 'text-slate-500'}`}>
            {decodings[hovered]}
         </p>
      </div>

    </div>
  );
}
