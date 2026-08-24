const fs = require('fs');

let c = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

c = c.replace(/z-\[100\]/g, 'z-[200]');
c = c.replace(/z-50/g, 'z-[210]');

fs.writeFileSync('src/components/storefront/header.tsx', c, 'utf8');
console.log("Updated header z-index");
