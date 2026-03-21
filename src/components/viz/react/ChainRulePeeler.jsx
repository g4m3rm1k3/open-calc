import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChainRulePeeler = () => {
  // Layers: [outer, middle, inner...]
  // For sin(x^2): 
  // layers = [ { id: 'sin', label: 'sin(...)', deriv: 'cos(x²)' }, { id: 'x2', label: 'x²', deriv: '2x' } ]
  
  const [peeledIndex, setPeeledIndex] = useState(-1);

  const layers = [
    { id: 'cube', label: '( ... )³', content: '³', deriv: '3(sin(x²))²' },
    { id: 'sin', label: 'sin( ... )', content: 'sin', deriv: 'cos(x²)' },
    { id: 'x2', label: 'x²', content: 'x²', deriv: '2x' }
  ];

  // We are differentiating f(x) = (sin(x²))³
  
  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-6 my-6 flex flex-col items-center overflow-hidden">
      <h3 className="text-xl font-bold mb-2 text-center text-text">Click to "Peel the Onion"</h3>
      <p className="text-sm text-text-muted mb-8 max-w-2xl text-center">
        The Chain Rule works strictly from the outside in. Click the outermost layer to peel it away and apply its derivative locally.
      </p>

      {/* Interactive Expression */}
      <div className="flex items-center justify-center space-x-2 text-2xl font-mono mb-12">
        <div className="flex items-center">
          <span className="mr-4">f(x) =</span>
          
          <div className="relative flex items-center justify-center">
            {/* Base Inner */}
            <span className={`transition-opacity duration-300 ${peeledIndex >= 2 ? 'opacity-30' : 'opacity-100'} font-bold text-red-500`}>
              x²
            </span>
            
            {/* Middle Layer */}
            <button 
              onClick={() => setPeeledIndex(1)}
              disabled={peeledIndex >= 1}
              className={`absolute flex items-center justify-center whitespace-nowrap transition-all duration-500 ${peeledIndex >= 1 ? '-translate-y-12 opacity-0' : 'opacity-100 hover:scale-110'} bg-surface px-2 py-1 rounded cursor-pointer border border-blue-500/30 text-blue-500 font-bold`}
              style={{ minWidth: '100px' }}
            >
              sin(&nbsp;&nbsp;&nbsp;&nbsp;)
            </button>
            
            {/* Outer Layer */}
            <button 
               onClick={() => setPeeledIndex(0)}
               disabled={peeledIndex >= 0}
               className={`absolute flex items-center justify-center whitespace-nowrap transition-all duration-500 ${peeledIndex >= 0 ? '-translate-y-16 opacity-0' : 'opacity-100 hover:scale-110'} bg-surface px-3 py-2 rounded cursor-pointer border border-purple-500/50 text-purple-500 font-bold`}
               style={{ minWidth: '140px' }}
            >
              (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)³
            </button>
          </div>
        </div>
      </div>
      
      {/* Derivative Build-up Area */}
      <div className="w-full bg-surface-alt rounded-lg p-6 min-h-[120px] flex items-center justify-center relative shadow-inner">
        <div className="absolute top-2 left-4 text-xs font-bold text-text-muted uppercase tracking-wider">
          Live Derivative f'(x)
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2 text-xl font-mono">
          {peeledIndex < 0 && (
            <span className="text-text-muted italic opacity-50">Click the outermost layer above...</span>
          )}
          
          <AnimatePresence>
            {peeledIndex >= 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="text-purple-500 font-bold bg-purple-500/10 px-3 py-1 rounded"
              >
                3(sin(x²))²
              </motion.div>
            )}
            
            {peeledIndex >= 1 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="text-text font-bold"
              >
                ·
              </motion.div>
            )}
            
            {peeledIndex >= 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="text-blue-500 font-bold bg-blue-500/10 px-3 py-1 rounded"
              >
                cos(x²)
              </motion.div>
            )}
            
            {peeledIndex >= 2 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="text-text font-bold"
              >
                ·
              </motion.div>
            )}
            
            {peeledIndex >= 2 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded"
              >
                2x
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-6 flex gap-4">
        {peeledIndex < 2 && (
          <button 
            onClick={() => setPeeledIndex(p => p + 1)}
            className="px-6 py-2 bg-text-accent text-surface font-bold rounded-full hover:opacity-90 transition-opacity"
          >
            Peel Layer
          </button>
        )}
        <button 
          onClick={() => setPeeledIndex(-1)}
          className="px-6 py-2 border border-border text-text-muted font-bold rounded-full hover:bg-surface transition-colors"
        >
          Reset
        </button>
      </div>

    </div>
  );
};

export default ChainRulePeeler;
