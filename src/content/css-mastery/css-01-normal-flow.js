export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-01-normal-flow',
  title: '01. The Normal Flow',
  slug: 'normal-flow',
  chapter: 'css-ch1',
  language: 'web',
  defaultTab: 'html',
  segments: [
    {
      id: 'intro',
      type: 'narration',
      text: 'CSS is not a programming language; it is a pattern matching rule engine. The browser first lays out your elements using a system called "Normal Flow".',
      files: {
        html: `<div class="box red">Box 1</div>\n<div class="box blue">Box 2</div>`,
        css: `body {\n  font-family: sans-serif;\n}\n\n.box {\n  padding: 20px;\n  color: white;\n  font-weight: bold;\n}\n\n.red {\n  background: #f43f5e;\n}\n\n.blue {\n  background: #3b82f6;\n}`,
        js: ''
      }
    },
    {
      id: 'block-vs-inline',
      type: 'narration',
      text: 'Notice how the boxes stack vertically? That is because <div> is a "block-level" element. It expands to fill the entire horizontal space available.',
      files: {
        html: `<div class="box red">Box 1</div>\n<div class="box blue">Box 2</div>\n<span class="badge">Inline 1</span>\n<span class="badge">Inline 2</span>`,
        css: `body {\n  font-family: sans-serif;\n}\n\n.box {\n  padding: 20px;\n  color: white;\n  font-weight: bold;\n}\n\n.red {\n  background: #f43f5e;\n}\n\n.blue {\n  background: #3b82f6;\n}\n\n.badge {\n  background: #10b981;\n  color: white;\n  padding: 5px 10px;\n  border-radius: 4px;\n}`,
        js: ''
      }
    },
    {
      id: 'inline-elements',
      type: 'narration',
      text: 'In contrast, <span> is an "inline" element. It only takes up as much width as its content needs, and allows other elements to sit next to it on the same line.',
    },
    {
      id: 'challenge-1',
      type: 'challenge',
      text: 'Challenge. Make the two <div> boxes behave like inline elements by changing their display property to "inline-block". Write your CSS in the CSS tab.',
      defaultTab: 'css',
      startFiles: {
        html: `<div class="box red">Box 1</div>\n<div class="box blue">Box 2</div>`,
        css: `body {\n  font-family: sans-serif;\n}\n\n.box {\n  padding: 20px;\n  color: white;\n  font-weight: bold;\n  /* Add your CSS here */\n}\n\n.red {\n  background: #f43f5e;\n}\n\n.blue {\n  background: #3b82f6;\n}`,
        js: ''
      },
      hint: 'Add `display: inline-block;` to the `.box` class.',
      validate: (ctx) => {
        return ctx.files?.css?.includes('display: inline-block') || ctx.files?.css?.includes('display:inline-block');
      }
    }
  ],
  checkpoints: [
    { id: 'intro', title: 'Normal Flow' },
    { id: 'challenge-1', title: 'Inline Block Challenge' }
  ]
};
