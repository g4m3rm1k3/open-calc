import React, { useState } from 'react';
import { Shield, Sword, Wind, Hand } from 'lucide-react';
import { motion } from 'framer-motion';

const CLASSES = [
  {
    id: 'barbarian',
    name: 'Barbarian (Tank)',
    desc: 'Focuses on heavy lifting, strength training, and maximum power output.',
    icon: Shield,
    color: 'from-orange-500 to-red-600',
    shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]'
  },
  {
    id: 'rogue',
    name: 'Rogue (Speed)',
    desc: 'Focuses on running, sprinting, and high-intensity interval training (HIIT).',
    icon: Wind,
    color: 'from-emerald-400 to-teal-600',
    shadow: 'shadow-[0_0_20px_rgba(52,211,153,0.4)]'
  },
  {
    id: 'monk',
    name: 'Monk (Agility)',
    desc: 'Focuses on bodyweight exercises, calisthenics, yoga, and flexibility.',
    icon: Hand,
    color: 'from-fuchsia-500 to-purple-600',
    shadow: 'shadow-[0_0_20px_rgba(217,70,239,0.4)]'
  },
  {
    id: 'paladin',
    name: 'Paladin (Balanced)',
    desc: 'A balanced protocol mixing strength, cardio, and endurance.',
    icon: Sword,
    color: 'from-cyan-400 to-blue-600',
    shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]'
  }
];

export function ClassSelector({ onSelect }) {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState(null);
  const [experience, setExperience] = useState('beginner');
  const [goals, setGoals] = useState('');

  const handleClassSelect = (clsId) => {
    setSelectedClass(clsId);
    setStep(2);
  };

  const handleComplete = () => {
    onSelect(selectedClass, experience, goals);
  };

  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 w-full shadow-2xl backdrop-blur-xl"
        >
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 text-center">
            Define Your Baseline
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Experience Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['beginner', 'intermediate', 'advanced'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setExperience(lvl)}
                    className={`py-3 rounded-xl border font-bold capitalize transition-all ${
                      experience === lvl 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-950/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">What are your goals?</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value.slice(0, 500))}
                maxLength={500}
                placeholder="e.g. I want to run a 5k, build muscle, lose 10lbs..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none h-32"
              />
              <p className="text-xs text-slate-600 text-right mt-1">{goals.length}/500</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold"
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
              >
                Begin Journey
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] mb-4 tracking-tight">
          Choose Your Path
        </h2>
        <p className="text-slate-300 max-w-xl mx-auto">
          Your class determines the types of quests you will receive and the algorithms used to calculate your XP gains based on Andy Galpin's protocols.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {CLASSES.map((cls, idx) => {
          const Icon = cls.icon;
          return (
            <motion.button
              key={cls.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleClassSelect(cls.id)}
              className={`relative group overflow-hidden p-6 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 transition-all duration-300 text-left backdrop-blur-xl ${cls.shadow} hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${cls.color} transition-opacity duration-500`} />
              
              <div className="relative z-10 flex items-start gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${cls.color} text-white shadow-lg`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{cls.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{cls.desc}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
