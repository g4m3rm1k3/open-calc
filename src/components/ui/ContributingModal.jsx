import React, { useState } from 'react';
import { HelpCircle, X, Github, Heart, Shield, Terminal, ArrowLeft } from 'lucide-react';
// Import the raw text of the markdown file using Vite's ?raw feature
import contributingText from '../../../CONTRIBUTING.md?raw';

export default function ContributingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('overview'); // 'overview' | 'guide'

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setView('overview');
        }}
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg shadow-amber-500/20 bg-amber-400 text-amber-950 hover:bg-amber-300 hover:scale-110 transition-all duration-300 ${isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}`}
        aria-label="How to contribute"
        title="Open Source & Contributing"
      >
        <HelpCircle size={32} strokeWidth={2.5} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Modal Panel */}
          <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-amber-900/10 dark:shadow-black/50 overflow-hidden flex flex-col transition-all duration-300 w-full ${view === 'guide' ? 'max-w-4xl max-h-[90vh]' : 'max-w-lg max-h-[90vh]'}`}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900">
              <div className="flex items-center gap-3">
                {view === 'guide' ? (
                  <button 
                    onClick={() => setView('overview')}
                    className="p-1.5 -ml-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <div className="bg-amber-400 text-amber-950 p-2 rounded-lg">
                    <HelpCircle size={20} className="stroke-current" strokeWidth={2.5} />
                  </div>
                )}
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {view === 'overview' ? 'About OpenCalc' : 'Contributing Playbook'}
                </h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto w-full relative">
              {view === 'overview' ? (
                <div className="p-6 space-y-6">
                  {/* Contributing Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500">
                      <Github size={18} />
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">How to Contribute</h3>
                    </div>
                    <div className="prose-content text-slate-600 dark:text-slate-400 text-sm space-y-3 leading-relaxed">
                      <p>
                        OpenCalc is designed to be free to host and easy to update. Content is stored as plain JavaScript files, making it easy to contribute new lessons, fix errors, or add visualizations via pull request.
                      </p>
                      <button 
                        onClick={() => setView('guide')}
                        className="mt-3 flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 px-4 py-2.5 rounded-xl border border-amber-100 dark:border-amber-900/50 transition-colors w-full sm:w-auto"
                      >
                        <Terminal size={16} />
                        Read the detailed contributor playbook
                      </button>
                    </div>
                  </section>

                  {/* License Info */}
                  <section>
                    <div className="flex items-center gap-2 mb-2 text-indigo-500 dark:text-indigo-400">
                      <Shield size={18} />
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Open Source License</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        Non-Commercial, No Monetary Gain
                      </p>
                      <p>
                        This project is provided freely to the world to advance mathematics education. It is licensed strictly for <strong>non-commercial use</strong>. You may not use this software, its content, or its visualizations for any form of monetary gain, commercial hosting, or paid product integration.
                      </p>
                    </div>
                  </section>

                  {/* Author Info */}
                  <section>
                    <div className="flex items-center gap-2 mb-2 text-rose-500 dark:text-rose-400">
                      <Heart size={18} />
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Created By</h3>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p>
                        OpenCalc was created by <strong>Michael McLean</strong>, combining a passion for rigorous mathematical pedagogy with interactive web technology.
                      </p>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="p-0 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-full">
                  <div className="prose-content max-w-none text-slate-800 dark:text-slate-200 w-full px-4 py-4 sm:px-0 sm:py-0">
                    <pre className="whitespace-pre-wrap font-mono text-[13px] sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 p-6 bg-white dark:bg-slate-900 sm:border border-slate-200 dark:border-slate-800 sm:rounded-xl sm:shadow-sm overflow-x-hidden">
                      {contributingText}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-white dark:bg-slate-900">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
               >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
