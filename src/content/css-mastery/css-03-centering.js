export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-03-centering',
  title: '03. The Five Ways to Center',
  slug: 'centering',
  chapter: 'css-ch1',
  language: 'web',
  defaultTab: 'css',
  segments: [
    {
      id: 'intro',
      type: 'narration',
      text: "For a long time, centering things in CSS was famously frustrating. Let's look at the five ways to center an element, starting with the oldest and moving to the modern standard.",
      files: {
        html: `<div class="container">\n  <div class="box">Center Me</div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; }\n.container { height: 200px; background: #333; }\n.box { width: 100px; height: 100px; background: #f43f5e; padding: 10px; }`,
        js: ''
      }
    },
    {
      id: 'way-1-margin-auto',
      type: 'narration',
      text: 'Way 1: `margin: 0 auto;`. This works for **block-level** elements with a defined width. It tells the browser to split the remaining horizontal space evenly between the left and right margins.',
      files: {
        html: `<div class="container">\n  <div class="box">Center Me</div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; }\n.container { height: 200px; background: #333; }\n.box { \n  width: 100px; \n  height: 100px; \n  background: #f43f5e; \n  padding: 10px;\n  margin: 0 auto;\n}`,
        js: ''
      }
    },
    {
      id: 'way-1-limitations',
      type: 'narration',
      text: 'But notice it only centers horizontally. `margin: auto 0` does NOT work for vertical centering in normal flow.',
    },
    {
      id: 'way-2-text-align',
      type: 'narration',
      text: 'Way 2: `text-align: center`. This centers **inline** and **inline-block** elements (like text and buttons) within a block container. It does NOT center block elements.',
      files: {
        html: `<div class="container">\n  <button class="btn">Center Me</button>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; }\n.container { \n  height: 200px; \n  background: #333; \n  text-align: center;\n  padding-top: 20px;\n}\n.btn { \n  padding: 10px 20px; \n  background: #3b82f6; \n  color: white; \n  border: none; \n  border-radius: 4px; \n}`,
        js: ''
      }
    },
    {
      id: 'way-3-absolute',
      type: 'narration',
      text: 'Way 3: Absolute Positioning + Transform. You push the element down and right by 50% of the parent, then pull it back by 50% of its *own* size.',
      files: {
        html: `<div class="container">\n  <div class="box">Center Me</div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; }\n.container { \n  height: 200px; \n  background: #333; \n  position: relative;\n}\n.box { \n  width: 100px; \n  height: 100px; \n  background: #10b981; \n  padding: 10px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}`,
        js: ''
      }
    },
    {
      id: 'way-4-flexbox',
      type: 'narration',
      text: 'Way 4: Flexbox. This is the modern standard for 1D layouts. You turn the container into a flex context, and ask it to align items to the center on both axes.',
      files: {
        html: `<div class="container">\n  <div class="box">Center Me</div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; }\n.container { \n  height: 200px; \n  background: #333; \n  display: flex;\n  justify-content: center; /* Horizontal */\n  align-items: center; /* Vertical */\n}\n.box { \n  width: 100px; \n  height: 100px; \n  background: #8b5cf6; \n  padding: 10px;\n}`,
        js: ''
      }
    },
    {
      id: 'way-5-grid',
      type: 'narration',
      text: 'Way 5: CSS Grid. The absolute shortest way to perfectly center an item in modern CSS using a single line of alignment.',
      files: {
        html: `<div class="container">\n  <div class="box">Center Me</div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; }\n.container { \n  height: 200px; \n  background: #333; \n  display: grid;\n  place-items: center;\n}\n.box { \n  width: 100px; \n  height: 100px; \n  background: #f59e0b; \n  padding: 10px;\n}`,
        js: ''
      }
    },
    {
      id: 'challenge',
      type: 'challenge',
      text: 'Challenge. We have a modal window that needs to be perfectly centered in the screen. Use the Grid `place-items: center` trick on the `body`.',
      defaultTab: 'css',
      startFiles: {
        html: `<div class="modal">\n  <h2>Hello!</h2>\n  <p>I am a modal window.</p>\n</div>`,
        css: `body {\n  font-family: sans-serif;\n  background: #111;\n  color: white;\n  margin: 0;\n  height: 100vh;\n  /* Add your grid centering here */\n}\n\n.modal {\n  background: #222;\n  padding: 30px;\n  border-radius: 8px;\n  border: 1px solid #444;\n  box-shadow: 0 10px 30px rgba(0,0,0,0.5);\n}`,
        js: ''
      },
      hint: 'Add `display: grid;` and `place-items: center;` to the body selector.',
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return css.includes('display: grid') && css.includes('place-items: center');
      }
    }
  ],
  checkpoints: [
    { id: 'intro', title: 'Centering History' },
    { id: 'way-4-flexbox', title: 'Flexbox & Grid' },
    { id: 'challenge', title: 'Center Challenge' }
  ]
};
