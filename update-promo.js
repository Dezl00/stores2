const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/promo-banner.tsx', 'utf8');

if (!code.includes('import { ScrollReveal }')) {
  code = code.replace(
    "import { cn } from '@/lib/utils';",
    "import { cn } from '@/lib/utils';\nimport { ScrollReveal } from '@/components/ui/scroll-reveal';"
  );
}

code = code.replace(
  /\{title && <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">\{title\}<\/h2>\}/,
  '<ScrollReveal variant="fade-up" delay={0.1}>\n            {title && <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">{title}</h2>}\n          </ScrollReveal>'
);

code = code.replace(
  /\{subtitle && <p className="text-lg text-white\/90 leading-relaxed">\{subtitle\}<\/p>\}/,
  '<ScrollReveal variant="fade-up" delay={0.2}>\n            {subtitle && <p className="text-lg text-white/90 leading-relaxed">{subtitle}</p>}\n          </ScrollReveal>'
);

code = code.replace(
  /\{buttonText && hasLink && \(/,
  '<ScrollReveal variant="fade-up" delay={0.3}>\n          {buttonText && hasLink && ('
);

code = code.replace(
  /<\/div>\s*\)\}\s*<\/div>\s*\{isTimerActive/,
  '</div>\n          )}\n          </ScrollReveal>\n        </div>\n        \n        {isTimerActive'
);

code = code.replace(
  /\{isTimerActive && \(/,
  '{isTimerActive && (\n          <ScrollReveal variant="fade-left" delay={0.4}>'
);

code = code.replace(
  /<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*\);\s*\}\s*$/,
  '</div>\n          </ScrollReveal>\n        )}\n      </div>\n    </div>\n  );\n}\n'
);

fs.writeFileSync('src/components/storefront/widgets/promo-banner.tsx', code);
console.log("Updated promo banner");
