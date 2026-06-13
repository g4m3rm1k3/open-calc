export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-04-stacking-contexts',
  title: '04. Stacking Contexts & Z-Index',
  slug: 'stacking-contexts',
  chapter: 'css-ch1',
  language: 'web',
  defaultTab: 'css',
  segments: [
    {
      id: 'intro',
      type: 'narration',
      text: 'Have you ever tried to bring an element to the front by setting `z-index: 9999`, but it just refuses to go above another element? This happens because of Stacking Contexts.',
      files: {
        html: `<div class="box red">Red (z-index: 10)</div>\n<div class="box blue">Blue (No z-index)</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n.box { width: 150px; height: 100px; padding: 10px; font-weight: bold; }\n\n.red {\n  background: #f43f5e;\n  position: relative;\n  z-index: 10;\n}\n\n.blue {\n  background: #3b82f6;\n  position: relative;\n  margin-top: -50px;\n  margin-left: 50px;\n}`,
        js: ''
      }
    },
    {
      id: 'position-required',
      type: 'narration',
      text: 'Rule #1: `z-index` ONLY works on positioned elements (`relative`, `absolute`, `fixed`, or `sticky`). If an element is `position: static` (the default), `z-index` does nothing.',
    },
    {
      id: 'stacking-context',
      type: 'narration',
      text: 'Rule #2: The Stacking Context. Think of a stacking context like a folder of papers. You can reorder the papers inside the folder. But if Folder A is placed *under* Folder B, NO paper inside Folder A can ever sit on top of Folder B, even if that paper has `z-index: 999999`.',
      files: {
        html: `<div class="folder folder-a">\n  Folder A (z-index: 1)\n  <div class="paper high-z">Paper (z-index: 9999)</div>\n</div>\n\n<div class="folder folder-b">\n  Folder B (z-index: 2)\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n\n.folder {\n  position: relative;\n  padding: 10px;\n  border: 2px dashed #888;\n}\n\n.folder-a {\n  background: rgba(244, 63, 94, 0.2);\n  z-index: 1;\n}\n\n.folder-b {\n  background: rgba(59, 130, 246, 0.2);\n  z-index: 2;\n  margin-top: -30px;\n  margin-left: 50px;\n}\n\n.paper {\n  background: #f43f5e;\n  padding: 5px;\n  position: absolute;\n  top: 40px;\n  left: 20px;\n  z-index: 9999;\n  border: 1px solid white;\n}`,
        js: ''
      }
    },
    {
      id: 'the-fix',
      type: 'narration',
      text: 'See how the paper inside Folder A is stuck underneath Folder B? To fix this, you must look up the DOM tree and fix the `z-index` of the parent folder (the stacking context).',
      files: {
        html: `<div class="folder folder-a">\n  Folder A (z-index: 3)\n  <div class="paper high-z">Paper (z-index: 9999)</div>\n</div>\n\n<div class="folder folder-b">\n  Folder B (z-index: 2)\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n\n.folder {\n  position: relative;\n  padding: 10px;\n  border: 2px dashed #888;\n}\n\n.folder-a {\n  background: rgba(244, 63, 94, 0.2);\n  z-index: 3;\n}\n\n.folder-b {\n  background: rgba(59, 130, 246, 0.2);\n  z-index: 2;\n  margin-top: -30px;\n  margin-left: 50px;\n}\n\n.paper {\n  background: #f43f5e;\n  padding: 5px;\n  position: absolute;\n  top: 40px;\n  left: 20px;\n  z-index: 9999;\n  border: 1px solid white;\n}`,
        js: ''
      }
    },
    {
      id: 'what-creates-contexts',
      type: 'narration',
      text: 'Besides `position: relative/absolute` + `z-index`, other properties implicitly create stacking contexts too! E.g. `opacity < 1`, `transform`, `filter`, and `clip-path` will all trap their children in a new context.',
    },
    {
      id: 'challenge',
      type: 'challenge',
      text: 'Challenge. The "Tooltip" is stuck behind the header because the `.content` div has a lower `z-index` than the `.header`. Fix it by raising the `.content` z-index above the header (header is at z-index: 5).',
      defaultTab: 'css',
      startFiles: {
        html: `<div class="header">Header (z-index: 5)</div>\n\n<div class="content">\n  <div class="tooltip">I am a Tooltip!</div>\n  Content (z-index: 1)\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; margin: 0; }\n\n.header {\n  background: #333;\n  padding: 20px;\n  position: relative;\n  z-index: 5;\n  box-shadow: 0 5px 10px rgba(0,0,0,0.5);\n}\n\n.content {\n  background: #222;\n  padding: 20px;\n  height: 200px;\n  position: relative;\n  z-index: 1; /* Fix me! */\n  margin-top: -10px;\n}\n\n.tooltip {\n  position: absolute;\n  top: -20px;\n  left: 40px;\n  background: #10b981;\n  padding: 10px;\n  border-radius: 4px;\n  z-index: 999; /* Trapped! */\n}`,
        js: ''
      },
      hint: 'Change `.content` to have `z-index: 6` (or higher than 5).',
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const match = css.match(/\.content\s*\{[^}]*z-index:\s*(\d+)/);
        if (match && parseInt(match[1]) > 5) return true;
        return false;
      }
    }
  ],
  checkpoints: [
    { id: 'intro', title: 'Z-Index Rules' },
    { id: 'stacking-context', title: 'The Folders' },
    { id: 'challenge', title: 'Tooltip Challenge' }
  ]
};
