const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product/similar-products-carousel.tsx', 'utf8');

code = code.replace(
  /<div className="flex pb-2 -ml-4 sm:-ml-6">/,
  '<div className="flex pb-2 -mx-2 sm:-mx-3">'
);

fs.writeFileSync('src/components/storefront/product/similar-products-carousel.tsx', code);
console.log("Fixed carousel margins");
