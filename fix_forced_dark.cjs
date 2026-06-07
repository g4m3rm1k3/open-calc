const fs = require('fs');
const path = require('path');

function scanDir(dir, files) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath, files);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
}

const files = [];
scanDir(path.join(__dirname, 'src', 'components', 'viz'), files);

let changedCount = 0;

for (const fullPath of files) {
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Backgrounds
  content = content.replace(/(?<!dark:)\bbg-slate-950(?![\\/\-]| dark:bg)/g, 'bg-slate-50 dark:bg-slate-950');
  content = content.replace(/(?<!dark:)\bbg-slate-900(?![\\/\-]| dark:bg)/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/(?<!dark:)\bbg-slate-800(?![\\/\-]| dark:bg)/g, 'bg-slate-100 dark:bg-slate-800');
  content = content.replace(/(?<!dark:)\bbg-slate-700(?![\\/\-]| dark:bg)/g, 'bg-slate-200 dark:bg-slate-700');
  
  // Texts
  content = content.replace(/(?<!dark:)\btext-slate-400(?![\\/\-]| dark:text)/g, 'text-slate-600 dark:text-slate-400');
  content = content.replace(/(?<!dark:)\btext-slate-300(?![\\/\-]| dark:text)/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/(?<!dark:)\btext-slate-200(?![\\/\-]| dark:text)/g, 'text-slate-800 dark:text-slate-200');
  content = content.replace(/(?<!dark:)\btext-slate-100(?![\\/\-]| dark:text)/g, 'text-slate-900 dark:text-slate-100');
  
  // Borders
  content = content.replace(/(?<!dark:)\bborder-slate-800(?![\\/\-]| dark:border)/g, 'border-slate-200 dark:border-slate-800');
  content = content.replace(/(?<!dark:)\bborder-slate-700(?![\\/\-]| dark:border)/g, 'border-slate-300 dark:border-slate-700');
  content = content.replace(/(?<!dark:)\bborder-slate-600(?![\\/\-]| dark:border)/g, 'border-slate-400 dark:border-slate-600');
  
  // text-white replacement
  // We process line by line to avoid replacing text-white on colored buttons.
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('text-white') && !line.includes('dark:text-white')) {
      const coloredBgRegex = /bg-(brand|blue|emerald|green|red|purple|indigo|rose|cyan|teal|orange|pink|yellow)-[4-9]00|bg-black|bg-transparent/;
      if (!coloredBgRegex.test(line)) {
        lines[i] = line.replace(/(?<!dark:)\btext-white(?![\\/\-]| dark:text)/g, 'text-slate-900 dark:text-white');
      }
    }
  }
  content = lines.join('\n');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    changedCount++;
    console.log("Updated: " + fullPath);
  }
}

console.log(`\nUpdated ${changedCount} files with forced dark mode fixes.`);
