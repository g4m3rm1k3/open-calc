import { Play, Video, ExternalLink, Library, Layout } from 'lucide-react';
import { useVideoPlayer } from '../../../context/VideoPlayerContext.jsx';

export default function VideoLauncher({ params }) {
  const { openPlayer } = useVideoPlayer();
  const videos = params?.videos || [];
  const lessonId = params?.lessonId;

  if (!videos.length) return null;

  return (
    <div className="p-1 px-2 flex flex-col items-center justify-center min-h-[140px] bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all">
      <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-3 group-hover:scale-110 transition-transform">
        <Play size={20} fill="currentColor" />
      </div>
      
      <div className="text-center mb-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">Tutorial Available</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {videos.length} video{videos.length > 1 ? 's' : ''} covering this section
        </p>
      </div>

      <button
        onClick={() => openPlayer(videos[0], lessonId)}
        className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
      >
        <Video size={14} />
        Open Library
      </button>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex justify-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <Library size={10} /> Browse
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <Layout size={10} /> Popout
        </div>
      </div>
    </div>
  );
}
