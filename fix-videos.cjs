const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (f.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // Regex to match the bad format
            // We need to match:
            // {
            //   type: "react",
            //   component: "VideoEmbed",
            //   params: {
            //     title: "...",
            //     url: "..."
            //   }
            // }
            
            const regex = /\{\s*type:\s*"react",\s*component:\s*"VideoEmbed",\s*params:\s*\{\s*title:\s*(".*?"|'.*?'|`.*?`)[,\s]*url:\s*(".*?"|'.*?'|`.*?`)\s*\}\s*\}/g;

            content = content.replace(regex, (match, title, url) => {
                modified = true;
                return `{\n        id: 'VideoEmbed',\n        title: ${title},\n        props: { url: ${url} }\n      }`;
            });
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed format in ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src', 'content'));
console.log('Fix script complete!');
