import { generateExampleProject } from "./exampleProject";

function el(id, tag, parentId, styles = {}, content = "", attrs = {}) {
  return { id, tag, parentId, styles, content, attrs, mediaQueries: [] };
}

// ── API Dashboard ──────────────────────────────────────────────────────────────
function generateApiExample() {
  const elements = [
    el("api-topbar", "div", null, {
      padding: "20px 32px",
      background: "#0f172a",
      borderBottom: "1px solid #1e293b",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }),
    el("api-title-wrap", "div", "api-topbar"),
    el("api-title", "h1", "api-title-wrap", {
      color: "#f8fafc", fontSize: "24px", fontWeight: "700", margin: "0",
    }, "User Directory"),
    el("api-subtitle", "p", "api-title-wrap", {
      color: "#64748b", fontSize: "13px", margin: "4px 0 0",
    }, "Live data · JSONPlaceholder REST API"),
    el("api-refresh", "button", "api-topbar", {
      background: "#3b82f6", color: "#fff", border: "none",
      padding: "10px 20px", borderRadius: "8px", fontSize: "13px",
      fontWeight: "600", cursor: "pointer",
    }, "↻ Refresh", { class: "api-refresh-btn" }),
    el("api-grid", "div", null, {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "16px",
      padding: "24px 32px",
      background: "#0f172a",
      flex: "1",
    }, "", { class: "api-users-grid" }),
  ];

  const bodyStyles = {
    background: "#0f172a",
    color: "#f8fafc",
    fontFamily: "system-ui, sans-serif",
    margin: "0",
    padding: "0",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  };

  const javascript = `(function() {
  var grid = document.querySelector('.api-users-grid');
  var btn  = document.querySelector('.api-refresh-btn');
  var COLORS = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4'];

  function showLoading() {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:#475569;font-size:15px;">Loading users…</div>';
  }

  function card(u) {
    var color = COLORS[u.id % COLORS.length];
    return '<div class="api-card" style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:10px;transition:transform .15s,box-shadow .15s;cursor:default;">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<div style="width:46px;height:46px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:700;flex-shrink:0;">' + u.name.charAt(0) + '</div>' +
        '<div><div style="color:#f1f5f9;font-weight:600;font-size:15px;">' + u.name + '</div>' +
        '<div style="color:#64748b;font-size:12px;">' + u.company.name + '</div></div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:4px;">' +
        '<div style="color:#94a3b8;font-size:13px;">✉ ' + u.email + '</div>' +
        '<div style="color:#94a3b8;font-size:13px;">🌐 ' + u.website + '</div>' +
        '<div style="color:#94a3b8;font-size:13px;">📍 ' + u.address.city + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:#64748b;background:#0f172a;border-radius:6px;padding:6px 10px;font-style:italic;">"' + u.company.catchPhrase + '"</div>' +
    '</div>';
  }

  function load() {
    showLoading();
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(function(r) { return r.json(); })
      .then(function(users) {
        grid.innerHTML = users.map(card).join('');
        grid.querySelectorAll('.api-card').forEach(function(c) {
          c.addEventListener('mouseenter', function() { c.style.transform = 'translateY(-3px)'; c.style.boxShadow = '0 8px 24px rgba(0,0,0,.5)'; });
          c.addEventListener('mouseleave', function() { c.style.transform = ''; c.style.boxShadow = ''; });
        });
      })
      .catch(function() {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:#f87171;">Failed to load — check your connection.</div>';
      });
  }

  btn && btn.addEventListener('click', load);
  load();
})();`;

  return { elements, bodyStyles, javascript };
}

