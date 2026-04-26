import { Play, Video, ExternalLink, Library, Layout } from 'lucide-react';
import { useVideoPlayer } from '../../../context/VideoPlayerContext.jsx';

export default function VideoLauncher({ params }) {
  const { openPlayer } = useVideoPlayer();
  const videos = params?.videos || [];
  const lessonId = params?.lessonId;

  if (!videos.length) return null;

  return (
    <div className="relative group p-6 flex flex-col items-center justify-center min-h-[180px] bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
          <Play size={24} fill="currentColor" />
        </div>
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse -z-10" />
      </div>

      <div className="text-center mb-6">
        <h4 className="text-[13px] font-black text-slate-900 dark:text-white tracking-[0.15em] uppercase mb-1">Analytical Insight</h4>
        <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest opacity-80">
          {videos.length} Procedural Archive{videos.length > 1 ? 's' : ''}
        </p>
      </div>

      <button
        onClick={() => openPlayer(videos[0], lessonId)}
        className="relative overflow-hidden flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all group/btn"
      >
        <span className="relative z-10">Access Archive</span>
        <Video size={14} className="relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
      </button>

      <div className="mt-6 pt-4 border-t border-white/10 w-full flex justify-center gap-6">
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <Library size={12} className="text-indigo-400" /> Visual Context
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <Layout size={12} className="text-indigo-400" /> HUD Mode
        </div>
      </div>
    </div>
  );
}
