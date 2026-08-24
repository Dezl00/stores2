const fs = require('fs');
let m = fs.readFileSync('src/components/storefront/mobile-sidebar.tsx', 'utf8');
m = m.replace(/z-\[200\]/g, 'z-[300]');
fs.writeFileSync('src/components/storefront/mobile-sidebar.tsx', m, 'utf8');
console.log("Updated mobile sidebar z-index");
