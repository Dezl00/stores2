const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widget-renderer.tsx', 'utf8');

code = code.replace(/className=\{`w-full overflow-hidden \$\{visibilityClass\}`\}/g, 'className={`w-full ${visibilityClass}`}');

fs.writeFileSync('src/components/storefront/widget-renderer.tsx', code);
console.log("Removed overflow-hidden from section wrapper");
