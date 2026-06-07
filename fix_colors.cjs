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

const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'indigo', 'pink', 'orange', 'teal', 'cyan', 'emerald', 'rose'];

let changedCount = 0;

for (const fullPath of files) {
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  for (const c of colors) {
    // Backgrounds
    content = content.replace(new RegExp(`(?<!dark:)\\bbg-${c}-50(?![\\/\\-]| dark:bg)`, 'g'), `bg-${c}-50 dark:bg-${c}-900/30`);
    content = content.replace(new RegExp(`(?<!dark:)\\bbg-${c}-100(?![\\/\\-]| dark:bg)`, 'g'), `bg-${c}-100 dark:bg-${c}-900/50`);
    content = content.replace(new RegExp(`(?<!dark:)\\bbg-${c}-200(?![\\/\\-]| dark:bg)`, 'g'), `bg-${c}-200 dark:bg-${c}-800/50`);
    
    // Hover Backgrounds
    content = content.replace(new RegExp(`(?<!dark:)\\bhover:bg-${c}-50(?![\\/\\-]| dark:hover:bg)`, 'g'), `hover:bg-${c}-50 dark:hover:bg-${c}-900/40`);
    content = content.replace(new RegExp(`(?<!dark:)\\bhover:bg-${c}-100(?![\\/\\-]| dark:hover:bg)`, 'g'), `hover:bg-${c}-100 dark:hover:bg-${c}-800/50`);
    
    // Text colors
    content = content.replace(new RegExp(`(?<!dark:)\\btext-${c}-600(?![\\/\\-]| dark:text)`, 'g'), `text-${c}-600 dark:text-${c}-400`);
    content = content.replace(new RegExp(`(?<!dark:)\\btext-${c}-700(?![\\/\\-]| dark:text)`, 'g'), `text-${c}-700 dark:text-${c}-300`);
    content = content.replace(new RegExp(`(?<!dark:)\\btext-${c}-800(?![\\/\\-]| dark:text)`, 'g'), `text-${c}-800 dark:text-${c}-300`);
    content = content.replace(new RegExp(`(?<!dark:)\\btext-${c}-900(?![\\/\\-]| dark:text)`, 'g'), `text-${c}-900 dark:text-${c}-200`);
    
    // Borders
    content = content.replace(new RegExp(`(?<!dark:)\\bborder-${c}-200(?![\\/\\-]| dark:border)`, 'g'), `border-${c}-200 dark:border-${c}-800/50`);
    content = content.replace(new RegExp(`(?<!dark:)\\bborder-${c}-300(?![\\/\\-]| dark:border)`, 'g'), `border-${c}-300 dark:border-${c}-700/50`);
    content = content.replace(new RegExp(`(?<!dark:)\\bborder-${c}-400(?![\\/\\-]| dark:border)`, 'g'), `border-${c}-400 dark:border-${c}-600/50`);
  }

  // Also fix any remaining text-black which could be in some places
  content = content.replace(/(?<!dark:)\btext-black(?![\\/\-]| dark:text)/g, 'text-black dark:text-white');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    changedCount++;
    console.log("Updated: " + fullPath);
  }
}

console.log(`\nUpdated ${changedCount} files with color fixes.`);
