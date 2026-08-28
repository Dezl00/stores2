const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/store-features.tsx', 'utf8');

if (!code.includes('import { ScrollReveal }')) {
  code = code.replace(
    'import Autoplay from "embla-carousel-autoplay"',
    'import Autoplay from "embla-carousel-autoplay"\nimport { ScrollReveal } from "@/components/ui/scroll-reveal"'
  );
}

code = code.replace(
  /const renderFeatureItem = \(item: any\) => \{/,
  'const renderFeatureItem = (item: any, index: number) => {'
);

code = code.replace(
  /return \(\s*<div key=\{item\.id\} className="flex flex-col items-center justify-center text-center group">/,
  'return (\n      <ScrollReveal key={item.id} variant="fade-up" delay={index * 0.1} duration={0.8}>\n        <div className="flex flex-col items-center justify-center text-center group">'
);

code = code.replace(
  /<\/div>\s*\)\s*\}\s*return \(/,
  '</div>\n      </ScrollReveal>\n    )\n  }\n\n  return ('
);

code = code.replace(
  /\{renderFeatureItem\(item\)\}/g,
  '{renderFeatureItem(item, index)}'
);

code = code.replace(
  /visibleItems\.map\(\(item\)/g,
  'visibleItems.map((item, index)'
);

fs.writeFileSync('src/components/storefront/widgets/store-features.tsx', code);
console.log("Updated store features");
