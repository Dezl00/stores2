const fs = require('fs');
let code = fs.readFileSync('src/store/cart-store.ts', 'utf8');

// Add variantId to CartItem
code = code.replace(
  /productId: string\n  name: string/,
  'productId: string\n  variantId?: string\n  name: string'
);

// Update addItem logic to match on both productId AND variantId
// Original addItem typically looks like: const existingItem = state.items.find((i) => i.productId === item.productId)
code = code.replace(
  /const existingItem = state\.items\.find\(\(i\) => i\.productId === item\.productId\)/,
  'const existingItem = state.items.find((i) => i.productId === item.productId && i.variantId === item.variantId)'
);

fs.writeFileSync('src/store/cart-store.ts', code);
console.log("Updated cart store");
