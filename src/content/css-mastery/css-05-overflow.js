export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-05-overflow',
  title: '05. Content Boundaries and Overflow',
  slug: 'overflow',
  chapter: 'css-ch1',
  language: 'web',
  defaultTab: 'css',
  segments: [
    {
      id: 'intro',
      type: 'narration',
      text: 'What happens when content does not fit inside its container? By default, the browser allows content to "spill out" or overflow its boundaries so that data is never lost or hidden.',
      files: {
        html: `<div class="container">\n  <div class="box">\n    This is a lot of text that is going to spill out of the fixed height container because there is simply too much of it to fit in just fifty pixels!\n  </div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n.container { background: #333; padding: 20px; border: 2px dashed #666; }\n.box { \n  width: 200px; \n  height: 50px; /* Fixed height! */\n  background: #f43f5e; \n  padding: 10px; \n}`,
        js: ''
      }
    },
    {
      id: 'overflow-hidden',
      type: 'narration',
      text: 'We can use the `overflow` property to control this. Setting `overflow: hidden` will simply chop off any content that exceeds the box boundaries.',
      files: {
        html: `<div class="container">\n  <div class="box">\n    This is a lot of text that is going to spill out of the fixed height container because there is simply too much of it to fit in just fifty pixels!\n  </div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n.container { background: #333; padding: 20px; border: 2px dashed #666; }\n.box { \n  width: 200px; \n  height: 50px;\n  background: #f43f5e; \n  padding: 10px; \n  overflow: hidden; /* Chopped! */\n}`,
        js: ''
      }
    },
    {
      id: 'overflow-scroll',
      type: 'narration',
      text: 'Setting `overflow: auto` or `overflow: scroll` will add scrollbars to the container so the user can read the rest of the text without it breaking the layout.',
      files: {
        html: `<div class="container">\n  <div class="box">\n    This is a lot of text that is going to spill out of the fixed height container because there is simply too much of it to fit in just fifty pixels!\n  </div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n.container { background: #333; padding: 20px; border: 2px dashed #666; }\n.box { \n  width: 200px; \n  height: 50px;\n  background: #f43f5e; \n  padding: 10px; \n  overflow: auto; /* Scrolled! */\n}`,
        js: ''
      }
    },
    {
      id: 'text-overflow',
      type: 'narration',
      text: 'For single lines of text (like titles or usernames), we often want to add an ellipsis (...) instead of wrapping to a new line or adding a scrollbar.',
      files: {
        html: `<div class="container">\n  <div class="user-card">\n    <div class="username">ReallyLongUsernameThatBreaksTheLayout</div>\n  </div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n.container { background: #333; padding: 20px; border: 2px dashed #666; }\n.user-card { \n  width: 150px; \n  background: #222; \n  padding: 10px; \n  border-radius: 8px; \n}\n.username {\n  color: #10b981;\n  font-weight: bold;\n}`,
        js: ''
      }
    },
    {
      id: 'text-overflow-fix',
      type: 'narration',
      text: 'The "Ellipsis Trick" requires three properties: `white-space: nowrap` (to prevent wrapping), `overflow: hidden` (to cut it off), and `text-overflow: ellipsis` (to add the dots).',
      files: {
        html: `<div class="container">\n  <div class="user-card">\n    <div class="username">ReallyLongUsernameThatBreaksTheLayout</div>\n  </div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n.container { background: #333; padding: 20px; border: 2px dashed #666; }\n.user-card { \n  width: 150px; \n  background: #222; \n  padding: 10px; \n  border-radius: 8px; \n}\n.username {\n  color: #10b981;\n  font-weight: bold;\n  \n  /* The Ellipsis Trick */\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}`,
        js: ''
      }
    },
    {
      id: 'challenge',
      type: 'challenge',
      text: "Challenge. We have a card description that is too long. Let's make it scrollable vertically. Add `overflow-y: auto` to the `.description` class.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="card">\n  <h2>Product Name</h2>\n  <div class="description">\n    This is a super long product description. It just keeps going and going, detailing every single feature of the product, including things you probably don't even care about, but the marketing team insisted we add it anyway because more words equal more sales, right? Right?\n  </div>\n</div>`,
        css: `body { font-family: sans-serif; background: #111; color: white; padding: 20px; }\n\n.card {\n  width: 200px;\n  background: #333;\n  border-radius: 8px;\n  padding: 15px;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.3);\n}\n\nh2 { margin-top: 0; font-size: 1.2rem; color: #3b82f6; }\n\n.description {\n  height: 80px;\n  background: #222;\n  padding: 10px;\n  border-radius: 4px;\n  font-size: 0.9rem;\n  line-height: 1.5;\n  color: #ccc;\n  /* Add your overflow rule here */\n}`,
        js: ''
      },
      hint: 'Add `overflow-y: auto;` to `.description`.',
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return css.includes('overflow-y: auto') || css.includes('overflow: auto') || css.includes('overflow-y:auto');
      }
    }
  ],
  checkpoints: [
    { id: 'intro', title: 'Content Spilling' },
    { id: 'text-overflow', title: 'The Ellipsis Trick' },
    { id: 'challenge', title: 'Scroll Challenge' }
  ]
};
