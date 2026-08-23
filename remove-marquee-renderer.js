const fs = require('fs');
let content = fs.readFileSync('src/components/storefront/widget-renderer.tsx', 'utf8');

// Remove MarqueeAlerts from switch statement
content = content.replace(
  /case "MarqueeAlerts":[\s\S]*?<\/section>\s*\)/,
  `case "MarqueeAlerts":
      return null; // Rendered globally in layout.tsx`
);

fs.writeFileSync('src/components/storefront/widget-renderer.tsx', content, 'utf8');
console.log("Removed MarqueeAlerts from widget-renderer.");
