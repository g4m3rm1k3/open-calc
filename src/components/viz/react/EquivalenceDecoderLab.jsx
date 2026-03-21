import React, { useState } from 'react';

export default function EquivalenceDecoderLab() {
  const [hovered, setHovered] = useState('NONE');

  const decodings = {
    NONE: 'Hover over the mathematical symbols to instantly decode the dense grouping grammar.',
    BRACKET: 'The Structural Envelope: In modern math, square brackets strictly denote an "Equivalence Class". It physically represents the entire bucket of matched items as one single super-object.',
    CORE: 'The Representative (The Anchor): We use the random element "a" to formally name the entire bucket. Anyone who is strictly mathematically identical to "a" gets thrown in here.',
    RELATION: 'The subscript "R" explicitly specifies exactly which structural Relation Rule we used to do the sorting (e.g., Modulo 3 sorting).'
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6 flex flex-col items-center">
      
      <div className="text-center mb-10">
        <h3 className="text-white font-bold text-xl mb-1">Equivalence Notation Decoder</h3>
        <p className="text-slate-400 text-sm">Decoding the syntax of mathematical categorization.</p>
      </div>

      <div className="flex items-center justify-center font-serif italic text-4xl sm:text-5xl md:text-6xl font-bold gap-1 md:gap-2 cursor-pointer select-none">
        
        <span 
           onMouseEnter={() => setHovered('BRACKET')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 p-2 rounded ${hovered === 'BRACKET' ? 'text-amber-400 bg-amber-900/30' : 'text-slate-300'}`}
        >
          [
        </span>
        
        <span 
           onMouseEnter={() => setHovered('CORE')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 px-4 py-2 rounded text-5xl sm:text-6xl md:text-7xl ${hovered === 'CORE' ? 'text-emerald-400 bg-emerald-900/30' : 'text-white'}`}
        >
          a
        </span>
        
        <span 
           onMouseEnter={() => setHovered('BRACKET')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 p-2 rounded ${hovered === 'BRACKET' ? 'text-amber-400 bg-amber-900/30' : 'text-slate-300'}`}
        >
          ]
        </span>
        
        <span 
           onMouseEnter={() => setHovered('RELATION')} 
           onMouseLeave={() => setHovered('NONE')}
           className={`transition-colors duration-300 p-1 rounded text-2xl sm:text-3xl mt-12 sm:mt-16 ${hovered === 'RELATION' ? 'text-brand-400 bg-brand-900/30' : 'text-slate-500'}`}
        >
          R
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
