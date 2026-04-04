import React, { useState } from 'react';
import { HelpCircle, X, Github, Heart, Shield, Terminal, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Modal Panel */}
          <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-amber-900/10 dark:shadow-black/50 overflow-hidden flex flex-col transition-all duration-300 w-full ${view === 'guide' ? 'max-w-5xl max-h-[90vh]' : 'max-w-lg max-h-[90vh]'}`}>
            
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
                  {view === 'overview' ? 'About OpenCalc' : 'Contributor Playbook'}
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
            <div className={`flex-1 overflow-y-auto w-full relative ${view === 'guide' ? 'bg-slate-50 dark:bg-slate-900' : ''}`}>
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
                        className="mt-3 flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 px-4 py-3 rounded-xl border border-amber-100 dark:border-amber-900/50 transition-colors w-full sm:w-auto shadow-sm"
                      >
                        <Terminal size={18} />
                        Read the visual contributor playbook
                      </button>
                      <a
                        href="https://github.com/g4m3rm1k3/open-calc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors w-full sm:w-auto shadow-sm"
                      >
                        <Github size={18} />
                        github.com/g4m3rm1k3/open-calc
                      </a>
                      <div className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-500 dark:text-slate-400">
                        <kbd className="font-mono text-xs bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Shift</kbd>
                        <span>+</span>
                        <kbd className="font-mono text-xs bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">D</kbd>
                        <span>— toggle Dev Mode (shows component names on every viz)</span>
                      </div>
                    </div>
                  </section>

                  {/* License Info */}
                  <section>
                    <div className="flex items-center gap-2 mb-2 text-indigo-500 dark:text-indigo-400">
                      <Shield size={18} />
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Open Source License</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 space-y-2 shadow-inner">
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
                <div className="p-4 sm:p-8 md:p-10 max-w-4xl mx-auto">
                  <div className="bg-white dark:bg-slate-900 sm:rounded-2xl sm:border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-12 mb-6" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-10 mb-4" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-8 mb-3" {...props} />,
                        p: ({node, ...props}) => <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 my-4" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 my-5 text-[15px] text-slate-600 dark:text-slate-400 space-y-2 marker:text-slate-400" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 my-5 text-[15px] text-slate-600 dark:text-slate-400 space-y-2 marker:text-slate-400" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        a: ({node, ...props}) => <a className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline decoration-indigo-300 dark:decoration-indigo-500/50 underline-offset-2 transition-colors" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl text-xs sm:text-[13px] leading-relaxed font-mono overflow-x-auto my-6 border border-slate-200 dark:border-slate-800/80 shadow-inner max-w-[85vw] sm:max-w-none text-slate-800 dark:text-slate-300 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700" {...props} />,
                        code: ({node, inline, className, children, ...props}) => {
                          return inline ? (
                            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[13px] font-mono text-amber-700 dark:text-amber-400 mx-0.5" {...props}>{children}</code>
                          ) : (
                            <code className="text-slate-800 dark:text-slate-300" {...props}>{children}</code>
                          )
                        },
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-500/50 pl-5 pr-4 py-3 my-6 text-[15px] text-slate-700 dark:text-slate-300 italic rounded-r-xl" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-8 max-w-[85vw] sm:max-w-none rounded-xl border border-slate-200 dark:border-slate-800"><table className="w-full text-sm text-left border-collapse" {...props} /></div>,
                        th: ({node, ...props}) => <th className="border-b border-slate-200 dark:border-slate-800 p-4 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-900" {...props} />,
                        td: ({node, ...props}) => <td className="border-b border-slate-100 dark:border-slate-800/50 p-4 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 align-top" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-10 border-slate-200 dark:border-slate-800" {...props} />,
                      }}
                    >
                      {contributingText}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-white dark:bg-slate-900 relative z-10">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors ring-1 ring-slate-200 dark:ring-slate-700/50"
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
