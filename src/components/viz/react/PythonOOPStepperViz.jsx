import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'blueprint',
    title: '1. The Class Blueprint',
    description: 'A class defines the shape and behavior of objects, but it is not the object itself. It sits in memory waiting to be used.',
    code: `class Dog:
    species = "Canis familiaris"

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return f"{self.name} says woof!"`
  },
  {
    id: 'instantiation',
    title: '2. Instantiation (Creating Objects)',
    description: 'When you call Dog(), Python allocates a new chunk of memory for the object, then runs __init__ to set up its unique instance variables.',
    code: `rex = Dog("Rex", 3)
bella = Dog("Bella", 5)`
  },
  {
    id: 'variables',
    title: '3. Instance vs Class Variables',
    description: 'Every dog gets its own personal name and age. But the species variable is shared at the class level to save memory.',
    code: `print(rex.name)       # "Rex"
print(bella.name)     # "Bella"
print(rex.species)    # "Canis familiaris"
print(Dog.species)    # "Canis familiaris"`
  },
  {
    id: 'mro',
    title: '4. Method Resolution Order (MRO)',
    description: 'When you call a method, Python looks at the object first, then the class, then the parent classes.',
    code: `class ShowDog(Dog):
    def bark(self):
        return f"{self.name} says arf elegantly!"

fifi = ShowDog("Fifi", 2)
fifi.bark()  # Starts at object -> ShowDog -> Dog`
  }
];

