const fs = require('fs');

// 1. Restore container padding to standard
let plcCode = fs.readFileSync('src/components/storefront/widgets/product-list-client.tsx', 'utf8');
plcCode = plcCode.replace(/container mx-auto px-2 sm:px-4 lg:px-6/g, 'container mx-auto px-4 sm:px-6 lg:px-8');
fs.writeFileSync('src/components/storefront/widgets/product-list-client.tsx', plcCode);

let fpcCode = fs.readFileSync('src/components/storefront/widgets/featured-products-client.tsx', 'utf8');
fpcCode = fpcCode.replace(/container mx-auto px-2 sm:px-4 lg:px-6/g, 'container mx-auto px-4 sm:px-6 lg:px-8');
fs.writeFileSync('src/components/storefront/widgets/featured-products-client.tsx', fpcCode);

// 2. Remove full-bleed from ProductGrid 1.5 mode so it respects the uniform side margins
let pgCode = fs.readFileSync('src/components/storefront/product-grid.tsx', 'utf8');
pgCode = pgCode.replace(
  /pb-4 -mx-4 px-4/g,
  'pb-4'
);
fs.writeFileSync('src/components/storefront/product-grid.tsx', pgCode);

console.log("Restored uniform side margins and removed full-bleed from 1.5 mode");
