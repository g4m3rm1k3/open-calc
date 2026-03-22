const fs = require('fs');

const trigFile = 'src/content/chapter-0/02-trig-review.js';
let content = fs.readFileSync(trigFile, 'utf8');

const regex = /\{\s*id:\s*'VideoEmbed',\s*title:\s*"TR-\d+[A-Z]*[^"]+",\s*props:\s*\{\s*url:\s*"[^"]+"\s*\}\s*\},?\s*/g;

let matches;
let extracted = [];
while ((matches = regex.exec(content)) !== null) {
    extracted.push({
        fullText: matches[0],
        matchInfo: matches[0].match(/title:\s*"(TR-(\d+)[^"]+)"/)
    });
}
console.log('Extracted ' + extracted.length + ' TR videos');

if (extracted.length > 0) {
    console.log('Example: ', extracted[0].matchInfo[1]);
}
