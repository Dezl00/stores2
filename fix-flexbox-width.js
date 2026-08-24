const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/category-product-grid.tsx', 'utf8');

code = code.replace(
  /const getCardWidthClass = \(\) => \{[\s\S]*?  \}/,
  `const getCardWidthClass = () => {
    if (viewMode === "list") {
      // 1 column on mobile, 3 on md, 4 on lg, 5 on xl
      // Mobile uses gap-2 (8px), sm+ uses gap-4 (16px)
      return "w-full md:w-[calc(33.33%-10.66px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12.8px)]"
    } else {
      // 2 columns on mobile, 3 on md, 4 on lg, 5 on xl
      return "w-[calc(50%-4px)] md:w-[calc(33.33%-10.66px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12.8px)]"
    }
  }`
);

fs.writeFileSync('src/components/storefront/category-product-grid.tsx', code);
console.log("Fixed flexbox width calculations");
