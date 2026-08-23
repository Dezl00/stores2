const fs = require('fs');
let content = fs.readFileSync('src/components/storefront/widget-renderer.tsx', 'utf8');

// Remove import
content = content.replace(/import \{ BannerGrid \} from "\.\/widgets\/banner-grid"\s*/g, '');

// Remove case block
content = content.replace(/case "BannerGrid":\s*return \(\s*<section className=\{`w-full py-16 \$\{visibilityClass\}`\}>\s*<BannerGrid widget=\{widget\} \/>\s*<\/section>\s*\)/g, '');

fs.writeFileSync('src/components/storefront/widget-renderer.tsx', content, 'utf8');
console.log("Removed BannerGrid from widget-renderer.");
