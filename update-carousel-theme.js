const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product/similar-products-carousel.tsx', 'utf8');

// We need to inject useUIStore and calculate flex basis
code = code.replace(
  /export function SimilarProductsCarousel\(\{ products \}: \{ products: any\[\] \}\) \{/,
  `import { useUIStore } from "@/store/ui-store"

export function SimilarProductsCarousel({ products }: { products: any[] }) {
  const { themeConfig } = useUIStore()
  const mobileCols = themeConfig?.headerSettings?.productCard?.mobileCols || "2"
  const desktopCols = themeConfig?.headerSettings?.productCard?.desktopCols || "5"

  const getFlexBasis = () => {
    let basis = ""
    
    // Mobile
    if (mobileCols === "1.5") basis += "flex-[0_0_75%] "
    else if (mobileCols === "1") basis += "flex-[0_0_100%] "
    else basis += "flex-[0_0_50%] "
    
    // Desktop
    if (desktopCols === "4") basis += "md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"
    else if (desktopCols === "5") basis += "md:flex-[0_0_33.33%] lg:flex-[0_0_25%] xl:flex-[0_0_20%]"
    else if (desktopCols === "6") basis += "md:flex-[0_0_33.33%] lg:flex-[0_0_25%] xl:flex-[0_0_20%] 2xl:flex-[0_0_16.66%]"
    else basis += "md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"

    return basis
  }`
);

code = code.replace(
  /className="flex-\[0_0_70%\] sm:flex-\[0_0_280px\] min-w-0"/g,
  'className={`${getFlexBasis()} min-w-0 px-2 sm:px-3`}'
);

// We need to remove the gap from the parent and rely on padding for embla carousel spacing
code = code.replace(
  /className="flex gap-4 sm:gap-6 pb-2"/,
  'className="flex pb-2 -ml-4 sm:-ml-6"' // Wait, better just keep gap if we can? No, embla handles gaps poorly if we use gap with flex basis %. Embla documentation recommends using padding on the slide and negative margin on the container.
);

fs.writeFileSync('src/components/storefront/product/similar-products-carousel.tsx', code);
console.log("Updated similar products carousel");
