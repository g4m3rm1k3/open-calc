import React from 'react';

const LALesson_Placeholder = ({ title = "Linear Algebra Component" }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700 p-8 shadow-inner overflow-hidden relative">
      <div className="text-center">
        <h3 className="text-xl font-medium text-slate-200 mb-2">{title}</h3>
        <p className="text-slate-400">Interactive visualization coming soon.</p>
        <div className="mt-8 animate-pulse text-teal-400">
          <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LALesson_Placeholder;
