const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product/similar-products-carousel.tsx', 'utf8');

code = code.replace(
  /\[Autoplay\(\{ delay: 3000, stopOnInteraction: true \}\)\]/,
  '[Autoplay({ delay: 3000, stopOnInteraction: false })]'
);

fs.writeFileSync('src/components/storefront/product/similar-products-carousel.tsx', code);
console.log("Updated autoplay in similar products carousel");
