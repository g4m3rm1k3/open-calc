function buildTree(topicId, topicMap) {
  const expanded = new Set([topicId]);

  function build(id) {
    const topic = topicMap[id];
    if (!topic) return [];
    return topic.prereqs.map(prereqId => {
      const alreadyShown = expanded.has(prereqId);
      if (!alreadyShown) expanded.add(prereqId);
      const prereqTopic = topicMap[prereqId];
      return {
        id: prereqId,
        title: prereqTopic?.title ?? prereqId,
        alreadyShown: alreadyShown && (prereqTopic?.prereqs.length ?? 0) > 0,
        children: alreadyShown ? [] : build(prereqId),
      };
    });
  }

  return build(topicId);
}

function TreeLines({ nodes, prefix, onNavigate }) {
  return nodes.map((node, i) => {
    const isLast = i === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    return (
      <div key={node.id}>
        <div className="text-slate-800 dark:text-slate-200 font-sans text-[13px] whitespace-nowrap flex items-center py-0.5 transition-colors duration-500">
          <span className="text-slate-400 dark:text-slate-600 font-mono pr-1">{prefix}{connector}</span>
          <button 
            onClick={() => onNavigate(node.id)}
            className={`font-medium transition-colors text-left hover:text-brand-600 dark:hover:text-brand-400`}
          >
            {node.title}
          </button>
          {node.alreadyShown && <span className="text-slate-400 dark:text-slate-500 italic text-[11px] ml-2 font-normal">(see above)</span>}
        </div>
        {node.children.length > 0 && <TreeLines nodes={node.children} prefix={childPrefix} onNavigate={onNavigate} />}
      </div>
    );
  });
}

export default function DependencyTree({ topicId, topicMap, onNavigate }) {
  const topic = topicMap[topicId];
  if (!topic) return null;
  const tree = buildTree(topicId, topicMap);

  return (
    <div className="font-mono text-[13px] leading-6 overflow-x-auto pb-4 transition-colors duration-500">
      <div className={`font-bold mb-2 font-sans tracking-wide transition-colors duration-500 text-brand-600 dark:text-brand-400`}>{topic.title}</div>
      {tree.length === 0 ? (
        <div className={`italic font-sans text-[13px] border-l-2 pl-3 py-1 transition-colors duration-500 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-500/30 bg-transparent`}>
          No prerequisites — this is a foundational concept.
        </div>
      ) : (
        <TreeLines nodes={tree} prefix="" onNavigate={onNavigate} />
      )}
    </div>
  );
}