export default function PythonOOPStepperViz() {
  const [stepIdx, setStepIdx] = useState(0);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-sans">
      <h3 className="text-lg font-semibold mb-1 text-slate-800 dark:text-slate-100">OOP Walkthrough</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Follow the steps to build an intuition for classes, objects, and inheritance.
      </p>

      {/* Stepper Dots */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setStepIdx(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i === stepIdx ? 'bg-indigo-500' : i < stepIdx ? 'bg-indigo-300 dark:bg-indigo-800' : 'bg-slate-200 dark:bg-slate-700'}`} 
            aria-label={`Go to step ${i+1}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left Column: Code and Explanation */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 shadow-sm min-h-[140px]">
            <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">{STEPS[stepIdx].title}</h4>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              {stepIdx === 0 && <BlueprintVisual />}
              {stepIdx === 1 && <InstantiationVisual />}
              {stepIdx === 2 && <VariablesVisual />}
              {stepIdx === 3 && <MROVisual />}
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
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors shadow-sm"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

// --- Visual Components for each step ---

function BlueprintVisual() {
  return (
    <div className="flex flex-col items-center">
      <div className="border-2 border-dashed border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 w-48 text-center relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          Class (Blueprint)
        </div>
        <h4 className="font-bold text-lg text-indigo-700 dark:text-indigo-300 mt-2 mb-2">Dog</h4>
        <div className="text-xs text-left w-full space-y-1 text-slate-600 dark:text-slate-400">
          <p className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">species="Canis..."</p>
          <div className="h-px bg-indigo-200 dark:bg-indigo-800 my-2" />
          <p className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">__init__(name, age)</p>
          <p className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">bark()</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4 text-center max-w-[200px]">
        The blueprint exists in memory once, holding shared data and methods.
      </p>
    </div>
  );
}

function InstantiationVisual() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-around w-full mt-4 relative">
        {/* Class */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 opacity-50 scale-75">
          <BlueprintVisual />
        </div>
        
        {/* Lines from class to objects */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <path d="M 50% 0 L 25% 60" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          <path d="M 50% 0 L 75% 60" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        </svg>

        {/* Object 1 */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400 rounded-xl p-3 w-36 z-10 relative mt-[60px]"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
            Object (Instance)
          </div>
          <p className="font-bold text-center text-emerald-700 dark:text-emerald-300 mt-2 mb-2 text-sm">rex</p>
          <div className="text-xs space-y-1">
            <p className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded shadow-sm text-slate-700 dark:text-slate-300">name: "Rex"</p>
            <p className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded shadow-sm text-slate-700 dark:text-slate-300">age: 3</p>
          </div>
        </motion.div>

        {/* Object 2 */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 rounded-xl p-3 w-36 z-10 relative mt-[60px]"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
            Object (Instance)
          </div>
          <p className="font-bold text-center text-amber-700 dark:text-amber-300 mt-2 mb-2 text-sm">bella</p>
          <div className="text-xs space-y-1">
            <p className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded shadow-sm text-slate-700 dark:text-slate-300">name: "Bella"</p>
            <p className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded shadow-sm text-slate-700 dark:text-slate-300">age: 5</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function VariablesVisual() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 w-full mb-6 border border-slate-300 dark:border-slate-600 relative">
        <span className="absolute -top-2 left-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">CLASS SCOPE</span>
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">Dog</span>
          <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">species: "Canis familiaris"</span>
        </div>
      </div>
      
      <div className="flex justify-around w-full relative">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, top: '-30px' }}>
          <path d="M 50% 0 L 25% 30" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M 50% 0 L 75% 30" stroke="#cbd5e1" strokeWidth="2" fill="none" />
        </svg>

        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-400 rounded-xl p-3 w-[45%] z-10 relative">
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">rex</span>
          <div className="mt-2 text-[11px] font-mono space-y-1 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between bg-slate-50 dark:bg-slate-800 p-1 rounded"><span>name:</span> <span>"Rex"</span></div>
            <div className="flex justify-between bg-slate-50 dark:bg-slate-800 p-1 rounded"><span>age:</span> <span>3</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-amber-400 rounded-xl p-3 w-[45%] z-10 relative">
          <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">bella</span>
          <div className="mt-2 text-[11px] font-mono space-y-1 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between bg-slate-50 dark:bg-slate-800 p-1 rounded"><span>name:</span> <span>"Bella"</span></div>
            <div className="flex justify-between bg-slate-50 dark:bg-slate-800 p-1 rounded"><span>age:</span> <span>5</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MROVisual() {
  const [stage, setStage] = useState(0);

  // Auto animation sequence
  React.useEffect(() => {
    const timer = setInterval(() => {
      setStage(s => (s + 1) % 5); // 0,1,2,3,4
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center w-full relative pt-4">
      {/* Dog Class */}
      <div className={`border-2 rounded-xl p-2 w-32 text-center relative transition-colors ${stage === 3 ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'}`}>
        <span className="font-bold text-sm text-indigo-700 dark:text-indigo-300">Dog</span>
        <div className="text-[10px] font-mono mt-1 text-slate-600 dark:text-slate-400">bark()</div>
        {stage === 3 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">!</motion.div>
        )}
      </div>

      <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-600 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-1 text-[8px] text-slate-400 tracking-widest">INHERITS</div>
      </div>

      {/* ShowDog Class */}
      <div className={`border-2 rounded-xl p-2 w-36 text-center relative transition-colors ${stage === 2 ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'border-teal-300 bg-teal-50 dark:bg-teal-900/20'}`}>
        <span className="font-bold text-sm text-teal-700 dark:text-teal-300">ShowDog</span>
        <div className="text-[10px] font-mono mt-1 text-slate-600 dark:text-slate-400">bark() (overridden)</div>
        {stage === 2 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✓</motion.div>
        )}
      </div>

      <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-600 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-1 text-[8px] text-slate-400 tracking-widest">INSTANCE</div>
      </div>

      {/* fifi object */}
      <div className={`border-2 rounded-xl p-2 w-32 text-center relative transition-colors ${stage === 1 ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'}`}>
        <span className="font-bold text-sm text-amber-700 dark:text-amber-300">fifi</span>
        <div className="text-[10px] font-mono mt-1 text-slate-600 dark:text-slate-400">name="Fifi"</div>
        {stage === 1 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">?</motion.div>
        )}
      </div>

      <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
        {stage === 0 && "> fifi.bark()"}
        {stage === 1 && "1. Look in object dictionary... Not found"}
        {stage === 2 && "2. Look in class ShowDog... Found!"}
        {stage === 3 && "(Would check Dog if not in ShowDog)"}
        {stage === 4 && "Output: 'Fifi says arf elegantly!'"}
      </div>
    </div>
  );
}
