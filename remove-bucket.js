const fs = require('fs');
let content = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

content = content.replace(
  /bucket="widgets"\s*/g,
  ''
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', content, 'utf8');
console.log("Removed bucket prop from ImageUploader.");
