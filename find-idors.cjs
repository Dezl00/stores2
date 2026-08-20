const fs = require('fs');
const path = require('path');

function scanDirectory(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            results = results.concat(scanDirectory(filePath));
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            results.push(filePath);
        }
    }
    return results;
}

const files = scanDirectory('src');
let issues = [];

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/\.delete\(\{\s*where:\s*\{\s*id\s*\}\s*\}\)/) || 
            line.match(/\.update\(\{\s*where:\s*\{\s*id\s*\},/)) {
            issues.push(`${file}:${i+1} -> ${line.trim()}`);
        }
    }
}
console.log(issues.join('\n'));
