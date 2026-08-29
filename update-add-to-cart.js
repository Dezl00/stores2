const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/add-to-cart-form.tsx', 'utf8');

// Add variantId to AddToCartProps
code = code.replace(
  /export function AddToCartForm\(\{ product \}: AddToCartProps\) \{/,
  'export function AddToCartForm({ product, variantId }: AddToCartProps & { variantId?: string }) {'
);

// Add variantId to addItem call
code = code.replace(
  /quantity,\n\s*image: product\.images\[0\]\?\.url\n\s*\}, false\)/,
  'quantity,\n        image: product.images[0]?.url,\n        variantId\n      }, false)'
);

fs.writeFileSync('src/components/storefront/add-to-cart-form.tsx', code);
console.log("Updated AddToCartForm");
