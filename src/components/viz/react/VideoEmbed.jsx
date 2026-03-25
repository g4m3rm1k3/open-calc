import { VIDEO_DATABASE } from "../../../content/videos/videoDatabase.js";

export default function VideoEmbed({ params, url: rootUrl, title: rootTitle, videoId: rootVideoId }) {
  const videoId = rootVideoId || params?.videoId;
  const title = rootTitle || params?.title;
  let src = rootUrl || params?.url;

  // If no URL but we have a videoId or title, look it up in the database
  if (!src) {
    if (videoId && VIDEO_DATABASE[videoId]) {
      src = VIDEO_DATABASE[videoId].url;
    } else if (title) {
      // Fallback: search by title string
      const entry = Object.values(VIDEO_DATABASE).find(v => v.title === title);
      if (entry) src = entry.url;
    }
  }

  if (!src) return (
    <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center gap-3">
      <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="font-medium text-sm">Launch "{title}" in Video Player</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-black">
        <iframe
          className="w-full h-full"
          src={src}
          title={title || "Video player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}

