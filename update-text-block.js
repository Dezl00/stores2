const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/text-block.tsx', 'utf8');

if (!code.includes('import { ScrollReveal }')) {
  code = code.replace(
    'import { getValidLink } from "@/lib/utils"',
    'import { getValidLink } from "@/lib/utils"\nimport { ScrollReveal } from "@/components/ui/scroll-reveal"'
  );
}

// Wrap image
code = code.replace(
  /\{hasImage && \(\s*<div className="w-full md:w-1\/2 shrink-0 md:p-6 lg:p-8">/,
  '{hasImage && (\n            <ScrollReveal variant="zoom-in" delay={0.2} className="w-full md:w-1/2 shrink-0 md:p-6 lg:p-8">'
);
code = code.replace(
  /<\/div>\s*\)\}\s*<div className="flex-1/,
  '</ScrollReveal>\n          )}\n\n          <div className="flex-1'
);

// Wrap content
code = code.replace(
  /<div className="flex-1 flex flex-col justify-center p-6 md:p-8">/,
  '<ScrollReveal variant="fade-up" delay={0.3} className="flex-1 flex flex-col justify-center p-6 md:p-8">'
);
code = code.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}/,
  '</ScrollReveal>\n        </div>\n      </div>\n    )\n  }'
);

fs.writeFileSync('src/components/storefront/widgets/text-block.tsx', code);
console.log("Updated text block");
