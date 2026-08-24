const fs = require('fs');
let code = fs.readFileSync('src/store/cart-store.ts', 'utf8');

code = code.replace(
  /addItem: \(newItem, openDrawer = true\) => \{/g,
  'addItem: (newItem, openDrawer = false) => {'
);

fs.writeFileSync('src/store/cart-store.ts', code);
console.log("Updated cart store auto-open default to false");
