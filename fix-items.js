const fs = require('fs');

let c = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

c = c.replace('items: []', 'items: [{ id: `new-item-${Date.now()}`, title: "نص تجريبي للتنبيهات...", sortOrder: 0 }]');

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', c, 'utf8');
console.log("Fixed builder sidebar default items");
