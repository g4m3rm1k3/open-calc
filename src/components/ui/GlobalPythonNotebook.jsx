import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import PythonNotebook from '../viz/react/PythonNotebook'

/**
 * GlobalPythonNotebook Wrapper
 * Reuses the high-fidelity PythonNotebook component inside a glassmorphism modal.
 */
export default function GlobalPythonNotebook({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end sm:p-4 pointer-events-none">
        {/* Backdrop for mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto lg:hidden"
        />

        <motion.div
          initial={{ x: 600, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 600, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-3xl h-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 flex flex-col pointer-events-auto overflow-hidden"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                 <span className="text-xs font-bold font-mono">Py</span>
               </div>
               <h2 className="text-md font-bold text-slate-800 dark:text-white">Python Sandbox</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={20} />
            </button>
          </header>

          {/* Scrollable Notebook Container */}
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
            <div className="max-w-4xl mx-auto py-4">
               <PythonNotebook />
            </div>
          </div>

          {/* Footer */}
          <footer className="p-3 px-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 shrink-0 text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Powered by Pyodide WebAssembly & open-calc Viz Engine
            </p>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
