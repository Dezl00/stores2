const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/latest-articles.tsx', 'utf8');

if (!code.includes('import { ScrollReveal }')) {
  code = code.replace(
    'import { ArrowLeft } from "lucide-react"',
    'import { ArrowLeft } from "lucide-react"\nimport { ScrollReveal } from "@/components/ui/scroll-reveal"'
  );
}

// title section
code = code.replace(
  /<div className="flex justify-between items-end mb-8">\s*<div>\s*<h2 className="text-2xl md:text-3xl font-bold">\{widget\.title\}<\/h2>/,
  '<ScrollReveal variant="fade-up" delay={0.1}>\n          <div className="flex justify-between items-end mb-8">\n            <div>\n              <h2 className="text-2xl md:text-3xl font-bold">{widget.title}</h2>'
);
code = code.replace(
  /<\/Link>\s*<\/div>/,
  '</Link>\n          </div>\n        </ScrollReveal>'
);

// articles
code = code.replace(
  /\{articles\.map\(\(article\)/,
  '{articles.map((article, index)'
);

code = code.replace(
  /<Link prefetch=\{false\}\s*key=\{article\.id\}\s*href=\{`\/blog\/\$\{article\.slug\}`\}/,
  '<ScrollReveal key={article.id} variant="fade-up" delay={0.2 + (index * 0.1)}>\n            <Link prefetch={false} \n              href={`/blog/${article.slug}`}'
);

code = code.replace(
  /<\/Link>\s*\)\)\}/,
  '</Link>\n            </ScrollReveal>\n          ))}'
);

fs.writeFileSync('src/components/storefront/widgets/latest-articles.tsx', code);
console.log("Updated latest articles");
