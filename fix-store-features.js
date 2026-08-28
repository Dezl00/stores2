const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/store-features.tsx', 'utf8');

code = code.replace(
  /stopOnInteraction: true/g,
  'stopOnInteraction: false'
);

code = code.replace(
  /<div className="flex justify-center gap-2 mt-8">/g,
  '<div className="flex justify-center gap-2 mt-8 md:hidden">'
);

fs.writeFileSync('src/components/storefront/widgets/store-features.tsx', code);
console.log("Updated store features dots and autoplay");
