const fs = require('fs');

// 1. Fix ProductList URL
let p = fs.readFileSync('src/components/storefront/widgets/product-list.tsx', 'utf8');
p = p.replace('buttonUrl: `/category/${cat.id}`', 'buttonUrl: `/category/${cat.slug || cat.id}`');
fs.writeFileSync('src/components/storefront/widgets/product-list.tsx', p, 'utf8');

// 2. Fix Builder Layout h-screen
let b = fs.readFileSync('src/app/builder/layout.tsx', 'utf8');
b = b.replace('className="min-h-screen bg-slate-50 admin-theme"', 'className="h-screen overflow-hidden bg-slate-50 admin-theme"');
fs.writeFileSync('src/app/builder/layout.tsx', b, 'utf8');

let c = fs.readFileSync('src/app/builder/builder-client.tsx', 'utf8');
c = c.replace('className="flex flex-col min-h-screen bg-slate-50"', 'className="flex flex-col h-full bg-slate-50"');
fs.writeFileSync('src/app/builder/builder-client.tsx', c, 'utf8');

// 3. Fix Mobile Sidebar Z-index
let m = fs.readFileSync('src/components/storefront/mobile-sidebar.tsx', 'utf8');
m = m.replace('z-[100]', 'z-[200]');
fs.writeFileSync('src/components/storefront/mobile-sidebar.tsx', m, 'utf8');

console.log("Fixed all issues");
