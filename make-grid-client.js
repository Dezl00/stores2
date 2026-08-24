const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-grid.tsx', 'utf8');
if (!code.includes('"use client"')) {
  code = '"use client"\n' + code;
  code = code.replace(
    /import \{ ScrollReveal \} from "@\/components\/ui\/scroll-reveal"/,
    'import { ScrollReveal } from "@/components/ui/scroll-reveal"\nimport { useUIStore } from "@/store/ui-store"'
  );
  code = code.replace(
    /export function ProductGrid\(\{ products, title, subtitle \}: \{ products: any\[\], title\?: string, subtitle\?: string \}\) \{/,
    'export function ProductGrid({ products, title, subtitle }: { products: any[], title?: string, subtitle?: string }) {\n  const { themeConfig } = useUIStore()\n  const mobileCols = themeConfig?.headerSettings?.productCard?.mobileCols || "2"\n  const desktopCols = themeConfig?.headerSettings?.productCard?.desktopCols || "4"\n  \n  const getGridClass = () => {\n    let cls = "grid gap-4 sm:gap-6 "\n    cls += mobileCols === "1" ? "grid-cols-1 " : mobileCols === "1.5" ? "flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 child-w-[70vw] " : "grid-cols-2 "\n    cls += desktopCols === "4" ? "lg:grid-cols-4" : desktopCols === "5" ? "lg:grid-cols-5" : desktopCols === "6" ? "lg:grid-cols-6" : "lg:grid-cols-4"\n    return cls + (mobileCols !== "1.5" ? " md:grid-cols-3" : " md:grid md:grid-cols-3")\n  }'
  );
  code = code.replace(
    /<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">/,
    '<div className={getGridClass()}>'
  );
  fs.writeFileSync('src/components/storefront/product-grid.tsx', code);
  console.log("Updated ProductGrid to use client and cols settings.");
}
