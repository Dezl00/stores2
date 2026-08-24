const fs = require('fs');

// Update ProductGrid
let gridCode = fs.readFileSync('src/components/storefront/product-grid.tsx', 'utf8');
gridCode = gridCode.replace(
  /const desktopCols = themeConfig\?\.headerSettings\?\.productCard\?\.desktopCols \|\| "4"/,
  'const desktopCols = themeConfig?.headerSettings?.productCard?.desktopCols || "5"'
);
fs.writeFileSync('src/components/storefront/product-grid.tsx', gridCode);

// Update Builder Sidebar
let sidebarCode = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace(
  /value=\{headerSettings\?\.productCard\?\.desktopCols \|\| "4"\}/,
  'value={headerSettings?.productCard?.desktopCols || "5"}'
);
fs.writeFileSync('src/app/builder/builder-sidebar.tsx', sidebarCode);

console.log("Updated default desktop columns to 5");
