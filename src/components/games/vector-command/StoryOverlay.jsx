import React, { useState } from 'react';
import { CAMPAIGN_MISSIONS } from './CampaignData';

export function StoryOverlay({ missionId, onComplete }) {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  
  const mission = CAMPAIGN_MISSIONS.find(m => m.level === missionId);
  if (!mission) return null;

  const currentLine = mission.story[dialogueIndex];

  const handleNext = () => {
    if (dialogueIndex < mission.story.length - 1) {
      setDialogueIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end p-8 pointer-events-none">
      <div className="max-w-4xl w-full mx-auto bg-slate-900/95 border border-cyan-500/50 rounded-lg p-6 shadow-[0_0_50px_rgba(34,211,238,0.1)] pointer-events-auto backdrop-blur-md relative">
        {/* Passcode Reminder */}
        <div className="absolute -top-3 right-4 bg-slate-900 text-emerald-400 text-[10px] px-2 border border-emerald-500/30 tracking-widest rounded-sm">
          SYS_CODE: {mission.passcode}
        </div>
        
        <div className="flex gap-6 items-start">
          {/* Avatar Area */}
          <div className="w-24 h-24 shrink-0 bg-slate-800 border-2 border-cyan-500/30 rounded flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
            {currentLine.speaker === "COMMANDER" ? (
              <div className="text-5xl">👨‍✈️</div>
            ) : (
              <div className="text-5xl">🤖</div>
            )}
          </div>
          
          {/* Text Area */}
          <div className="flex-1 flex flex-col justify-between min-h-[96px]">
            <div>
              <h3 className={`text-xs font-bold tracking-widest mb-2 ${currentLine.speaker === "COMMANDER" ? "text-cyan-400" : "text-emerald-400"}`}>
                {currentLine.speaker}
              </h3>
              <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line font-sans">
                {currentLine.text}
              </p>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-300 text-xs font-bold tracking-widest rounded transition-colors uppercase"
              >
                {dialogueIndex < mission.story.length - 1 ? 'NEXT ▶' : 'ENGAGE THRUSTERS'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