// ── Kanban Board ───────────────────────────────────────────────────────────────
function generateKanbanExample() {
  const COL = {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "12px",
    width: "260px",
    minWidth: "260px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flexShrink: "0",
  };

  const COL_HDR = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 4px 4px",
  };

  const COL_TITLE = {
    color: "#f8fafc",
    fontSize: "12px",
    fontWeight: "700",
    margin: "0",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  };

  const BADGE = {
    background: "#334155",
    color: "#94a3b8",
    borderRadius: "10px",
    padding: "1px 8px",
    fontSize: "11px",
  };

  const LIST = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minHeight: "60px",
    borderRadius: "8px",
    padding: "4px",
    transition: "background 0.15s",
  };

  const ADD_BTN = {
    background: "none",
    border: "1px dashed #334155",
    color: "#64748b",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "border-color 0.15s, color 0.15s",
  };

  function col(id, colKey, titleText, titleColor) {
    return [
      el(`col-${id}`, "div", "kb-board", COL, "", { class: "kb-col", "data-col": colKey }),
      el(`col-${id}-hdr`, "div", `col-${id}`, COL_HDR),
      el(`col-${id}-title`, "h3", `col-${id}-hdr`, { ...COL_TITLE, color: titleColor }, titleText),
      el(`col-${id}-badge`, "span", `col-${id}-hdr`, BADGE, "0", { class: "kb-badge" }),
      el(`col-${id}-list`, "div", `col-${id}`, LIST, "", { class: "kb-list", "data-col": colKey }),
      el(`col-${id}-add`, "button", `col-${id}`, ADD_BTN, "+ Add a card", { class: "kb-add", "data-col": colKey }),
    ];
  }

  const elements = [
    el("kb-header", "div", null, {
      padding: "14px 24px",
      background: "#0f172a",
      borderBottom: "1px solid #1e293b",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }),
    el("kb-title", "h1", "kb-header", {
      color: "#f8fafc", fontSize: "17px", fontWeight: "700", margin: "0", flex: "1",
    }, "📋 Project Board"),
    el("kb-board", "div", null, {
      display: "flex",
      gap: "14px",
      padding: "18px 24px",
      background: "#0f172a",
      overflowX: "auto",
      flex: "1",
      alignItems: "flex-start",
    }, "", { class: "kb-board" }),
    ...col("todo",  "todo",  "To Do",      "#f8fafc"),
    ...col("doing", "doing", "In Progress", "#fbbf24"),
    ...col("done",  "done",  "Done",        "#34d399"),
  ];

  const bodyStyles = {
    background: "#0f172a",
    color: "#f8fafc",
    fontFamily: "system-ui, sans-serif",
    margin: "0",
    padding: "0",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  };

  const javascript = `(function() {
  var TAGS = {
    high:    { label: 'High',    color: '#ef4444' },
    medium:  { label: 'Medium',  color: '#f59e0b' },
    low:     { label: 'Low',     color: '#22d3ee' },
    feature: { label: 'Feature', color: '#a78bfa' },
    bug:     { label: 'Bug',     color: '#f87171' },
  };
  var TAG_KEYS = Object.keys(TAGS);

  var SEED = [
    { col: 'todo',  text: 'Design new landing page',       tag: 'feature' },
    { col: 'todo',  text: 'Write unit tests for auth',      tag: 'high'    },
    { col: 'todo',  text: 'Update API documentation',       tag: 'low'     },
    { col: 'doing', text: 'Implement drag-and-drop',        tag: 'feature' },
    { col: 'doing', text: 'Fix mobile navigation bug',      tag: 'bug'     },
    { col: 'done',  text: 'Set up CI/CD pipeline',          tag: 'feature' },
    { col: 'done',  text: 'Code review: user auth PR',      tag: 'medium'  },
    { col: 'done',  text: 'Deploy v2.1.0 to staging',       tag: 'high'    },
  ];

  var dragCard = null;

  function makeCard(text, tagKey) {
    var t = TAGS[tagKey] || TAGS.low;
    var card = document.createElement('div');
    card.className = 'kb-card';
    card.draggable = true;
    card.style.cssText = 'background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px 12px;cursor:grab;display:flex;flex-direction:column;gap:6px;transition:box-shadow .15s,opacity .15s;';
    card.innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">' +
        '<span style="color:#e2e8f0;font-size:13px;line-height:1.4;">' + text + '</span>' +
        '<button class="kb-del" style="background:none;border:none;color:#475569;cursor:pointer;font-size:13px;line-height:1;padding:0;flex-shrink:0;" title="Delete">✕</button>' +
      '</div>' +
      '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;color:' + t.color + ';border:1px solid ' + t.color + '44;display:inline-block;width:fit-content;">' + t.label + '</span>';

    card.querySelector('.kb-del').addEventListener('click', function(e) {
      e.stopPropagation();
      card.remove();
      updateCounts();
    });

    card.addEventListener('dragstart', function() {
      dragCard = card;
      setTimeout(function() { card.style.opacity = '0.4'; }, 0);
    });
    card.addEventListener('dragend', function() {
      card.style.opacity = '';
      dragCard = null;
      document.querySelectorAll('.kb-list').forEach(function(l) { l.style.background = ''; });
      updateCounts();
    });
    card.addEventListener('mouseenter', function() { card.style.boxShadow = '0 4px 12px rgba(0,0,0,.5)'; });
    card.addEventListener('mouseleave', function() { card.style.boxShadow = ''; });

    return card;
  }

  function getDragAfter(list, y) {
    var cards = Array.from(list.querySelectorAll('.kb-card')).filter(function(c) { return parseFloat(c.style.opacity) !== 0.4; });
    return cards.reduce(function(closest, el) {
      var box = el.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset: offset, el: el } : closest;
    }, { offset: -Infinity, el: null }).el;
  }

  function updateCounts() {
    document.querySelectorAll('.kb-col').forEach(function(col) {
      var badge = col.querySelector('.kb-badge');
      var count = col.querySelector('.kb-list').querySelectorAll('.kb-card').length;
      if (badge) badge.textContent = count;
    });
  }

  // Wire up drop zones
  document.querySelectorAll('.kb-list').forEach(function(list) {
    list.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (!dragCard) return;
      list.style.background = 'rgba(59,130,246,.1)';
      var after = getDragAfter(list, e.clientY);
      if (!after) list.appendChild(dragCard);
      else list.insertBefore(dragCard, after);
    });
    list.addEventListener('dragleave', function() { list.style.background = ''; });
    list.addEventListener('drop', function(e) { e.preventDefault(); list.style.background = ''; updateCounts(); });
  });

  // Inline add-card form for each column
  document.querySelectorAll('.kb-add').forEach(function(btn) {
    var colKey = btn.dataset.col;

    var form = document.createElement('div');
    form.style.cssText = 'display:none;flex-direction:column;gap:6px;';

    var textarea = document.createElement('textarea');
    textarea.placeholder = 'Card title…';
    textarea.rows = 2;
    textarea.style.cssText = 'background:#0f172a;border:1px solid #3b82f6;border-radius:6px;color:#e2e8f0;font-size:13px;padding:8px;resize:none;font-family:inherit;outline:none;width:100%;box-sizing:border-box;';

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;';

    var addBtn = document.createElement('button');
    addBtn.textContent = 'Add card';
    addBtn.style.cssText = 'background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕';
    cancelBtn.style.cssText = 'background:#334155;color:#94a3b8;border:none;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;';

    row.appendChild(addBtn);
    row.appendChild(cancelBtn);
    form.appendChild(textarea);
    form.appendChild(row);
    btn.parentNode.insertBefore(form, btn);

    function openForm() { form.style.display = 'flex'; btn.style.display = 'none'; textarea.focus(); }
    function closeForm() { form.style.display = 'none'; btn.style.display = ''; textarea.value = ''; }

    btn.addEventListener('click', openForm);
    cancelBtn.addEventListener('click', closeForm);

    function submitCard() {
      var text = textarea.value.trim();
      if (!text) return;
      var list = document.querySelector('.kb-list[data-col="' + colKey + '"]');
      var tagKey = TAG_KEYS[Math.floor(Math.random() * TAG_KEYS.length)];
      list.appendChild(makeCard(text, tagKey));
      updateCounts();
      textarea.value = '';
      textarea.focus();
    }

    addBtn.addEventListener('click', submitCard);
    textarea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitCard(); }
      if (e.key === 'Escape') closeForm();
    });
  });

  // Seed initial cards
  SEED.forEach(function(s) {
    var list = document.querySelector('.kb-list[data-col="' + s.col + '"]');
    if (list) list.appendChild(makeCard(s.text, s.tag));
  });

  updateCounts();
})();`;

  return { elements, bodyStyles, javascript };
}

// ── Gallery export ─────────────────────────────────────────────────────────────
export const EXAMPLES = [
  {
    id: "showcase",
    name: "Interactive Showcase",
    description: "Counters, tabs, modals and more — all wired with JavaScript",
    icon: "⚡",
    generate: generateExampleProject,
  },
  {
    id: "api-dashboard",
    name: "Live API Dashboard",
    description: "Fetches real user data from a public API and renders it dynamically",
    icon: "🌐",
    generate: generateApiExample,
  },
  {
    id: "kanban",
    name: "Kanban Board",
    description: "Drag-and-drop task board — add cards, move them between columns",
    icon: "📋",
    generate: generateKanbanExample,
  },
];
