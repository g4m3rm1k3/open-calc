export default function VideoEmbed({ params, url: rootUrl, title: rootTitle, embedCode: rootEmbedCode }) {
  const embedCode = rootEmbedCode || params?.embedCode; const title = rootTitle || params?.title; const url = rootUrl || params?.url;
  // If url is provided directly, use it, otherwise extract from embedCode
  let src = url;
  if (!src && embedCode) {
    const match = embedCode.match(/src="([^"]+)"/);
    if (match) src = match[1];
  }

  if (!src) return null;

  return (
    <div className="flex flex-col items-center w-full">
      {/* {title && <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</h3>} */}
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-black">
        <iframe
          className="w-full h-full"
          src={src}
          title={title || "Video player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
