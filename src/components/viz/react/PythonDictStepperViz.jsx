import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'hash',
    title: '1. The Hash Function',
    description: 'When you insert a key-value pair, Python runs the key through a hash function. This turns any string or number into a large integer.',
    code: `my_dict = {}
my_dict["apple"] = 42

# Under the hood:
h = hash("apple")
# -> -345129038475...`
  },
  {
    id: 'modulo',
    title: '2. Modulo & Bucket Sizing',
    description: 'Python uses the hash to find an index (a bucket) in an array. It does this by taking the hash modulo the array size (initially 8).',
    code: `# Given an array of size 8
index = hash("apple") % 8
# -> 5

# Python looks at bucket 5.`
  },
  {
    id: 'insert',
    title: '3. Insertion',
    description: 'Python stores the original key, the value, and the hash in the bucket. Storing the hash makes future comparisons faster.',
    code: `my_dict = {"apple": 42}
    
# Bucket 5 contains:
# [hash("apple"), "apple", 42]`
  },
  {
    id: 'collision',
    title: '4. Collisions & Probing',
    description: 'What if two keys hash to the same bucket? Python handles this using "open addressing" with probing. It looks for the next empty bucket according to a specific formula.',
    code: `my_dict["pear"] = 100
# Suppose hash("pear") % 8 == 5
# But bucket 5 is full!
    
# Probe sequence: check next buckets
# until an empty one is found.
# Places "pear" in bucket 6.`
  }
];

// Simplified hashing for visualization
const pseudoHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash);
};

export default function PythonDictStepperViz() {
  const [stepIdx, setStepIdx] = useState(0);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-sans">
      <h3 className="text-lg font-semibold mb-1 text-slate-800 dark:text-slate-100">Dictionary (Hash Map) Walkthrough</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Follow the steps to understand how Python stores keys and values in O(1) time.
      </p>

      {/* Stepper Dots */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setStepIdx(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i === stepIdx ? 'bg-amber-500' : i < stepIdx ? 'bg-amber-300 dark:bg-amber-800' : 'bg-slate-200 dark:bg-slate-700'}`} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left Column: Code and Explanation */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 shadow-sm min-h-[140px]">
            <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2">{STEPS[stepIdx].title}</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {STEPS[stepIdx].description}
            </p>
          </div>
          
          <div className="rounded-lg bg-slate-800 text-slate-100 p-4 font-mono text-xs md:text-sm overflow-x-auto shadow-inner relative">
            <div className="absolute top-0 right-0 px-2 py-1 bg-slate-700 text-slate-300 text-[10px] rounded-bl-lg rounded-tr-lg font-bold">PYTHON</div>
            <pre className="mt-2">
              <code>{STEPS[stepIdx].code}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <DictVisual stepIdx={stepIdx} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} 
          disabled={stepIdx === 0}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          ← Back
        </button>
        <button 
          onClick={() => setStepIdx(Math.min(STEPS.length - 1, stepIdx + 1))} 
          disabled={stepIdx === STEPS.length - 1}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-colors shadow-sm"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

function DictVisual({ stepIdx }) {
  const hashApple = pseudoHash("apple");
  const modApple = hashApple % 8; // 5

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      {/* Input */}
      <div className="flex gap-2 mb-6 items-center">
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg font-mono text-sm shadow-sm text-slate-800 dark:text-slate-200">
          "apple": 42
        </div>
        {stepIdx >= 3 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-pink-50 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-700 px-3 py-1.5 rounded-lg font-mono text-sm shadow-sm text-pink-700 dark:text-pink-300">
            "pear": 100
          </motion.div>
        )}
      </div>

      {/* Hash Function Box */}
      {stepIdx >= 0 && (
        <div className="relative mb-6">
          <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-600 mx-auto" />
          <motion.div 
            initial={stepIdx === 0 ? { rotateX: 90 } : false} 
            animate={{ rotateX: 0 }}
            className="bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 rounded-xl p-2 w-48 text-center"
          >
            <span className="font-bold text-amber-700 dark:text-amber-400 text-xs tracking-wider uppercase">Hash Function</span>
            <div className="font-mono text-xs mt-1 bg-white dark:bg-slate-800 rounded p-1">
              h = {hashApple}
            </div>
            {stepIdx >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[10px] mt-1 text-slate-500">
                {hashApple} % 8 = <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{modApple}</span>
              </motion.div>
            )}
          </motion.div>
          <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-600 mx-auto" />
        </div>
      )}

      {/* Array Buckets */}
      <div className="flex flex-wrap justify-center gap-1 w-full max-w-[300px]">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(idx => {
          let state = 'empty';
          let content = null;
          
          if (stepIdx >= 2 && idx === modApple) {
            state = 'filled';
            content = <div className="text-[9px] font-mono leading-tight">hash<br/>"apple"<br/>42</div>;
          }
          
          if (stepIdx >= 3 && idx === (modApple + 1) % 8) {
            state = 'probe';
            content = <div className="text-[9px] font-mono leading-tight">hash<br/>"pear"<br/>100</div>;
          }

          return (
            <motion.div 
              key={idx}
              layout
              className={`w-14 h-16 rounded border flex flex-col relative ${
                state === 'empty' ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 border-dashed' :
                state === 'filled' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 border-solid' :
                'bg-pink-50 dark:bg-pink-900/30 border-pink-400 border-solid'
              }`}
            >
              <div className="absolute top-0 left-0 w-full text-center text-[8px] bg-black/5 dark:bg-white/5 border-b border-inherit text-slate-500">
                {idx}
              </div>
              <div className="flex-1 flex items-center justify-center mt-3 p-0.5 text-center text-slate-700 dark:text-slate-300">
                {content}
              </div>
              {stepIdx >= 3 && idx === modApple && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -right-2 top-1/2 w-4 border-t-2 border-dashed border-pink-400" />
              )}
            </motion.div>
          );
        })}
      </div>
      
      {stepIdx >= 3 && (
        <div className="mt-4 text-xs text-pink-600 dark:text-pink-400 font-semibold bg-pink-50 dark:bg-pink-900/20 px-3 py-1 rounded">
          Collision at bucket 5! Probing to bucket 6...
        </div>
      )}
    </div>
  );
}
