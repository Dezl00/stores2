const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-grid.tsx', 'utf8');

code = code.replace(
  /const getGridClass = \(\) => \{[\s\S]*?\}\n\s+if \(!products/m,
  `const getGridClass = () => {
    let cls = "gap-4 sm:gap-6 "
    
    // Mobile setup
    if (mobileCols === "1.5") {
      cls += "flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 [&>div]:min-w-[75vw] [&>div]:snap-center md:grid md:[&>div]:min-w-0 md:mx-0 md:px-0 md:pb-0 "
    } else {
      cls += "grid "
      cls += mobileCols === "1" ? "grid-cols-1 " : "grid-cols-2 "
    }
    
    // Desktop setup
    cls += "md:grid-cols-3 "
    cls += desktopCols === "4" ? "lg:grid-cols-4" : desktopCols === "5" ? "lg:grid-cols-5" : desktopCols === "6" ? "lg:grid-cols-6" : "lg:grid-cols-4"
    
    return cls
  }

  if (!products`
);

fs.writeFileSync('src/components/storefront/product-grid.tsx', code);
console.log("Fixed grid logic properly");
