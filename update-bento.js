const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/promo-bento-grid.tsx', 'utf8');

if (!code.includes('import { ScrollReveal }')) {
  code = code.replace(
    'import { cn } from "@/lib/utils"',
    'import { cn } from "@/lib/utils"\nimport { ScrollReveal } from "@/components/ui/scroll-reveal"'
  );
}

// Wrap the main content mapped items in ScrollReveal
code = code.replace(
  /return \(\s*<div\s*key=\{item\.id\}/g,
  'return (\n              <ScrollReveal key={item.id} variant="fade-up" delay={0.1 * index}>\n                <div'
);

code = code.replace(
  /<\/div>\s*\)\s*\}\)\}\s*<\/div>/g,
  '</div>\n              </ScrollReveal>\n            )\n          })}\n        </div>'
);

// If there's a main title, wrap it
code = code.replace(
  /\{widget\.title && \(\s*<div className="mb-8 text-center">\s*<h2 className="text-2xl md:text-3xl font-bold text-foreground">\{widget\.title\}<\/h2>\s*<\/div>\s*\)\}/,
  '{widget.title && (\n          <ScrollReveal variant="fade-up" delay={0.1}>\n            <div className="mb-8 text-center">\n              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{widget.title}</h2>\n            </div>\n          </ScrollReveal>\n        )}'
);

fs.writeFileSync('src/components/storefront/widgets/promo-bento-grid.tsx', code);
console.log("Updated promo bento grid");
