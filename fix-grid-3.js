const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-grid.tsx', 'utf8');

const oldGridClassStr = `  const getGridClass = () => {
    let cls = "grid gap-4 sm:gap-6 "
    cls += mobileCols === "1" ? "grid-cols-1 " : mobileCols === "1.5" ? "flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 child-w-[70vw] " : "grid-cols-2 "
    cls += desktopCols === "4" ? "lg:grid-cols-4" : desktopCols === "5" ? "lg:grid-cols-5" : desktopCols === "6" ? "lg:grid-cols-6" : "lg:grid-cols-4"
    return cls + (mobileCols !== "1.5" ? " md:grid-cols-3" : " md:grid md:grid-cols-3")
  }`;

const newGridClassStr = `  const getGridClass = () => {
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
  }`;

code = code.replace(oldGridClassStr, newGridClassStr);

fs.writeFileSync('src/components/storefront/product-grid.tsx', code);
console.log("Fixed grid logic properly string");
