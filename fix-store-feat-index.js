const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/store-features.tsx', 'utf8');

code = code.replace(
  /\{visibleItems\.map\(\(item, index\) => renderFeatureItem\(item\)\)\}/,
  '{visibleItems.map((item, index) => renderFeatureItem(item, index))}'
);

fs.writeFileSync('src/components/storefront/widgets/store-features.tsx', code);
console.log("Fixed store features index argument");
