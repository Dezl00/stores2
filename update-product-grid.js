const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-grid.tsx', 'utf8');

const oldDesktopLogic = `    // Desktop setup
    cls += "md:grid-cols-3 "
    cls += desktopCols === "4" ? "lg:grid-cols-4" : desktopCols === "5" ? "lg:grid-cols-5" : desktopCols === "6" ? "lg:grid-cols-6" : "lg:grid-cols-4"`;

const newDesktopLogic = `    // Desktop setup
    if (desktopCols === "4") {
      cls += "md:grid-cols-3 lg:grid-cols-4"
    } else if (desktopCols === "5") {
      cls += "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    } else if (desktopCols === "6") {
      cls += "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    } else {
      cls += "md:grid-cols-3 lg:grid-cols-4"
    }`;

code = code.replace(oldDesktopLogic, newDesktopLogic);

fs.writeFileSync('src/components/storefront/product-grid.tsx', code);
console.log("Updated ProductGrid desktop logic");
