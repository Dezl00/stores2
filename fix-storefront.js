const fs = require('fs');

// Fix utils import
let buyCode = fs.readFileSync('src/components/storefront/product/product-buy-section.tsx', 'utf8');
buyCode = buyCode.replace(/import \{ formatCurrency \} from '@\/lib\/utils'.*\n/, '');
fs.writeFileSync('src/components/storefront/product/product-buy-section.tsx', buyCode);

// Fix page.tsx
let pageCode = fs.readFileSync('src/app/(store)/product/[slug]/page.tsx', 'utf8');
// I'll just find `<AddToCartForm product={product as any} />` and remove it explicitly just in case it's still there.
pageCode = pageCode.replace(/<AddToCartForm product=\{product as any\} \/>/g, '');
fs.writeFileSync('src/app/(store)/product/[slug]/page.tsx', pageCode);

console.log("Fixed storefront errors");
