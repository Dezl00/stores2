const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product/similar-products-carousel.tsx', 'utf8');

code = code.replace(
  /\[Autoplay\(\{ delay: 3000, stopOnInteraction: false \}\)\]/,
  '[Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]'
);

fs.writeFileSync('src/components/storefront/product/similar-products-carousel.tsx', code);
console.log("Added hover pause to similar products carousel");
