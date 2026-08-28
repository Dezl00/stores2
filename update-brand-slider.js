const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/brand-slider.tsx', 'utf8');

code = code.replace(
  /import Autoplay from "embla-carousel-autoplay"/g,
  'import AutoScroll from "embla-carousel-auto-scroll"'
);

code = code.replace(
  /\[Autoplay\(\{ delay: 3000, stopOnInteraction: false \}\)\]/g,
  '[AutoScroll({ playOnInit: true, speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })]'
);

fs.writeFileSync('src/components/storefront/widgets/brand-slider.tsx', code);
console.log("Updated brand slider to use AutoScroll");
