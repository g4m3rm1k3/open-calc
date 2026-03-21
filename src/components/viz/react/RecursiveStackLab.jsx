import React, { useState } from 'react';

export default function RecursiveStackLab() {
  const [target, setTarget] = useState(4);
  const [treeNodes, setTreeNodes] = useState([]);
  const [callStack, setCallStack] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const simulateExecution = async () => {
    setIsRunning(true);
    setTreeNodes([]);
    setCallStack([]);
    
    let baseDelay = 0;
    const addNode = (id, label, level, x, val, delayMult) => {
       setTimeout(() => {
          setTreeNodes(prev => [...prev, { id, label, level, x, val, state: 'waiting' }]);
          setCallStack(prev => [{id, label}, ...prev]); // Push to Stack (rendering top-down)
       }, baseDelay + (delayMult * 400));
    };

    const resolveNode = (id, delayMult) => {
       setTimeout(() => {
          setTreeNodes(prev => prev.map(n => n.id === id ? { ...n, state: 'resolved' } : n));
          setCallStack(prev => prev.filter(n => n.id !== id)); // Pop from Stack
       }, baseDelay + (delayMult * 400));
    }

    if (target === 4) {
       // Expand (Push)
       addNode('f4', 'F(4)', 0, 50, 3, 0);
       addNode('f3', 'F(3)', 1, 30, 2, 1);
       addNode('f2_a', 'F(2)', 2, 15, 1, 2);
       addNode('f1_a', 'F(1)', 3, 5, 1, 3);
       // Resolving the first base case hits instantly in runtime:
       resolveNode('f1_a', 4);

       addNode('f0_a', 'F(0)', 3, 25, 0, 5);
       resolveNode('f0_a', 6);
       
       // Now F(2) pops
       resolveNode('f2_a', 7);

       // Now build right side of F(3)
       addNode('f1_b', 'F(1)', 2, 45, 1, 8);
       resolveNode('f1_b', 9);
       
       // Now F(3) pops
       resolveNode('f3', 10);

       // Right master branch F(2)
       addNode('f2_b', 'F(2)', 1, 70, 1, 11);
       addNode('f1_c', 'F(1)', 2, 60, 1, 12);
       resolveNode('f1_c', 13);
       addNode('f0_b', 'F(0)', 2, 80, 0, 14);
       resolveNode('f0_b', 15);
       
       // F(2) right pops
       resolveNode('f2_b', 16);
       
       // F(4) master pops
       resolveNode('f4', 17);
       
       setTimeout(() => setIsRunning(false), (18 * 400));
    }
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">The Recursive Architecture (Strong Induction)</h3>
        <p className="text-slate-400 text-sm">Mapping the Call Stack logic for <code className="text-brand-400 font-bold mx-1">Fibonacci(4)</code>.</p>
      </div>

      <div className="flex justify-center mb-8">
         <button 
           onClick={simulateExecution} 
           disabled={isRunning}
           className="px-8 py-3 rounded-lg font-bold uppercase transition-all duration-300 shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:grayscale"
         >
           {isRunning ? 'Executing Logic Stack...' : 'Commence Recursion Stack Trace'}
         </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch w-full">
         
         {/* The Main Execution Tree */}
         <div className="relative w-full h-[350px] bg-slate-950 border-2 border-slate-800 rounded-xl overflow-hidden max-w-lg flex items-center justify-center">
            
            {treeNodes.length === 0 && !isRunning && (
               <div className="text-slate-600 font-mono italic text-sm absolute text-center px-4">
                  CPU Heap is empty.<br/>Push the button to force the CPU to strictly unpack the logic tree.
               </div>
            )}

            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
               {treeNodes.find(n => n.id === 'f3') && <line x1="50%" y1="15%" x2="30%" y2="40%" stroke="#475569" strokeWidth="2" />}
               {treeNodes.find(n => n.id === 'f2_b') && <line x1="50%" y1="15%" x2="70%" y2="40%" stroke="#475569" strokeWidth="2" />}
               {treeNodes.find(n => n.id === 'f2_a') && <line x1="30%" y1="40%" x2="15%" y2="65%" stroke="#475569" strokeWidth="2" />}
               {treeNodes.find(n => n.id === 'f1_b') && <line x1="30%" y1="40%" x2="45%" y2="65%" stroke="#475569" strokeWidth="2" />}
               {treeNodes.find(n => n.id === 'f1_a') && <line x1="15%" y1="65%" x2="5%" y2="90%" stroke="#475569" strokeWidth="2" />}
               {treeNodes.find(n => n.id === 'f0_a') && <line x1="15%" y1="65%" x2="25%" y2="90%" stroke="#475569" strokeWidth="2" />}
               {treeNodes.find(n => n.id === 'f1_c') && <line x1="70%" y1="40%" x2="60%" y2="65%" stroke="#475569" strokeWidth="2" />}
               {treeNodes.find(n => n.id === 'f0_b') && <line x1="70%" y1="40%" x2="80%" y2="65%" stroke="#475569" strokeWidth="2" />}
            </svg>

            {treeNodes.map(node => (
               <div 
                  key={node.id}
                  className={`absolute w-12 h-12 md:w-14 md:h-14 -ml-6 -mt-6 md:-ml-7 md:-mt-7 rounded-full flex items-center justify-center border-2 font-bold font-mono transition-all duration-500 shadow-lg text-xs md:text-sm
                     ${node.state === 'resolved' ? 'bg-amber-500 border-amber-300 text-amber-950 scale-110 shadow-[0_0_20px_#fbbf24]' : 'bg-slate-800 border-brand-500 text-brand-300 scale-100'}`}
                  style={{ left: `${node.x}%`, top: `${15 + (node.level * 25)}%` }}
               >
                  {node.state === 'resolved' ? node.val : node.label}
               </div>
            ))}
         </div>

         {/* The Vertical Call Stack Memory Bucket */}
         <div className="w-full md:w-48 bg-slate-800 border-x-4 border-b-4 border-slate-600 rounded-bl-xl rounded-br-xl relative flex flex-col justify-end p-2 pb-4 overflow-hidden min-h-[250px] shadow-inner">
             <div className="absolute top-0 left-0 w-full text-center bg-slate-600 font-bold uppercase text-[10px] tracking-widest text-white py-1">
                The Call Stack
             </div>
             
             {callStack.length === 0 && !isRunning ? (
                <div className="text-center font-mono opacity-50 text-slate-500 mt-10">Empty (Idle)</div>
             ) : (
                <div className="flex flex-col gap-1 w-full relative z-10 transition-all">
                   {callStack.map((item, idx) => (
                      <div key={`stack-${item.id}`} className="bg-brand-600 border border-brand-400 text-white font-mono font-bold text-center py-2 shadow-md animate-slide-in rounded animate-pulse">
                         WAITING: {item.label}
                      </div>
                   ))}
                </div>
             )}
         </div>

      </div>

      <div className="mt-8 text-center text-sm font-medium text-slate-400 max-w-xl mx-auto">
         This mechanical Call Stack visually proves the profound power of Recursion. The CPU actually completely halts <code className="bg-slate-800 px-1 rounded">F(4)</code>, geometrically shoves it down into the physical memory Bucket, and desperately hunts for <code className="bg-slate-800 px-1 rounded">F(3)</code> and <code className="bg-slate-800 px-1 rounded">F(2)</code> absolute truths before allowing it to finally pop back out and execute!
      </div>
    </div>
  );
}
