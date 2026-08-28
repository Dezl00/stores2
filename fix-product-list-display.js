const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/product-list-client.tsx', 'utf8');

code = code.replace(
  /\{widget\.settings\?\.displayMode === 'carousel' \? \(/g,
  "{widget.settings?.displayMode !== 'grid' ? ("
);

fs.writeFileSync('src/components/storefront/widgets/product-list-client.tsx', code);
console.log("Updated product-list-client displayMode default");
