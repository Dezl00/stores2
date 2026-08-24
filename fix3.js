const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

const badStr = '</div\r\n              <div className="space-y-2">';
const badStr2 = '</div\n              <div className="space-y-2">';

if (c.includes(badStr)) {
    c = c.replace(badStr, '</div>\r\n              <div className="space-y-2">');
    console.log("Fixed CRLF");
} else if (c.includes(badStr2)) {
    c = c.replace(badStr2, '</div>\n              <div className="space-y-2">');
    console.log("Fixed LF");
} else {
    // Just find `</div` and fix it.
    const parts = c.split('</div');
    // The broken one is likely before `<div className="space-y-2">` and `overlayOpacity`
    for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i+1].trim().startsWith('<div className="space-y-2"')) {
             parts[i] = parts[i] + '</div>';
             parts[i+1] = parts[i+1]; // skip
             c = parts.join('');
             break;
        }
    }
    console.log("Fixed manually by split");
}
fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
