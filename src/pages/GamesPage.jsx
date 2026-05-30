import { useEffect } from 'react'
import { Gamepad2, Sparkles } from 'lucide-react'
import ArcadeMazeBackground from '../components/games/ArcadeMazeBackground.jsx'
import GameCard from '../components/cards/GameCard.jsx'
import { GAMES } from '../data/games.js'

export default function GamesPage() {
  useEffect(() => {
    document.title = "Games — UpSkillOS";
    return () => {
      document.title = "UpSkillOS";
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-9rem)] text-white">
      <ArcadeMazeBackground />

      <div className="relative z-10 mx-auto max-w-5xl pt-6 sm:pt-10">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-md">
            <Gamepad2 className="h-4 w-4" />
            Games
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-6xl">
            Arcade learning.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-100/76 sm:text-lg">
            Apply what you're learning through arcade challenges, physics
            playgrounds, and sports math.
          </p>
        </div>

        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-cyan-100/80">
          <Sparkles className="h-4 w-4" />
          <span>Original neon maze engine active</span>
        </div>

        <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map(g => (
            <GameCard key={g.key} item={g} />
          ))}
        </div>
      </div>
    </div>
  );
}
