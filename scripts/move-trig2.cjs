const fs = require('fs');

const trigFile = 'src/content/chapter-0/02-trig-review.js';
const geometryFile = 'src/content/chapter-0/00b-geometry-review.js';
const polarFile = 'src/content/chapter-6/01-polar-coordinates.js';

let trigContent = fs.readFileSync(trigFile, 'utf8');

// 1. Extract all TR videos
const videoRegex = /\{\s*id:\s*'VideoEmbed',\s*title:\s*"TR-\d+[A-Z]*[^"]+",\s*props:\s*\{\s*url:\s*"[^"]+"\s*\}\s*\},?\n?/g;

let matches;
let allVideos = [];
while ((matches = videoRegex.exec(trigContent)) !== null) {
    const fullText = matches[0];
    const numMatch = fullText.match(/TR-([0-9]+)/);
    if (numMatch) {
       allVideos.push({
           num: parseInt(numMatch[1], 10),
           code: fullText.trim().replace(/,$/, '') // strip trailing comma for cleaner injection
       });
    }
}

// 2. Remove all TR videos from 02-trig-review.js 
trigContent = trigContent.replace(videoRegex, '');

// Clean up any remaining empty `visualizations: []` left over
trigContent = trigContent.replace(/visualizations:\s*\[\s*\],?\n?/g, '');

// Categories
const geometryVideos = allVideos.filter(v => (v.num >= 0 && v.num <= 12) || (v.num >= 26 && v.num <= 31));
const polarVideos = allVideos.filter(v => v.num === 45 || v.num === 46);
const coreTrigVideos = allVideos.filter(v => (v.num >= 13 && v.num <= 25) || (v.num >= 32 && v.num <= 44));

function injectVideos(filePath, videoList) {
    if (videoList.length === 0) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Create the visualizations string
    const injectStr = `visualizations: [\n${videoList.map(v => '      ' + v.code).join(',\n')}\n    ],\n`;

    if (content.includes('visualizations: [')) {
        // If it already has an array, we want to inject stuff into it.
        // Actually, for simplicity if it already exists, let's just replace `visualizations: [` with `visualizations: [\n      ...`
        content = content.replace(/visualizations:\s*\[/, `visualizations: [\n${videoList.map(v => '      ' + v.code + ',').join('\n')}`);
    } else {
        // Standard inject right inside `intuition: {`
        content = content.replace(/intuition:\s*\{/, `intuition: {\n    ${injectStr}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected ${videoList.length} videos into ${filePath}`);
}

// 3. Write cleaned trig file first
fs.writeFileSync(trigFile, trigContent, 'utf8');

// 4. Inject
injectVideos(geometryFile, geometryVideos);
injectVideos(polarFile, polarVideos);
injectVideos(trigFile, coreTrigVideos);

console.log('Done!');
