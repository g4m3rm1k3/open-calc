import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';

/**
 * PythonNotebook component
 * A client-side Python notebook using Pyodide and Monaco Editor.
 */
export default function PythonNotebook() {
  const [pyodide, setPyodide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cells, setCells] = useState([
    { id: 1, code: '# Welcome to the Python Notebook\n# You can run Python code directly in your browser using Pyodide.\n\nimport math\nprint("Hello from Python!")\nx = math.sqrt(25)\nx', output: '', status: 'idle' }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Initialize Pyodide
  useEffect(() => {
    async function initPyodide() {
      try {
        const { loadPyodide } = window;
        if (!loadPyodide) {
           // If script isn't loaded yet, we might need to add it dynamically or rely on public CDN in index.html
           // For this implementation, we assume the script will be available via CDN
           const script = document.createElement('script');
           script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
           script.onload = async () => {
             const py = await window.loadPyodide();
             setPyodide(py);
             setIsLoading(false);
           };
           document.head.appendChild(script);
        } else {
          const py = await loadPyodide();
          setPyodide(py);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load Pyodide:', err);
      }
    }
    initPyodide();
  }, []);

  const runCell = useCallback(async (cellId) => {
    if (!pyodide || isExecuting) return;

    setIsExecuting(true);
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, status: 'running' } : c));

    const cell = cells.find(c => c.id === cellId);
    let output = '';
    
    // Intercept stdout
    pyodide.setStdout({
      batched: (msg) => {
        output += msg + '\n';
      }
    });

    try {
      const result = await pyodide.runPythonAsync(cell.code);
      if (result !== undefined) {
        output += String(result);
      }
      setCells(prev => prev.map(c => c.id === cellId ? { ...c, output, status: 'idle' } : c));
    } catch (err) {
      setCells(prev => prev.map(c => c.id === cellId ? { ...c, output: output + '\nError: ' + err.message, status: 'error' } : c));
    } finally {
      setIsExecuting(false);
    }
  }, [pyodide, cells, isExecuting]);

  const addCell = () => {
    const newId = cells.length > 0 ? Math.max(...cells.map(c => c.id)) + 1 : 1;
    setCells([...cells, { id: newId, code: '', output: '', status: 'idle' }]);
  };

  const updateCellCode = (id, newCode) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, code: newCode } : c));
  };

  const removeCell = (id) => {
    if (cells.length > 1) {
      setCells(prev => prev.filter(c => c.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Initializing Python Runtime...</p>
        <p className="text-xs text-gray-400">This might take a moment as we download Pyodide (WASM).</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen pb-20">
      <header className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-teal-500 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            Interactive Python Notebook
          </h1>
          <p className="text-xs text-gray-500 mt-1">Python 3.x running in WebAssembly (Pyodide)</p>
        </div>
        <div className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-xs font-semibold ring-1 ring-teal-500/20">
          Kernel: Ready
        </div>
      </header>

      <div className="space-y-4">
        {cells.map((cell, index) => (
          <div key={cell.id} className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-teal-500/30">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                In [{cell.id}]
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => runCell(cell.id)}
                  disabled={isExecuting}
                  className="p-1 px-2 text-[10px] font-bold bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {cell.status === 'running' ? 'Running...' : 'Run Cell'}
                </button>
                <button 
                  onClick={() => removeCell(cell.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="h-auto min-h-[100px]">
              <Editor
                height="150px"
                defaultLanguage="python"
                theme="vs-dark"
                value={cell.code}
                onChange={(value) => updateCellCode(cell.id, value)}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  padding: { top: 10, bottom: 10 },
                  automaticLayout: true
                }}
              />
            </div>

            {cell.output && (
              <div className="p-4 bg-gray-50 dark:bg-black/20 font-mono text-sm border-t border-gray-100 dark:border-gray-800">
                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Out [{cell.id}]</div>
                <pre className={`whitespace-pre-wrap ${cell.status === 'error' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {cell.output}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={addCell}
        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 hover:text-teal-500 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all font-medium flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add New Cell
      </button>

      <footer className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center space-y-4">
        <p className="text-sm text-gray-500">
          This notebook shares a single global Python state. Variables defined in one cell are accessible in others.
        </p>
        <div className="flex justify-center gap-4 text-xs font-medium text-gray-400">
          <span className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-teal-500"></div> Python 3.11+
          </span>
          <span className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-teal-500"></div> WebAssembly
          </span>
          <span className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-teal-500"></div> No Server Required
          </span>
        </div>
      </footer>
    </div>
  );
}
