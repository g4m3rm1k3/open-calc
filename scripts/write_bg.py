content = """import React from 'react';
import { useIsDark } from '../../context/ThemeContext';

export default function UniverseBackground() {
  const isDark = useIsDark();

  if (!isDark) {
    return (
      <div className="fixed inset-0 z-0 bg-slate-50 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400/50 via-indigo-200/10 to-transparent blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/40 via-cyan-200/10 to-transparent blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-400/30 via-fuchsia-200/10 to-transparent blur-[100px] animate-[pulse_9s_ease-in-out_infinite_1s]" />
        
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 bg-[#060913] overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/30 via-indigo-900/10 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-600/20 via-fuchsia-900/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/10 via-cyan-900/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="absolute inset-0 bg-[#060913]/40 backdrop-blur-[40px] pointer-events-none" />
    </div>
  );
}
"""

with open(r'c:\Users\g4m3r\Documents\testing tutorials\open-calc\src\components\backgrounds\UniverseBackground.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Universe background written successfully.")
