const fs = require('fs');
const path = require('path');

function scanDir(dir, files) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath, files);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
}

const contentDir = path.join(__dirname, 'src', 'content');
const files = [];
scanDir(contentDir, files);

let updatedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Backgrounds
  content = content.replace(/(background(?:-color)?\s*:\s*)#fff(fff)?\b/gi, '$1var(--color-background-primary, #ffffff)');
  content = content.replace(/(background(?:-color)?\s*:\s*)#fafaf8\b/gi, '$1var(--color-background-secondary, #f8fafc)');
  content = content.replace(/(background(?:-color)?\s*:\s*)#f8fafc\b/gi, '$1var(--color-background-secondary, #f8fafc)');
  content = content.replace(/(background(?:-color)?\s*:\s*)#f1f5f9\b/gi, '$1var(--color-background-tertiary, #f1f5f9)');

  // Borders
  content = content.replace(/(border(?:-[a-z]+)?\s*:\s*(?:[^;]*?\s+)?)#e2e8f0\b/gi, '$1var(--color-border-primary, #e2e8f0)');
  content = content.replace(/(border(?:-[a-z]+)?\s*:\s*(?:[^;]*?\s+)?)#f0f0ee\b/gi, '$1var(--color-border-primary, #e2e8f0)');
  content = content.replace(/(border(?:-[a-z]+)?\s*:\s*(?:[^;]*?\s+)?)#cbd5e1\b/gi, '$1var(--color-border-secondary, #cbd5e1)');

  // Text
  content = content.replace(/(color\s*:\s*)#1e293b\b/gi, '$1var(--color-text-primary, #1e293b)');
  content = content.replace(/(color\s*:\s*)#374151\b/gi, '$1var(--color-text-primary, #1e293b)');
  content = content.replace(/(color\s*:\s*)#475569\b/gi, '$1var(--color-text-secondary, #475569)');
  content = content.replace(/(color\s*:\s*)#64748b\b/gi, '$1var(--color-text-secondary, #475569)');
  content = content.replace(/(color\s*:\s*)#9ca3af\b/gi, '$1var(--color-text-tertiary, #9ca3af)');

  // Special handle for Object literal properties like bg: '#fff' 
  // ONLY if they look like color props.
  content = content.replace(/(\b(?:bg|background|color|borderColor)\s*:\s*['"])#fff(fff)?['"]/gi, '$1var(--color-background-primary, #ffffff)"');
  content = content.replace(/(\b(?:bg|background)\s*:\s*['"])#fafaf8['"]/gi, '$1var(--color-background-secondary, #f8fafc)"');
  content = content.replace(/(\b(?:bg|background)\s*:\s*['"])#f8fafc['"]/gi, '$1var(--color-background-secondary, #f8fafc)"');
  content = content.replace(/(\b(?:color|textColor)\s*:\s*['"])#1e293b['"]/gi, '$1var(--color-text-primary, #1e293b)"');
  content = content.replace(/(\b(?:color|textColor)\s*:\s*['"])#374151['"]/gi, '$1var(--color-text-primary, #1e293b)"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFiles++;
  }
}

console.log(`Successfully mapped colors to CSS variables in ${updatedFiles} content files!`);
