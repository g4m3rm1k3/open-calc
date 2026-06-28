export default function NavButton({ id, topicMap, onNavigate, c }) {
  const topic = topicMap[id];
  if (!topic) return null;
  return (
    <button
      onClick={() => onNavigate(id)}
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-all shadow-sm ${c.btn}`}
    >
      <span className={c.icon}>▶</span>
      {topic.title}
    </button>
  );
}
