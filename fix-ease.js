const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/promo-bento-grid.tsx', 'utf8');

code = code.replace(/ease: "easeOut"/g, 'ease: "easeOut" as const');

fs.writeFileSync('src/components/storefront/widgets/promo-bento-grid.tsx', code);
console.log("Fixed framer-motion ease type");
