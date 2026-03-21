import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import KatexInline from '../math/KatexInline.jsx';
import KatexBlock from '../math/KatexBlock.jsx';
import { ALGEBRA_REGISTRY } from '../../content/algebraRegistry.js';

export default function AlgebraMicroLesson({ topicId, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  
  const data = ALGEBRA_REGISTRY[topicId];

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!data) {
    // Graceful fallback if ID is wrong
    return <span className="underline border-brand-500 text-brand-500">{children}</span>;
  }

  return (
    <span className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`font-semibold transition-colors border-b-2 border-dashed ${isOpen ? 'text-blue-700 border-blue-700 dark:text-blue-400 dark:border-blue-400' : 'text-blue-600 border-blue-600/50 dark:text-blue-400 dark:border-blue-400/50 hover:text-blue-800 hover:border-blue-800'}`}
        aria-expanded={isOpen}
      >
        {children}
      </button>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-72 md:w-80 bg-[#f0f4f8] dark:bg-[#0f172a] rounded-lg shadow-xl border-2 border-blue-200 dark:border-blue-800/50 overflow-hidden text-left font-sans animate-in fade-in slide-in-from-top-2"
          style={{ boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)' }}
        >
          {/* Blueprint Header */}
          <div className="bg-blue-600 dark:bg-blue-900 text-white px-4 py-2 flex justify-between items-center">
            <span className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
              <span className="text-blue-200">🛠</span> {data.name}
            </span>
            <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white pb-1">×</button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              {data.description}
            </p>
            
            <div className="mb-4 bg-white dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-lg text-slate-900 dark:text-slate-100 font-bold overflow-x-auto">
              <KatexInline expr={data.formula} />
            </div>

            <div className="mb-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Quick Example</p>
              <div className="text-sm text-slate-800 dark:text-slate-200 bg-blue-50 dark:bg-blue-900/10 p-2 rounded border border-blue-100 dark:border-blue-800/20 flex justify-center">
                <KatexInline expr={data.example} />
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <Link 
                to={`/chapter/0/${data.chapterZeroSlug}`} 
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Go to full Pre-Calc lesson →
              </Link>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
