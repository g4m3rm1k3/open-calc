export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-02-box-model',
  title: '02. The Box Model & Sizing',
  slug: 'box-model',
  chapter: 'css-ch1',
  language: 'web',
  defaultTab: 'css',
  segments: [
    {
      id: 'intro',
      type: 'narration',
      text: 'Have you ever set an element to be 100% wide, added some padding, and watched it break out of its container and cause a horizontal scrollbar?',
      files: {
        html: `<div class="container">\n  <div class="box">I am exactly 100% wide... wait.</div>\n</div>`,
        css: `body {\n  font-family: sans-serif;\n  background: #111;\n  color: white;\n}\n\n.container {\n  width: 300px;\n  height: 200px;\n  background: #333;\n  border: 2px dashed #666;\n}\n\n.box {\n  width: 100%;\n  padding: 20px;\n  background: #f43f5e;\n}`,
        js: ''
      }
    },
    {
      id: 'the-problem',
      type: 'narration',
      text: 'Look at the red box. We told it to be 100% the width of its parent (which is 300px). But it is spilling out! Why?',
      files: {
        html: `<div class="container">\n  <div class="box">I am exactly 100% wide... wait.</div>\n</div>`,
        css: `body {\n  font-family: sans-serif;\n  background: #111;\n  color: white;\n}\n\n.container {\n  width: 300px;\n  height: 200px;\n  background: #333;\n  border: 2px dashed #666;\n}\n\n.box {\n  width: 100%;\n  padding: 20px;\n  background: #f43f5e;\n}`,
        js: ''
      }
    },
    {
      id: 'content-box',
      type: 'narration',
      text: 'By default, the web uses a sizing model called "content-box". When you set `width: 100%`, you are sizing the *content area*. Any padding or borders are added *on top* of that width.',
    },
    {
      id: 'math',
      type: 'narration',
      text: 'Math check: 100% of 300px = 300px. Add 20px padding left, 20px padding right. Total width = 340px! It literally cannot fit in the 300px container.',
    },
    {
      id: 'border-box',
      type: 'narration',
      text: 'We can fix this by changing the `box-sizing` property to `border-box`. This tells the browser: "When I say 100% wide, I mean *including* the padding and borders!"',
      files: {
        html: `<div class="container">\n  <div class="box">I am exactly 100% wide... wait.</div>\n</div>`,
        css: `body {\n  font-family: sans-serif;\n  background: #111;\n  color: white;\n}\n\n.container {\n  width: 300px;\n  height: 200px;\n  background: #333;\n  border: 2px dashed #666;\n}\n\n.box {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 20px;\n  background: #10b981;\n}`,
        js: ''
      }
    },
    {
      id: 'universal-reset',
      type: 'narration',
      text: 'This behavior is so useful that almost every modern website applies `box-sizing: border-box` to *every single element* using the universal selector `*`.',
      files: {
        html: `<div class="container">\n  <div class="box">I fit perfectly.</div>\n</div>`,
        css: `* {\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: sans-serif;\n  background: #111;\n  color: white;\n}\n\n.container {\n  width: 300px;\n  height: 200px;\n  background: #333;\n  border: 2px dashed #666;\n}\n\n.box {\n  width: 100%;\n  padding: 20px;\n  border: 5px solid white;\n  background: #3b82f6;\n}`,
        js: ''
      }
    },
    {
      id: 'challenge',
      type: 'challenge',
      text: 'Challenge. The blue box below is overflowing because of a thick border. Add the universal reset rule at the very top of the CSS file to fix it. Write `* { box-sizing: border-box; }`.',
      defaultTab: 'css',
      startFiles: {
        html: `<div class="container">\n  <div class="box">Fix my sizing!</div>\n</div>`,
        css: `/* Add the universal reset here */\n\nbody {\n  font-family: sans-serif;\n  background: #111;\n  color: white;\n}\n\n.container {\n  width: 300px;\n  height: 200px;\n  background: #333;\n  border: 2px dashed #666;\n}\n\n.box {\n  width: 100%;\n  padding: 20px;\n  border: 15px solid #3b82f6;\n  background: #1e3a8a;\n}`,
        js: ''
      },
      hint: 'Use the `*` selector and set `box-sizing: border-box;`.',
      validate: (ctx) => {
        return ctx.files?.css?.includes('box-sizing: border-box') || ctx.files?.css?.includes('box-sizing:border-box');
      }
    }
  ],
  checkpoints: [
    { id: 'intro', title: 'The Problem' },
    { id: 'border-box', title: 'Border Box' },
    { id: 'challenge', title: 'Universal Reset Challenge' }
  ]
};
