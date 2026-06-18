function pe(id, tag, parentId, order, content, styles, cls, extraAttrs) {
  return {
    id, tag, parentId, order, content,
    attrs: {
      id: '',
      class: cls || '',
      ...(tag === 'button' ? { type: 'button' } : {}),
      ...(tag === 'a' ? { href: '#', target: '' } : {}),
      ...(extraAttrs || {}),
    },
    styles,
    mediaQueries: [],
  };
}

export const JS_PRESETS = [
  {
    id: 'dark-mode',
    icon: '🌓',
    label: 'Dark Mode',
    description: 'Button that toggles dark / light mode. Style body.dark { } in your CSS to change page colors.',
    template: [
      pe('root', 'div', null, 0, '', {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '20px 28px', borderRadius: '12px',
        backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
        width: 'fit-content',
      }),
      pe('btn', 'button', 'root', 0, '🌙 Dark Mode', {
        padding: '10px 24px', backgroundColor: '#1e293b', color: '#f8fafc',
        border: 'none', borderRadius: '8px', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer', display: 'inline-block',
      }, 'js-theme-btn'),
    ],
    code: `(function () {
  var btn = document.querySelector('.js-theme-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var dark = document.body.classList.toggle('dark');
    btn.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
  });
})();`,
  },

  {
    id: 'counter',
    icon: '🔢',
    label: 'Counter',
    description: 'Click counter with + and − buttons.',
    template: [
      pe('root', 'div', null, 0, '', {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '16px', padding: '32px', borderRadius: '16px',
        backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: 'fit-content',
        textAlign: 'center',
      }),
      pe('lbl', 'p', 'root', 0, 'COUNT', {
        fontSize: '11px', fontWeight: '600', color: '#94a3b8',
        margin: '0', lineHeight: '1', display: 'block',
        letterSpacing: '0.1em',
      }),
      pe('num', 'h2', 'root', 1, '0', {
        fontSize: '72px', fontWeight: '800', color: '#0f172a',
        margin: '0', lineHeight: '1', display: 'block',
      }, 'js-count'),
      pe('row', 'div', 'root', 2, '', {
        display: 'flex', gap: '12px', alignItems: 'center',
      }),
      pe('dec', 'button', 'row', 0, '−', {
        width: '48px', height: '48px', borderRadius: '50%',
        backgroundColor: '#f1f5f9', color: '#0f172a',
        border: '1px solid #e2e8f0', fontSize: '22px',
        cursor: 'pointer', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', lineHeight: '1',
      }, 'js-dec'),
      pe('inc', 'button', 'row', 1, '+', {
        width: '48px', height: '48px', borderRadius: '50%',
        backgroundColor: '#3b82f6', color: '#ffffff',
        border: 'none', fontSize: '22px',
        cursor: 'pointer', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', lineHeight: '1',
      }, 'js-inc'),
    ],
    code: `(function () {
  var display = document.querySelector('.js-count');
  var inc = document.querySelector('.js-inc');
  var dec = document.querySelector('.js-dec');
  if (!display || !inc || !dec) return;
  var count = 0;
  inc.addEventListener('click', function () {
    count++;
    display.textContent = count;
  });
  dec.addEventListener('click', function () {
    count--;
    display.textContent = count;
  });
})();`,
  },

  {
    id: 'show-hide',
    icon: '👁',
    label: 'Show / Hide',
    description: 'Button that toggles the visibility of a content block.',
    template: [
      pe('root', 'div', null, 0, '', {
        display: 'block', padding: '24px', borderRadius: '12px',
        backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
      }),
      pe('btn', 'button', 'root', 0, 'Hide Content', {
        padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#0f172a',
        border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px',
        fontWeight: '500', cursor: 'pointer', display: 'inline-block',
        marginBottom: '16px',
      }, 'js-toggle-btn'),
      pe('content', 'p', 'root', 1, 'This content can be shown or hidden. Click the button above to toggle it.', {
        fontSize: '15px', color: '#475569', lineHeight: '1.6',
        margin: '0', display: 'block', padding: '16px',
        backgroundColor: '#f8fafc', borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }, 'js-toggle-target'),
    ],
    code: `(function () {
  var btn = document.querySelector('.js-toggle-btn');
  var target = document.querySelector('.js-toggle-target');
  if (!btn || !target) return;
  btn.addEventListener('click', function () {
    var hidden = target.style.display === 'none';
    target.style.display = hidden ? '' : 'none';
    btn.textContent = hidden ? 'Hide Content' : 'Show Content';
  });
})();`,
  },

  {
    id: 'tabs',
    icon: '📑',
    label: 'Tabs',
    description: 'Two-panel tab switcher.',
    template: [
      pe('root', 'div', null, 0, '', {
        display: 'block', borderRadius: '12px', overflow: 'hidden',
        border: '1px solid #e2e8f0', backgroundColor: '#ffffff',
      }),
      pe('tabrow', 'div', 'root', 0, '', {
        display: 'flex', borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
      }),
      pe('tab1', 'button', 'tabrow', 0, 'Tab 1', {
        padding: '12px 24px', backgroundColor: 'transparent', color: '#3b82f6',
        border: 'none', borderBottom: '2px solid #3b82f6', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer', display: 'inline-block',
      }, 'js-tab-1'),
      pe('tab2', 'button', 'tabrow', 1, 'Tab 2', {
        padding: '12px 24px', backgroundColor: 'transparent', color: '#64748b',
        border: 'none', borderBottom: '2px solid transparent', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer', display: 'inline-block',
      }, 'js-tab-2'),
      pe('panel1', 'div', 'root', 1, 'Content for Tab 1. Replace with anything — text, images, forms, or other elements.', {
        padding: '24px', fontSize: '15px', color: '#475569', lineHeight: '1.6',
        display: 'block',
      }, 'js-panel-1'),
      pe('panel2', 'div', 'root', 2, 'Content for Tab 2. This panel is hidden until Tab 2 is clicked.', {
        padding: '24px', fontSize: '15px', color: '#475569', lineHeight: '1.6',
        display: 'none',
      }, 'js-panel-2'),
    ],
    code: `(function () {
  var t1 = document.querySelector('.js-tab-1');
  var t2 = document.querySelector('.js-tab-2');
  var p1 = document.querySelector('.js-panel-1');
  var p2 = document.querySelector('.js-panel-2');
  if (!t1 || !t2 || !p1 || !p2) return;
  function activate(i) {
    t1.style.borderBottom = i === 1 ? '2px solid #3b82f6' : '2px solid transparent';
    t2.style.borderBottom = i === 2 ? '2px solid #3b82f6' : '2px solid transparent';
    t1.style.color = i === 1 ? '#3b82f6' : '#64748b';
    t2.style.color = i === 2 ? '#3b82f6' : '#64748b';
    p1.style.display = i === 1 ? 'block' : 'none';
    p2.style.display = i === 2 ? 'block' : 'none';
  }
  t1.addEventListener('click', function () { activate(1); });
  t2.addEventListener('click', function () { activate(2); });
})();`,
  },

  {
    id: 'modal',
    icon: '🪟',
    label: 'Modal',
    description: 'Button that opens a popup dialog with an overlay backdrop.',
    template: [
      pe('trigger', 'div', null, 0, '', {
        display: 'inline-block', padding: '24px',
      }),
      pe('openBtn', 'button', 'trigger', 0, 'Open Modal', {
        padding: '12px 28px', backgroundColor: '#3b82f6', color: '#ffffff',
        border: 'none', borderRadius: '8px', fontSize: '15px',
        fontWeight: '600', cursor: 'pointer', display: 'inline-block',
      }, 'js-modal-open'),
      pe('overlay', 'div', null, 1, '', {
        display: 'none', position: 'fixed', top: '0', left: '0',
        width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center', justifyContent: 'center', zIndex: '1000',
      }, 'js-modal-overlay'),
      pe('box', 'div', 'overlay', 0, '', {
        backgroundColor: '#ffffff', borderRadius: '16px',
        padding: '40px', maxWidth: '480px', width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      }),
      pe('title', 'h3', 'box', 0, 'Modal Title', {
        fontSize: '22px', fontWeight: '700', color: '#0f172a',
        margin: '0 0 12px', display: 'block',
      }),
      pe('body', 'p', 'box', 1, 'This is the modal content. Add forms, details, confirmations, or anything else here.', {
        fontSize: '15px', color: '#475569', lineHeight: '1.6',
        margin: '0 0 28px', display: 'block',
      }),
      pe('closeBtn', 'button', 'box', 2, '× Close', {
        padding: '10px 24px', backgroundColor: '#f1f5f9', color: '#0f172a',
        border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px',
        fontWeight: '500', cursor: 'pointer', display: 'inline-block',
      }, 'js-modal-close'),
    ],
    code: `(function () {
  var overlay = document.querySelector('.js-modal-overlay');
  var openBtn = document.querySelector('.js-modal-open');
  var closeBtn = document.querySelector('.js-modal-close');
  if (!overlay || !openBtn) return;
  openBtn.addEventListener('click', function () {
    overlay.style.display = 'flex';
  });
  if (closeBtn) closeBtn.addEventListener('click', function () {
    overlay.style.display = 'none';
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.style.display = 'none';
  });
})();`,
  },

  {
    id: 'toast',
    icon: '🔔',
    label: 'Toast',
    description: 'Button that shows a floating notification toast, auto-dismisses after 3s.',
    template: [
      pe('trigger', 'div', null, 0, '', {
        display: 'inline-block', padding: '24px',
      }),
      pe('toastBtn', 'button', 'trigger', 0, '🔔 Notify', {
        padding: '10px 22px', backgroundColor: '#0f172a', color: '#f8fafc',
        border: 'none', borderRadius: '8px', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer', display: 'inline-block',
      }, 'js-toast-btn'),
      pe('toast', 'div', null, 1, '', {
        display: 'none', position: 'fixed', bottom: '24px', right: '24px',
        backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '10px',
        padding: '16px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        zIndex: '1000', maxWidth: '320px', width: 'auto',
      }, 'js-toast'),
      pe('msg', 'p', 'toast', 0, '✅ Done! Your action was successful.', {
        margin: '0 0 10px', display: 'block', fontWeight: '500',
        fontSize: '14px', lineHeight: '1.4',
      }),
      pe('dismiss', 'button', 'toast', 1, 'Dismiss', {
        padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.15)',
        color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
        display: 'inline-block',
      }, 'js-toast-close'),
    ],
    code: `(function () {
  var toast = document.querySelector('.js-toast');
  var openBtn = document.querySelector('.js-toast-btn');
  var closeBtn = document.querySelector('.js-toast-close');
  if (!toast || !openBtn) return;
  var timer;
  openBtn.addEventListener('click', function () {
    toast.style.display = 'block';
    clearTimeout(timer);
    timer = setTimeout(function () { toast.style.display = 'none'; }, 3000);
  });
  if (closeBtn) closeBtn.addEventListener('click', function () {
    toast.style.display = 'none';
    clearTimeout(timer);
  });
})();`,
  },
];
