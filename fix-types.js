const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-card.tsx', 'utf8');
code = code.replace(/description\?: string/, 'description?: string | null');
fs.writeFileSync('src/components/storefront/product-card.tsx', code);
